'use client';

import React from 'react';
import type { SyncSessionFormData } from '@/lib/hooks/types';
import { SyncStepNav } from './SyncStepNav';

export function ConstraintsStep({ formData, updateFormData, nextStep, prevStep }: {
  formData: SyncSessionFormData;
  updateFormData: (data: Partial<SyncSessionFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        nextStep();
      }}
      className="space-y-6"
    >
      <div>
        <label htmlFor="constraints" className="sync-label">
          Constraints, blockers, or deadlines (optional)
        </label>
        <textarea
          id="constraints"
          data-testid="constraints-input"
          rows={4}
          value={formData.constraints ?? ''}
          onChange={(e) => updateFormData({ constraints: e.target.value })}
          className="sync-textarea"
          placeholder="Tools you cannot use, time limits, compliance boundaries…"
        />
      </div>
      <SyncStepNav onPrev={prevStep} />
    </form>
  );
}
