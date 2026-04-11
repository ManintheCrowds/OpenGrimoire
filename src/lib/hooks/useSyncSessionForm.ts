import { useEffect, useRef, useState } from 'react';
import type { SyncSessionFormData } from './types';

export type { SyncSessionFormData } from './types';

const DRAFT_KEY = 'opengrimoire.syncSession.v1';
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
    if (parsed.v !== 1 || typeof parsed.currentStep !== 'number') return null;
    if (parsed.currentStep < 0 || parsed.currentStep > LAST_FORM_STEP_INDEX) return null;
    return { currentStep: parsed.currentStep, formData: parsed.formData ?? {} };
  } catch {
    return null;
  }
}

/** Body shape for `POST /api/survey` (survey API unchanged). */
function buildSyncSessionPostBody(formData: SyncSessionFormData) {
  const lastName = formData.last_name?.trim() || '—';
  const answers = [
    { questionId: 'tenure_years', answer: String(formData.tenure_years ?? 0) },
    { questionId: 'learning_style', answer: formData.learning_style ?? '' },
    { questionId: 'shaped_by', answer: formData.shaped_by ?? '' },
    { questionId: 'peak_performance', answer: formData.peak_performance ?? '' },
    { questionId: 'motivation', answer: formData.motivation ?? '' },
    { questionId: 'unique_quality', answer: formData.unique_quality ?? '' },
  ];
  return {
    firstName: formData.first_name,
    lastName,
    email: formData.is_anonymous ? '' : formData.email ?? '',
    isAnonymous: formData.is_anonymous,
    sessionType: 'profile',
    questionnaireVersion: 'v1',
    answers,
    harnessProfileId: formData.harness_profile_id,
  };
}

export function useSyncSessionForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SyncSessionFormData>({
    first_name: '',
    is_anonymous: false,
  });
  const [hydrated, setHydrated] = useState(false);
  const postTokenRef = useRef<string | null>(null);

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
      try {
        const res = await fetch('/api/survey/bootstrap-token');
        if (!res.ok) return;
        const data = (await res.json()) as { token?: string | null };
        if (!cancelled && data.token) postTokenRef.current = data.token;
      } catch {
        /* ignore */
      }
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
        JSON.stringify({ v: 1, currentStep, formData })
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

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (postTokenRef.current) {
        headers['x-survey-post-token'] = postTokenRef.current;
      }

      const res = await fetch('/api/survey', {
        method: 'POST',
        headers,
        body: JSON.stringify(buildSyncSessionPostBody(formData)),
      });

      const payload = (await res.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
        issues?: unknown;
      };

      if (!res.ok) {
        if (res.status === 409 && payload.message) {
          setError(payload.message);
        } else if (payload.message) {
          setError(payload.message);
        } else if (payload.error === 'Validation failed') {
          setError('Please check your answers and try again.');
        } else {
          setError('An error occurred while submitting the form');
        }
        return;
      }

      nextStep();
    } catch (err) {
      console.error('Sync Session submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    formData,
    isSubmitting,
    error,
    updateFormData,
    nextStep,
    prevStep,
    submitForm,
  };
}
