import { describe, expect, it } from 'vitest';
import { validateResolutionAgainstSpec } from '@/lib/clarification/resolve-validation';

describe('validateResolutionAgainstSpec', () => {
  it('accepts single_choice with one option', () => {
    const err = validateResolutionAgainstSpec(
      {
        kind: 'single_choice',
        prompt: 'Pick',
        options: [{ id: 'a', label: 'A' }],
      },
      { selectedOptionIds: ['a'] }
    );
    expect(err).toBeNull();
  });

  it('rejects single_choice with no selection', () => {
    const err = validateResolutionAgainstSpec(
      {
        kind: 'single_choice',
        prompt: 'Pick',
        options: [{ id: 'a', label: 'A' }],
      },
      {}
    );
    expect(err).not.toBeNull();
  });

  it('accepts text with non-empty freeText', () => {
    const err = validateResolutionAgainstSpec(
      { kind: 'text', prompt: 'Why?' },
      { freeText: 'Because.' }
    );
    expect(err).toBeNull();
  });

  it('accepts likert in range', () => {
    const err = validateResolutionAgainstSpec(
      {
        kind: 'likert',
        prompt: 'Rate',
        min: 1,
        max: 5,
      },
      { likertValue: 3 }
    );
    expect(err).toBeNull();
  });
});
