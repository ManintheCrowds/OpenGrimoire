import path from 'path';
import { describe, expect, it } from 'vitest';
import { toSafeWikiAbsPath } from './wikiMirror';

describe('toSafeWikiAbsPath', () => {
  const root = path.join(process.cwd(), '.wiki-mirror-test-root');

  it('allows normal nested markdown path', () => {
    const got = toSafeWikiAbsPath('Topics/Foo.md', root);
    expect(got).toBe(path.join(root, 'Topics', 'Foo.md'));
  });

  it('rejects parent traversal', () => {
    expect(toSafeWikiAbsPath('../etc/passwd', root)).toBeNull();
    expect(toSafeWikiAbsPath('Topics/../../.env', root)).toBeNull();
  });

  it('rejects lone parent segment', () => {
    expect(toSafeWikiAbsPath('..', root)).toBeNull();
  });
});
