"use client";

import React, { useState } from 'react';
import type { SyncSessionFormData, SyncSessionSuccessIds } from '@/lib/hooks/useSyncSessionForm';
import { ParkingLotPanel } from '../ParkingLotPanel';

interface SuccessStepProps {
  formData: SyncSessionFormData;
  successIds?: SyncSessionSuccessIds | null;
}

async function copyText(value: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fall through */
  }
  return false;
}

function IdRow({
  label,
  value,
  testId,
}: {
  label: string;
  value: string;
  testId: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const ok = await copyText(value);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex flex-col gap-1 rounded-md border border-gray-200 bg-white p-3 text-left dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-0.5 break-all font-mono text-sm text-gray-900 dark:text-gray-100" data-testid={testId}>
          {value}
        </p>
      </div>
      <button
        type="button"
        className="secondary-button mt-2 shrink-0 sm:mt-0"
        onClick={() => void onCopy()}
        aria-label={`Copy ${label}`}
        data-testid={`${testId}-copy`}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

export function SuccessStep({ formData, successIds }: SuccessStepProps) {
  return (
    <div className="text-center" data-testid="success-step">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
        <svg
          className="h-6 w-6 text-green-600 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>
      <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Thank you for your contribution!
      </h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
        {formData.is_anonymous
          ? 'Your anonymous response has been recorded.'
          : `Thank you, ${formData.first_name}! Your response has been recorded.`}
      </p>

      {successIds ? (
        <div className="mt-6 space-y-2 text-left" data-testid="success-handoff-ids">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Handoff IDs</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Paste into harness session snapshot / handoff. Field meanings:{' '}
            <code className="text-[0.7rem]">docs/agent/SYNC_SESSION_HANDOFF.md</code> §6–§8.
          </p>
          <IdRow label="attendeeId" value={successIds.attendeeId} testId="success-attendee-id" />
          <IdRow
            label="surveyResponseId"
            value={successIds.surveyResponseId}
            testId="success-survey-response-id"
          />
          {successIds.harnessProfileId ? (
            <IdRow
              label="harnessProfileId"
              value={successIds.harnessProfileId}
              testId="success-harness-profile-id"
            />
          ) : null}
        </div>
      ) : null}

      <ParkingLotPanel />

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-300">
        Your insights will help us better understand and visualize the diverse
        perspectives and experiences within our community.
      </p>
      {formData.unique_quality && (
        <div className="mt-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Your unique quality or perspective will be reviewed before being
            included in the visualization:
          </p>
          <p className="mt-2 text-sm italic text-gray-800 dark:text-gray-100">
            &quot;{formData.unique_quality}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
