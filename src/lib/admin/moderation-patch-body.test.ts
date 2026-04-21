import { describe, expect, it } from 'vitest';

import { MODERATION_NOTES_MAX_LENGTH, moderationPatchBodySchema } from './moderation-patch-body';

describe('moderationPatchBodySchema', () => {
  it('accepts status without notes', () => {
    const p = moderationPatchBodySchema.safeParse({ status: 'approved' });
    expect(p.success).toBe(true);
  });

  it('accepts notes within max length', () => {
    const p = moderationPatchBodySchema.safeParse({
      status: 'pending',
      notes: 'a'.repeat(MODERATION_NOTES_MAX_LENGTH),
    });
    expect(p.success).toBe(true);
  });

  it('rejects notes longer than max', () => {
    const p = moderationPatchBodySchema.safeParse({
      status: 'rejected',
      notes: 'a'.repeat(MODERATION_NOTES_MAX_LENGTH + 1),
    });
    expect(p.success).toBe(false);
    if (!p.success) {
      const notesIssue = p.error.issues.find((i) => i.path[0] === 'notes');
      expect(notesIssue?.code).toBe('too_big');
    }
  });
});
