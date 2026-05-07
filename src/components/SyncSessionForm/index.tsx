"use client";

import { useSyncSessionForm } from '@/lib/hooks/useSyncSessionForm';
import { AttendeeStep } from './steps/AttendeeStep';
import { YearsStep } from './steps/YearsStep';
import { LearningStyleStep } from './steps/LearningStyleStep';
import { ShapedByStep } from './steps/ShapedByStep';
import { PeakPerformanceStep } from './steps/PeakPerformanceStep';
import { MotivationStep } from './steps/MotivationStep';
import { UniqueQualityStep } from './steps/UniqueQualityStep';
import { SuccessStep } from './steps/SuccessStep';
import '@/styles/brand.css';

const steps = [
  AttendeeStep,
  YearsStep,
  LearningStyleStep,
  ShapedByStep,
  PeakPerformanceStep,
  MotivationStep,
  UniqueQualityStep,
  SuccessStep,
];

const TOTAL_STEPS = steps.length;

export function SyncSessionForm() {
  const {
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
    recentRetries,
  } = useSyncSessionForm();

  const CurrentStepComponent = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const showRetry = errorKind === 'network' || errorKind === 'submission_5xx' || errorKind === 'rate_limit';

  return (
    <div className="min-h-screen bg-[var(--brand-atmospheric-white)]" data-testid="sync-session-form-container">
      <div className="max-w-xl w-full mx-auto px-0 pt-4 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--brand-navy-blue)] mb-2" style={{ fontFamily: 'Avenir Next World, sans-serif' }}>
            Sync Session
          </h1>
          <p className="text-[var(--brand-secondary-text)] text-sm mb-2" style={{ fontFamily: 'Avenir Next World, sans-serif' }}>
            A short alignment pass for turning human context into durable agent memory.
          </p>
        </div>

        {/* Progress: bar + step label for sighted users and AT */}
        <div className="mb-2" aria-live="polite" aria-atomic="true">
          <p className="text-center text-sm text-[var(--brand-secondary-text)] mb-1" id="sync-session-step-status">
            Step {currentStep + 1} of {TOTAL_STEPS}
          </p>
        </div>
        <div className="progress-bar" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-valuenow={currentStep + 1} aria-labelledby="sync-session-step-status">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Form Container */}
        <div className="form-container" data-testid="sync-session-form-steps">
          {error && (
            <div className="message message-error" role="alert">
              <p>{error}</p>
              {errorKind && (
                <p className="mt-2 text-xs opacity-90" data-testid="sync-session-error-kind">
                  Failure class: <code>{errorKind}</code>
                </p>
              )}
              <p className="mt-2 text-xs opacity-90">
                Operator checks: <code>/api/survey/bootstrap-token</code>, <code>/api/survey</code>, rate limit,
                and <code>OPENGRIMOIRE_DB_PATH</code>.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {showRetry && (
                  <button type="button" className="secondary-button" onClick={() => void submitForm()}>
                    Retry submit
                  </button>
                )}
                {errorKind === 'auth' || errorKind === 'bootstrap_token' ? (
                  <button type="button" className="secondary-button" onClick={() => window.location.reload()}>
                    Reload session
                  </button>
                ) : null}
                {errorKind === 'bootstrap_token' ? (
                  <button type="button" className="secondary-button" onClick={() => void fetchBootstrapToken()}>
                    Request new token
                  </button>
                ) : null}
              </div>
              <details className="mt-3 rounded border border-red-200 bg-white p-2 text-xs text-red-900">
                <summary className="cursor-pointer font-medium">Operator diagnostics</summary>
                <div className="mt-2 space-y-1" data-testid="sync-session-diagnostics-drawer">
                  <p>
                    Token status: <code>{bootstrapTokenStatus}</code>
                  </p>
                  <p>Recent retries (latest first):</p>
                  <ul className="list-disc pl-4">
                    {recentRetries.length === 0 ? (
                      <li>none</li>
                    ) : (
                      recentRetries.map((retry) => (
                        <li key={`${retry.ts}-${retry.status ?? 'none'}`}>
                          <code>{retry.ts}</code> status=<code>{retry.status ?? 'network'}</code>{' '}
                          requestId=<code>{retry.requestId ?? 'n/a'}</code>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </details>
            </div>
          )}

          <CurrentStepComponent
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            submitForm={submitForm}
            isSubmitting={isSubmitting}
            isLastStep={currentStep === steps.length - 2}
          />
        </div>
      </div>
    </div>
  );
}
