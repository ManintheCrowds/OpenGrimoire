import { describe, expect, it } from 'vitest';
import { brainMapNodeLabel } from './brainMapLabel';

describe('brainMapNodeLabel', () => {
  it('uses the file name from path without extension', () => {
    expect(brainMapNodeLabel({ id: 'n1', path: 'vault/projects/OpenGrimoire.md' })).toBe('OpenGrimoire');
  });
  it('handles windows separators and trailing slashes', () => {
    expect(brainMapNodeLabel({ id: 'n2', path: 'C:\\state\\handoff\\' })).toBe('handoff');
  });
  it('falls back to id when path is missing', () => {
    expect(brainMapNodeLabel({ id: 'state/decisions/log.json' })).toBe('log');
  });
  it('uses claim text for claim hubs and truncates long names', () => {
    const label = brainMapNodeLabel({
      id: 'claim:1',
      path: 'claims/1',
      insight_level: 'claim',
      claim_text: 'Agents must never read credential files or vault secrets',
    });
    expect(label.length).toBeLessThanOrEqual(32);
    expect(label.startsWith('Agents must never')).toBe(true);
    expect(label.endsWith('…')).toBe(true);
  });
});
