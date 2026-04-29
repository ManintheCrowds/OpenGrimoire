import { describe, expect, it } from 'vitest';

import { readLocalAiActivityLog } from './activity-log';
import { collectLocalAiRuntimeHealth } from './runtime-health';
import { listLocalAiWorkflowRecipes } from './workflow-recipes';

describe('collectLocalAiRuntimeHealth', () => {
  it('reports SQLite path, writable data directory, and installed Ollama models', async () => {
    const health = await collectLocalAiRuntimeHealth({
      cwd: 'C:/repo/OpenGrimoire',
      env: {},
      existsSync: (path) => String(path).endsWith('data') || String(path).endsWith('opengrimoire.sqlite'),
      accessSync: () => undefined,
      fetchJson: async () => ({
        models: [{ name: 'llama3.2:3b' }, { model: 'nomic-embed-text:latest' }],
      }),
    });

    expect(health.panel).toBe('local-ai-runtime-health');
    expect(health.sqlite.dbPath).toBe('C:/repo/OpenGrimoire/data/opengrimoire.sqlite');
    expect(health.sqlite.dataDirWritable).toBe(true);
    expect(health.ollama.status).toBe('ok');
    expect(health.ollama.models).toEqual(['llama3.2:3b', 'nomic-embed-text:latest']);
    expect(health.nextActions).toContain('Run the first local workflow recipe from the Recipes tab.');
  });

  it('fails soft when Ollama is unavailable', async () => {
    const health = await collectLocalAiRuntimeHealth({
      cwd: 'C:/repo/OpenGrimoire',
      env: { OLLAMA_BASE_URL: 'http://127.0.0.1:11434' },
      existsSync: () => false,
      accessSync: () => {
        throw new Error('missing');
      },
      fetchJson: async () => {
        throw new Error('connect ECONNREFUSED');
      },
    });

    expect(health.ollama.status).toBe('unreachable');
    expect(health.ollama.models).toEqual([]);
    expect(health.nextActions).toContain('Start Ollama and pull a small local model such as llama3.2:3b.');
  });
});

describe('listLocalAiWorkflowRecipes', () => {
  it('exposes a first local agent recipe without silent cloud execution', () => {
    const recipes = listLocalAiWorkflowRecipes();
    const firstRecipe = recipes.find((recipe) => recipe.id === 'first-local-agent');

    expect(firstRecipe?.runtime).toBe('local_ollama');
    expect(firstRecipe?.riskTier).toBe('local-default');
    expect(firstRecipe?.commands).toContain('npm run dev');
    expect(firstRecipe?.agentParity.toolSurface).toBe('planned_cli_or_mcp');
  });
});

describe('readLocalAiActivityLog', () => {
  it('returns a bootstrap event when the local JSONL log does not exist yet', () => {
    const activity = readLocalAiActivityLog({
      cwd: 'C:/repo/OpenGrimoire',
      existsSync: () => false,
      readFileSync: () => '',
    });

    expect(activity.mode).toBe('jsonl_adapter');
    expect(activity.events).toHaveLength(1);
    expect(activity.events[0].kind).toBe('bootstrap');
    expect(activity.summary).toContain('No local AI activity log exists yet');
  });

  it('reads valid JSONL events newest first and skips malformed lines', () => {
    const activity = readLocalAiActivityLog({
      cwd: 'C:/repo/OpenGrimoire',
      existsSync: () => true,
      readFileSync: () =>
        [
          JSON.stringify({ id: 'old', ts: '2026-04-29T10:00:00.000Z', kind: 'workflow', summary: 'Older run' }),
          'not-json',
          JSON.stringify({ id: 'new', ts: '2026-04-29T11:00:00.000Z', kind: 'health', summary: 'Newer check' }),
        ].join('\n'),
    });

    expect(activity.events.map((event) => event.id)).toEqual(['new', 'old']);
    expect(activity.skippedMalformedLines).toBe(1);
  });
});
