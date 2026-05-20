'use client';

import React from 'react';
import type { SyncSessionFormData } from '@/lib/hooks/types';
import { WORKING_STYLE_OPTIONS } from '@/lib/survey/sync-session-v2-questions';
import { SyncStepNav } from './SyncStepNav';

export function WorkingStyleStep({ formData, updateFormData, nextStep, prevStep }: {
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
        if (!formData.working_style) {
          setError('Please select a working style');
          return;
        }
        nextStep();
      }}
      className="space-y-6"
    >
      <div>
        <p className="sync-label">How do you work best with agents and collaborators?</p>
        <div className="grid grid-cols-1 gap-4 mt-4">
          {WORKING_STYLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              data-testid={`working-style-${option.value}`}
              onClick={() => {
                setError(null);
                updateFormData({ working_style: option.value });
              }}
              className={`p-4 text-left rounded-lg border-2 transition-colors ${
                formData.working_style === option.value
                  ? 'border-[var(--brand-electric-blue)] bg-blue-50 dark:bg-blue-950/40'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{option.description}</div>
            </button>
          ))}
        </div>
        {error && <p className="sync-error mt-2" role="alert">{error}</p>}
      </div>
      <SyncStepNav onPrev={prevStep} />
    </form>
  );
}
