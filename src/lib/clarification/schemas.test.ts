import { describe, expect, it } from 'vitest';
import {
  clarificationAgentMetadataSchema,
  clarificationCreateBodySchema,
  likertScaleValues,
} from './schemas';

describe('clarificationAgentMetadataSchema parking fields', () => {
  it('accepts blocking false and project tag', () => {
    const parsed = clarificationAgentMetadataSchema.safeParse({
      blocking: false,
      project: 'MiscRepos',
      reason: 'Deferred until after Sync Session',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.blocking).toBe(false);
      expect(parsed.data.project).toBe('MiscRepos');
    }
  });

  it('rejects empty project', () => {
    const parsed = clarificationAgentMetadataSchema.safeParse({ project: '' });
    expect(parsed.success).toBe(false);
  });

  it('rejects a likert scale whose min is greater than max', () => {
    const parsed = clarificationCreateBodySchema.safeParse({
      question_spec: { kind: 'likert', prompt: 'Rate confidence', min: 10, max: 1 },
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts a likert scale with min equal to max', () => {
    const parsed = clarificationCreateBodySchema.safeParse({
      question_spec: { kind: 'likert', prompt: 'Rate confidence', min: 3, max: 3 },
    });
    expect(parsed.success).toBe(true);
  });

  it('does not build a negative likert point list', () => {
    expect(likertScaleValues(10, 1)).toBeNull();
    expect(likertScaleValues(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('accepts create body with parked metadata', () => {
    const parsed = clarificationCreateBodySchema.safeParse({
      question_spec: { kind: 'text', prompt: 'What is next focus after Sync?', multiline: true },
      agent_metadata: { blocking: false, project: 'OpenGrimoire' },
    });
    expect(parsed.success).toBe(true);
  });
});
