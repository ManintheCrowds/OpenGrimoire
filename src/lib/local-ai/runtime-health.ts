import fs from 'node:fs';
import path from 'node:path';

type RuntimeHealthStatus = 'ok' | 'missing' | 'unreachable' | 'not_checked';

export interface LocalAiRuntimeHealth {
  panel: 'local-ai-runtime-health';
  mode: 'read_only';
  summary: string;
  sqlite: {
    dbPath: string;
    dataDir: string;
    dbExists: boolean;
    dataDirExists: boolean;
    dataDirWritable: boolean;
  };
  ollama: {
    baseUrl: string;
    status: RuntimeHealthStatus;
    models: string[];
    error: string | null;
  };
  docker: {
    status: RuntimeHealthStatus;
    note: string;
  };
  verification: Array<{ id: string; label: string; command: string }>;
  nextActions: string[];
}

interface RuntimeHealthDeps {
  cwd?: string;
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
  existsSync?: typeof fs.existsSync;
  accessSync?: typeof fs.accessSync;
  fetchJson?: (url: string) => Promise<unknown>;
}

interface OllamaTagsResponse {
  models?: Array<{ name?: string; model?: string }>;
}

const DEFAULT_OLLAMA_BASE_URL = 'http://127.0.0.1:11434';

const VERIFICATION_COMMANDS = [
  {
    id: 'verify',
    label: 'Full local verification',
    command: 'npm run verify',
  },
  {
    id: 'admin-e2e',
    label: 'Admin cockpit E2E',
    command: 'npx playwright test e2e/admin-moderation.spec.ts',
  },
];

function normalizeLocalPath(value: string): string {
  return value.replace(/\\/g, '/');
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function defaultFetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

export async function collectLocalAiRuntimeHealth(deps: RuntimeHealthDeps = {}): Promise<LocalAiRuntimeHealth> {
  const cwd = deps.cwd ?? process.cwd();
  const env = deps.env ?? process.env;
  const existsSync = deps.existsSync ?? fs.existsSync;
  const accessSync = deps.accessSync ?? fs.accessSync;
  const fetchJson = deps.fetchJson ?? defaultFetchJson;

  const dbPath = normalizeLocalPath(env.OPENGRIMOIRE_DB_PATH ?? path.join(cwd, 'data', 'opengrimoire.sqlite'));
  const dataDir = normalizeLocalPath(path.dirname(dbPath));
  const dbExists = existsSync(dbPath);
  const dataDirExists = existsSync(dataDir);
  let dataDirWritable = false;
  try {
    accessSync(dataDir, fs.constants.W_OK);
    dataDirWritable = true;
  } catch {
    dataDirWritable = false;
  }

  const ollamaBaseUrl = env.OLLAMA_BASE_URL ?? DEFAULT_OLLAMA_BASE_URL;
  let ollamaStatus: RuntimeHealthStatus = 'unreachable';
  let ollamaModels: string[] = [];
  let ollamaError: string | null = null;
  try {
    const tags = (await fetchJson(`${ollamaBaseUrl.replace(/\/$/, '')}/api/tags`)) as OllamaTagsResponse;
    ollamaModels = (tags.models ?? [])
      .map((model) => model.name ?? model.model)
      .filter((model): model is string => Boolean(model));
    ollamaStatus = 'ok';
  } catch (error) {
    ollamaError = toErrorMessage(error);
  }

  const nextActions = [
    ...(dataDirWritable ? [] : ['Create a writable local data directory for OPENGRIMOIRE_DB_PATH.']),
    ...(ollamaStatus === 'ok' && ollamaModels.length > 0
      ? ['Run the first local workflow recipe from the Recipes tab.']
      : ['Start Ollama and pull a small local model such as llama3.2:3b.']),
  ];

  return {
    panel: 'local-ai-runtime-health',
    mode: 'read_only',
    summary:
      'Read-only local AI setup check for the solo Windows developer path. No commands are executed by this endpoint.',
    sqlite: {
      dbPath,
      dataDir,
      dbExists,
      dataDirExists,
      dataDirWritable,
    },
    ollama: {
      baseUrl: ollamaBaseUrl,
      status: ollamaStatus,
      models: ollamaModels,
      error: ollamaError,
    },
    docker: {
      status: 'not_checked',
      note: 'Docker is optional for the solo Windows MVP and is not probed by this read-only route.',
    },
    verification: VERIFICATION_COMMANDS,
    nextActions,
  };
}
