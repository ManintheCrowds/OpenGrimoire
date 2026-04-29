import fs from 'node:fs';
import path from 'node:path';

export interface LocalAiActivityEvent {
  id: string;
  ts: string;
  kind: 'bootstrap' | 'health' | 'workflow' | 'verification' | 'training';
  summary: string;
  detail?: string;
}

export interface LocalAiActivityLog {
  panel: 'local-ai-activity-log';
  mode: 'jsonl_adapter';
  logPath: string;
  summary: string;
  events: LocalAiActivityEvent[];
  skippedMalformedLines: number;
}

interface ActivityLogDeps {
  cwd?: string;
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
  existsSync?: typeof fs.existsSync;
  readFileSync?: (path: string, encoding: BufferEncoding) => string;
}

function normalizeLocalPath(value: string): string {
  return value.replace(/\\/g, '/');
}

function defaultLogPath(cwd: string, env: NodeJS.ProcessEnv | Record<string, string | undefined>): string {
  return normalizeLocalPath(env.OPENGRIMOIRE_LOCAL_AI_ACTIVITY_LOG ?? path.join(cwd, 'data', 'local-ai-activity.jsonl'));
}

function isLocalAiActivityEvent(value: unknown): value is LocalAiActivityEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<LocalAiActivityEvent>;
  return typeof event.id === 'string' && typeof event.ts === 'string' && typeof event.kind === 'string';
}

export function readLocalAiActivityLog(deps: ActivityLogDeps = {}): LocalAiActivityLog {
  const cwd = deps.cwd ?? process.cwd();
  const env = deps.env ?? process.env;
  const existsSync = deps.existsSync ?? fs.existsSync;
  const readFileSync = deps.readFileSync ?? fs.readFileSync;
  const logPath = defaultLogPath(cwd, env);

  if (!existsSync(logPath)) {
    return {
      panel: 'local-ai-activity-log',
      mode: 'jsonl_adapter',
      logPath,
      summary: 'No local AI activity log exists yet. Run the setup check or first workflow to create events.',
      events: [
        {
          id: 'bootstrap',
          ts: new Date(0).toISOString(),
          kind: 'bootstrap',
          summary: 'Local AI cockpit initialized in read-only adapter mode.',
        },
      ],
      skippedMalformedLines: 0,
    };
  }

  let skippedMalformedLines = 0;
  const events = readFileSync(logPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .flatMap((line) => {
      try {
        const parsed = JSON.parse(line) as unknown;
        return isLocalAiActivityEvent(parsed) ? [parsed] : [];
      } catch {
        skippedMalformedLines += 1;
        return [];
      }
    })
    .sort((a, b) => b.ts.localeCompare(a.ts));

  return {
    panel: 'local-ai-activity-log',
    mode: 'jsonl_adapter',
    logPath,
    summary: `Read ${events.length} local AI activity event${events.length === 1 ? '' : 's'} from JSONL.`,
    events,
    skippedMalformedLines,
  };
}
