'use client';

import React from 'react';
import type {
  ClarificationQuestionSpec,
  ClarificationResolution,
} from '@/lib/clarification/schemas';

export type DynamicQuestionPanelProps = {
  spec: ClarificationQuestionSpec;
  value: ClarificationResolution;
  onChange: (next: ClarificationResolution) => void;
  disabled?: boolean;
};

export function DynamicQuestionPanel({
  spec,
  value,
  onChange,
  disabled = false,
}: DynamicQuestionPanelProps) {
  const setSelected = (ids: string[]) => {
    onChange({ ...value, selectedOptionIds: ids });
  };

  const toggleMulti = (id: string) => {
    const cur = value.selectedOptionIds ?? [];
    if (cur.includes(id)) {
      setSelected(cur.filter((x) => x !== id));
    } else {
      setSelected([...cur, id]);
    }
  };

  return (
    <div className="space-y-4" data-testid="dynamic-question-panel">
      <p className="text-base font-medium text-gray-900 whitespace-pre-wrap">{spec.prompt}</p>

      {spec.kind === 'single_choice' && (
        <>
          <div className="grid grid-cols-1 gap-3">
            {spec.options.map((opt) => {
              const selected = value.selectedOptionIds?.[0] === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelected([opt.id])}
                  className={`p-3 text-left rounded-lg border-2 transition-colors ${
                    selected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
          {spec.allowFreeText && (
            <label className="block">
              <span className="text-sm text-gray-600">Or enter a short answer</span>
              <textarea
                className="mt-1 w-full border rounded p-2 text-sm"
                rows={3}
                disabled={disabled}
                value={value.freeText ?? ''}
                onChange={(e) =>
                  onChange({ ...value, freeText: e.target.value, selectedOptionIds: [] })
                }
                data-testid="clarification-free-text"
              />
            </label>
          )}
        </>
      )}

      {spec.kind === 'multi_choice' && (
        <div className="space-y-2">
          {spec.options.map((opt) => {
            const checked = (value.selectedOptionIds ?? []).includes(opt.id);
            return (
              <label
                key={opt.id}
                className="flex items-start gap-2 p-2 rounded border border-gray-200 cursor-pointer"
              >
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={checked}
                  onChange={() => toggleMulti(opt.id)}
                  className="mt-1"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}

      {spec.kind === 'text' && (
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={spec.multiline === false ? 2 : 5}
          disabled={disabled}
          value={value.freeText ?? ''}
          onChange={(e) => onChange({ ...value, freeText: e.target.value })}
          data-testid="clarification-text-answer"
        />
      )}

      {spec.kind === 'likert' && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            {spec.minLabel && (
              <span className="text-xs text-gray-500 w-full sm:w-auto">{spec.minLabel}</span>
            )}
            {Array.from({ length: (spec.max ?? 5) - (spec.min ?? 1) + 1 }, (_, i) => {
              const n = (spec.min ?? 1) + i;
              const selected = value.likertValue === n;
              return (
                <button
                  key={n}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange({ ...value, likertValue: n })}
                  className={`min-w-[2.5rem] px-3 py-2 rounded border-2 text-sm font-medium ${
                    selected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                  data-testid={`likert-${n}`}
                >
                  {n}
                </button>
              );
            })}
            {spec.maxLabel && (
              <span className="text-xs text-gray-500 w-full sm:w-auto">{spec.maxLabel}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
