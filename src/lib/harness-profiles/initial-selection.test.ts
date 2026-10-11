import { describe, expect, it } from 'vitest';
import { harnessProfileIdFromSelection } from './initial-selection';

const DRAFT = '11111111-1111-4111-8111-111111111111';
const DEFAULT_PROFILE = '22222222-2222-4222-8222-222222222222';

describe('harnessProfileIdFromSelection', () => {
  it('keeps a profile chosen before the selection response arrives', () => {
    expect(harnessProfileIdFromSelection(DRAFT, DEFAULT_PROFILE)).toBeUndefined();
  });

  it('applies the server default only when the form has no profile yet', () => {
    expect(harnessProfileIdFromSelection(undefined, DEFAULT_PROFILE)).toBe(DEFAULT_PROFILE);
  });

  it('does not apply a blank server selection', () => {
    expect(harnessProfileIdFromSelection(undefined, '  ')).toBeUndefined();
    expect(harnessProfileIdFromSelection(undefined, undefined)).toBeUndefined();
  });
});
