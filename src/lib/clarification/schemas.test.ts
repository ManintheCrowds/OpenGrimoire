import { describe, expect, it } from 'vitest';
import { clarificationAgentMetadataSchema, clarificationCreateBodySchema } from './schemas';

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

  it('accepts create body with parked metadata', () => {
    const parsed = clarificationCreateBodySchema.safeParse({
      question_spec: { kind: 'text', prompt: 'What is next focus after Sync?', multiline: true },
      agent_metadata: { blocking: false, project: 'OpenGrimoire' },
    });
    expect(parsed.success).toBe(true);
  });
});
