'use client';

import React from 'react';
import type { SyncSessionFormData } from '@/lib/hooks/types';
import { SyncStepNav } from './SyncStepNav';

export function IntentStep({ formData, updateFormData, nextStep, prevStep }: {
  formData: SyncSessionFormData;
  updateFormData: (data: Partial<SyncSessionFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}) {
  const [error, setError] = React.useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!formData.session_intent?.trim()) {
          setError('Please describe what you want to accomplish in this sync');
          return;
        }
        nextStep();
      }}
      className="space-y-6"
    >
      <div>
        <label htmlFor="session_intent" className="sync-label">
          What are you trying to accomplish in this sync?
        </label>
        <textarea
          id="session_intent"
          data-testid="session-intent-input"
          rows={3}
          value={formData.session_intent ?? ''}
          onChange={(e) => {
            setError(null);
            updateFormData({ session_intent: e.target.value });
          }}
          className="sync-textarea"
        />
        {error && <p className="sync-error" role="alert">{error}</p>}
      </div>
      <SyncStepNav onPrev={prevStep} />
    </form>
  );
}
