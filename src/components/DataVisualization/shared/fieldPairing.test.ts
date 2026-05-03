import { describe, expect, it } from 'vitest';
import { getFallbackFieldValue } from './fieldPairing';

const fields = [
  { value: 'tenure_years', label: 'Years of experience' },
  { value: 'learning_style', label: 'Learning Style' },
  { value: 'motivation', label: 'Motivation' },
];

describe('getFallbackFieldValue', () => {
  it('returns the first field that differs from the selected value', () => {
    expect(getFallbackFieldValue('tenure_years', fields)).toBe('learning_style');
  });

  it('skips the selected value when it is not first', () => {
    expect(getFallbackFieldValue('learning_style', fields)).toBe('tenure_years');
  });

  it('returns null when no distinct field is available', () => {
    expect(getFallbackFieldValue('only_field', [{ value: 'only_field', label: 'Only field' }])).toBeNull();
  });
});
