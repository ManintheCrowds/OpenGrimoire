import { describe, expect, it } from 'vitest';
import {
  alignmentContextPatchBodySchema,
  alignmentContextPublicPatchBodySchema,
} from '@/lib/alignment-context/schemas';

describe('alignmentContextPublicPatchBodySchema', () => {
  it('rejects source (provenance is admin-only)', () => {
    const parsed = alignmentContextPublicPatchBodySchema.safeParse({
      title: 'x',
      source: 'api',
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts mutable fields without source', () => {
    const parsed = alignmentContextPublicPatchBodySchema.safeParse({
      title: 'Only title',
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual({ title: 'Only title' });
  });
});

describe('alignmentContextPatchBodySchema', () => {
  it('accepts optional source for admin BFF PATCH', () => {
    const parsed = alignmentContextPatchBodySchema.safeParse({
      source: 'import',
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data).toEqual({ source: 'import' });
  });

  it('rejects invalid source enum', () => {
    const parsed = alignmentContextPatchBodySchema.safeParse({
      source: 'harness',
    });
    expect(parsed.success).toBe(false);
  });
});
