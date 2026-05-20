'use client';

import React from 'react';
import type { SyncSessionFormData } from '@/lib/hooks/types';
import { SyncStepNav } from './SyncStepNav';

export function ContextStep({ formData, updateFormData, nextStep, prevStep }: {
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
        if (!formData.session_context?.trim()) {
          setError('Please share context the agent should know');
          return;
        }
        nextStep();
      }}
      className="space-y-6"
    >
      <div>
        <label htmlFor="session_context" className="sync-label">
          What should the agent know about your situation?
        </label>
        <textarea
          id="session_context"
          data-testid="session-context-input"
          rows={5}
          value={formData.session_context ?? ''}
          onChange={(e) => {
            setError(null);
            updateFormData({ session_context: e.target.value });
          }}
          className="sync-textarea"
        />
        {error && <p className="sync-error" role="alert">{error}</p>}
      </div>
      <SyncStepNav onPrev={prevStep} />
    </form>
  );
}
