import { useEffect, useRef, useState } from 'react';
import { dispatchSurveyDataChanged } from '@/lib/survey/survey-data-change-event';
import {
  classifySyncSessionErrorKind,
  isLikelyNetworkFetchError,
  SYNC_SESSION_NETWORK_ERROR_MESSAGE,
  syncSessionSubmitUserMessage,
  type SyncSessionErrorKind,
  type SurveySubmitErrorPayload,
} from '@/lib/survey/sync-session-submit-user-message';
import { SYNC_SESSION_QUESTIONNAIRE_VERSION } from '@/lib/survey/sync-session-v2-questions';
import { parseBootstrapTokenResponse } from '@/lib/survey/sync-session-bootstrap';
import {
  parseSyncSessionSuccessIds,
  type SyncSessionSuccessIds,
} from '@/lib/survey/sync-session-success-ids';
import type { SyncSessionFormData } from './types';

export type { SyncSessionFormData } from './types';
export type { SyncSessionSuccessIds } from '@/lib/survey/sync-session-success-ids';

const DRAFT_KEY = 'opengrimoire.syncSession.v2';
/** Last form step index before Success (0-based). Success step clears draft. */
const LAST_FORM_STEP_INDEX = 6;

function loadDraft(): { currentStep: number; formData: Partial<SyncSessionFormData> } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      v?: number;
      currentStep?: number;
      formData?: Partial<SyncSessionFormData>;
    };
    if ((parsed.v !== 1 && parsed.v !== 2) || typeof parsed.currentStep !== 'number') return null;
    if (parsed.currentStep < 0 || parsed.currentStep > LAST_FORM_STEP_INDEX) return null;
    return { currentStep: parsed.currentStep, formData: parsed.formData ?? {} };
  } catch {
    return null;
  }
}

/** Body shape for `POST /api/survey`. */
function buildSyncSessionPostBody(formData: SyncSessionFormData) {
  const lastName = formData.last_name?.trim() || '—';
  const answers = [
    { questionId: 'session_intent', answer: formData.session_intent ?? '' },
    { questionId: 'session_context', answer: formData.session_context ?? '' },
    { questionId: 'shaped_by', answer: formData.shaped_by ?? '' },
    { questionId: 'working_style', answer: formData.working_style ?? '' },
    { questionId: 'constraints', answer: formData.constraints ?? '' },
    { questionId: 'unique_quality', answer: formData.unique_quality ?? '' },
  ];
  return {
    firstName: formData.first_name,
    lastName,
    email: formData.is_anonymous ? '' : formData.email ?? '',
    isAnonymous: formData.is_anonymous,
    sessionType: 'profile',
    questionnaireVersion: SYNC_SESSION_QUESTIONNAIRE_VERSION,
    answers,
    harnessProfileId: formData.harness_profile_id,
  };
}

export function useSyncSessionForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<SyncSessionErrorKind | null>(null);
  const [formData, setFormData] = useState<SyncSessionFormData>({
    first_name: '',
    is_anonymous: false,
  });
  const [hydrated, setHydrated] = useState(false);
  const [bootstrapTokenStatus, setBootstrapTokenStatus] = useState<'idle' | 'ok' | 'failed'>('idle');
  const [bootstrapRequired, setBootstrapRequired] = useState(false);
  const [successIds, setSuccessIds] = useState<SyncSessionSuccessIds | null>(null);
  const [recentRetries, setRecentRetries] = useState<Array<{ ts: string; status: number | null; requestId?: string }>>([]);
  const postTokenRef = useRef<string | null>(null);
  const bootstrapAttemptedRef = useRef(false);
  const bootstrapRequiredRef = useRef(false);

  const fetchBootstrapToken = async () => {
    bootstrapAttemptedRef.current = true;
    try {
      const res = await fetch('/api/survey/bootstrap-token');
      if (!res.ok) {
        setBootstrapTokenStatus('failed');
        return;
      }
      const data = (await res.json()) as {
        token?: string | null;
        required?: boolean;
        expiresIn?: number | null;
      };
      const parsed = parseBootstrapTokenResponse(data);
      if (parsed.status === 'ok') {
        bootstrapRequiredRef.current = parsed.required;
        setBootstrapRequired(parsed.required);
        postTokenRef.current = parsed.token;
        setBootstrapTokenStatus('ok');
      } else {
        const required =
          data.required === true || (data.required !== false && data.expiresIn != null);
        bootstrapRequiredRef.current = required;
        setBootstrapRequired(required);
        setBootstrapTokenStatus('failed');
      }
    } catch {
      setBootstrapTokenStatus('failed');
    }
  };

  useEffect(() => {
    const d = loadDraft();
    if (d) {
      setCurrentStep(d.currentStep);
      setFormData((prev) => ({ ...prev, ...d.formData }));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await fetchBootstrapToken();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (currentStep > LAST_FORM_STEP_INDEX) {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ v: 2, currentStep, formData })
      );
    } catch {
      /* quota */
    }
  }, [formData, currentStep, hydrated]);

  const updateFormData = (data: Partial<SyncSessionFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const submitForm = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setErrorKind(null);

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (
        bootstrapAttemptedRef.current &&
        bootstrapTokenStatus === 'failed' &&
        bootstrapRequiredRef.current
      ) {
        setErrorKind('bootstrap_token');
        setError('Submission token setup failed before submit. Request a new token and retry.');
        return;
      }
      if (postTokenRef.current) {
        headers['x-survey-post-token'] = postTokenRef.current;
      }

      const res = await fetch('/api/survey', {
        method: 'POST',
        headers,
        body: JSON.stringify(buildSyncSessionPostBody(formData)),
      });

      let payload: SurveySubmitErrorPayload = {};
      try {
        payload = (await res.json()) as SurveySubmitErrorPayload;
      } catch {
        if (!res.ok) {
          setErrorKind(classifySyncSessionErrorKind(res.status, {}));
          setError(
            syncSessionSubmitUserMessage(res.status, {}, {
              retryAfterSeconds: res.headers.get('Retry-After'),
            })
          );
          return;
        }
        setError('An error occurred while submitting the form');
        return;
      }

      if (!res.ok) {
        setRecentRetries((prev) => [
          { ts: new Date().toISOString(), status: res.status, requestId: res.headers.get('x-request-id') ?? undefined },
          ...prev,
        ].slice(0, 5));
        setErrorKind(classifySyncSessionErrorKind(res.status, payload));
        setError(
          syncSessionSubmitUserMessage(res.status, payload, {
            retryAfterSeconds: res.status === 429 ? res.headers.get('Retry-After') : null,
          })
        );
        return;
      }

      const ids = parseSyncSessionSuccessIds(payload);
      if (!ids) {
        setErrorKind('unknown');
        setError('Submission succeeded but handoff IDs were missing. Check the response and try again.');
        return;
      }

      setSuccessIds(ids);
      dispatchSurveyDataChanged('survey-post');
      nextStep();
    } catch (err) {
      console.error('Sync Session submission error:', err);
      if (isLikelyNetworkFetchError(err)) {
        setErrorKind('network');
        setError(SYNC_SESSION_NETWORK_ERROR_MESSAGE);
      } else {
        setErrorKind('unknown');
        setError(err instanceof Error ? err.message : 'An error occurred while submitting the form');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    formData,
    isSubmitting,
    error,
    errorKind,
    updateFormData,
    nextStep,
    prevStep,
    submitForm,
    fetchBootstrapToken,
    bootstrapTokenStatus,
    bootstrapRequired,
    successIds,
    recentRetries,
  };
}
