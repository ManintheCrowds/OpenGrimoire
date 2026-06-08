import fs from 'node:fs';
import path from 'node:path';

import {
  evaluatePolicyPredicates,
  isKillSwitchBlocked,
  type MutableAssetDiff,
  type PolicyPredicateRow,
} from './policy';

export type AutoresearchEventName =
  | 'experiment_started'
  | 'iteration_scored'
  | 'keep'
  | 'revert'
  | 'tier_a_complete'
  | 'tier_b_complete'
  | 'merge_eligible'
  | 'merge_applied'
  | 'merge_blocked'
  | 'policy_violation'
  | 'critic_scored'
  | 'preflight_pass'
  | 'preflight_fail';

export interface AutoresearchPolicyTrace {
  predicate: string;
  result: boolean;
  detail?: string;
}

export interface AutoresearchGithubMeta {
  pr?: number;
  sha?: string;
  compare_url?: string;
}

export interface AutoresearchEvent {
  event: AutoresearchEventName;
  ts: string;
  experiment_id: string;
  asset: string;
  branch: string;
  source: string;
  iteration?: number;
  phase?: string;
  metric?: string;
  pass?: boolean;
  detail?: string;
  policy?: AutoresearchPolicyTrace;
  github?: AutoresearchGithubMeta;
}

export interface AutoresearchExperimentSummary {
  experiment_id: string;
  asset: string;
  branch: string;
  status: 'running' | 'merge_eligible' | 'merged' | 'blocked' | 'unknown';
  iteration_count: number;
  latest_metric: string;
  latest_pass: boolean | null;
  started_at: string;
  updated_at: string;
  github_compare_url?: string;
}

export interface AutoresearchPolicyDecision {
  event: AutoresearchEventName;
  ts: string;
  pass: boolean | null;
  detail?: string;
  policy?: AutoresearchPolicyTrace;
  github?: AutoresearchGithubMeta;
}

export interface AutoresearchCockpitPanel {
  panel: 'autoresearch-experiments';
  mode: 'jsonl_adapter';
  panel_enabled: boolean;
  logPath: string;
  focusPath: string;
  summary: string;
  active_experiment_id: string | null;
  experiments: AutoresearchExperimentSummary[];
  events: AutoresearchEvent[];
  policy_trace: AutoresearchPolicyDecision | null;
  skippedMalformedLines: number;
}

export interface AutoresearchExperimentDetail extends AutoresearchCockpitPanel {
  experiment: AutoresearchExperimentSummary | null;
  policy_predicates: PolicyPredicateRow[];
  all_predicates_pass: boolean | null;
  kill_switch_blocked: boolean;
  mutable_asset_diff: MutableAssetDiff;
  github_compare_url: string | null;
}

interface EventsDeps {
  cwd?: string;
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
  existsSync?: typeof fs.existsSync;
  readFileSync?: (path: string, encoding: BufferEncoding) => string;
}

function normalizeLocalPath(value: string): string {
  return value.replace(/\\/g, '/');
}

function defaultEventsLogPath(cwd: string, env: NodeJS.ProcessEnv | Record<string, string | undefined>): string {
  return normalizeLocalPath(
    env.OPENGRIMOIRE_AUTORESEARCH_EVENTS_LOG ??
      path.join(cwd, '..', 'MiscRepos', '.cursor', 'state', 'autoresearch_events.jsonl')
  );
}

function defaultFocusPath(cwd: string, env: NodeJS.ProcessEnv | Record<string, string | undefined>): string {
  return normalizeLocalPath(
    env.OPENGRIMOIRE_AUTORESEARCH_FOCUS_JSON ??
      path.join(cwd, '..', 'MiscRepos', '.cursor', 'state', 'autoresearch_focus.json')
  );
}

function isAutoresearchPanelEnabled(env: NodeJS.ProcessEnv | Record<string, string | undefined>): boolean {
  return env.OG_AUTORESEARCH_PANEL !== '0';
}

function panelShell(
  logPath: string,
  focusPath: string,
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
  partial: Omit<
    AutoresearchCockpitPanel,
    'panel' | 'mode' | 'panel_enabled' | 'logPath' | 'focusPath'
  >
): AutoresearchCockpitPanel {
  return {
    panel: 'autoresearch-experiments',
    mode: 'jsonl_adapter',
    panel_enabled: isAutoresearchPanelEnabled(env),
    logPath,
    focusPath,
    ...partial,
  };
}
function isAutoresearchEvent(value: unknown): value is AutoresearchEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<AutoresearchEvent>;
  return (
    typeof event.event === 'string' &&
    typeof event.ts === 'string' &&
    typeof event.experiment_id === 'string' &&
    typeof event.asset === 'string' &&
    typeof event.branch === 'string'
  );
}

const POLICY_EVENTS = new Set<AutoresearchEventName>([
  'merge_eligible',
  'merge_applied',
  'merge_blocked',
  'policy_violation',
]);

export function aggregateExperiments(events: AutoresearchEvent[]): AutoresearchExperimentSummary[] {
  const byId = new Map<string, AutoresearchEvent[]>();
  for (const event of events) {
    const list = byId.get(event.experiment_id) ?? [];
    list.push(event);
    byId.set(event.experiment_id, list);
  }

  return Array.from(byId.entries())
    .map(([experiment_id, experimentEvents]) => {
      const sorted = [...experimentEvents].sort((a, b) => a.ts.localeCompare(b.ts));
      const started = sorted.find((e) => e.event === 'experiment_started') ?? sorted[0];
      const updated = sorted[sorted.length - 1];
      const iterationEvents = sorted.filter((e) =>
        ['iteration_scored', 'keep', 'revert', 'tier_a_complete', 'tier_b_complete'].includes(e.event)
      );
      const latestPolicy = [...sorted].reverse().find((e) => POLICY_EVENTS.has(e.event));
      const latestScore = [...sorted].reverse().find((e) => e.metric || e.pass !== undefined);

      let status: AutoresearchExperimentSummary['status'] = 'running';
      if (latestPolicy?.event === 'merge_applied') status = 'merged';
      else if (latestPolicy?.event === 'merge_eligible') status = 'merge_eligible';
      else if (latestPolicy?.event === 'merge_blocked' || latestPolicy?.event === 'policy_violation') {
        status = 'blocked';
      }

      return {
        experiment_id,
        asset: started.asset,
        branch: started.branch,
        status,
        iteration_count: iterationEvents.length,
        latest_metric: latestScore?.metric ?? '',
        latest_pass: latestScore?.pass ?? null,
        started_at: started.ts,
        updated_at: updated.ts,
        github_compare_url: latestPolicy?.github?.compare_url ?? updated.github?.compare_url,
      };
    })
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function latestPolicyTrace(events: AutoresearchEvent[]): AutoresearchPolicyDecision | null {
  const policyEvent = [...events]
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .find((e) => POLICY_EVENTS.has(e.event));
  if (!policyEvent) return null;
  return {
    event: policyEvent.event,
    ts: policyEvent.ts,
    pass: policyEvent.pass ?? null,
    detail: policyEvent.detail,
    policy: policyEvent.policy,
    github: policyEvent.github,
  };
}

function readFocusExperimentId(
  focusPath: string,
  existsSync: typeof fs.existsSync,
  readFileSync: (path: string, encoding: BufferEncoding) => string
): string | null {
  if (!existsSync(focusPath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(focusPath, 'utf8')) as { branch_tag?: string };
    return parsed.branch_tag ?? null;
  } catch {
    return null;
  }
}

export function readAutoresearchEvents(deps: EventsDeps = {}): AutoresearchCockpitPanel {
  const cwd = deps.cwd ?? process.cwd();
  const env = deps.env ?? process.env;
  const existsSync = deps.existsSync ?? fs.existsSync;
  const readFileSync = deps.readFileSync ?? fs.readFileSync;
  const logPath = defaultEventsLogPath(cwd, env);
  const focusPath = defaultFocusPath(cwd, env);
  const activeExperimentId = readFocusExperimentId(focusPath, existsSync, readFileSync);

  if (!existsSync(logPath)) {
    return panelShell(logPath, focusPath, env, {
      summary: 'No autoresearch events log yet. Run Initialize-AutoresearchState.ps1 to seed an experiment.',
      active_experiment_id: activeExperimentId,
      experiments: [],
      events: [
        {
          event: 'experiment_started',
          ts: new Date(0).toISOString(),
          experiment_id: 'bootstrap',
          asset: 'none',
          branch: 'none',
          source: 'initialize',
          detail: 'Autoresearch cockpit initialized in read-only adapter mode.',
        },
      ],
      policy_trace: null,
      skippedMalformedLines: 0,
    });
  }

  let skippedMalformedLines = 0;
  const events = readFileSync(logPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .flatMap((line) => {
      try {
        const parsed = JSON.parse(line) as unknown;
        return isAutoresearchEvent(parsed) ? [parsed] : [];
      } catch {
        skippedMalformedLines += 1;
        return [];
      }
    })
    .sort((a, b) => b.ts.localeCompare(a.ts));

  const experiments = aggregateExperiments(events);
  const policy_trace = latestPolicyTrace(events);

  return panelShell(logPath, focusPath, env, {
    summary: `Read ${events.length} autoresearch event${events.length === 1 ? '' : 's'} across ${experiments.length} experiment${experiments.length === 1 ? '' : 's'}.`,
    active_experiment_id: activeExperimentId,
    experiments,
    events,
    policy_trace,
    skippedMalformedLines,
  });
}

export function appendAutoresearchEvent(event: AutoresearchEvent, deps: Pick<EventsDeps, 'cwd' | 'env'> = {}): {
  ok: true;
  logPath: string;
} {
  const cwd = deps.cwd ?? process.cwd();
  const env = deps.env ?? process.env;
  const logPath = defaultEventsLogPath(cwd, env);
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, `${JSON.stringify(event)}\n`, 'utf8');
  return { ok: true, logPath };
}

export function getAutoresearchExperimentDetail(
  experimentId: string,
  deps: EventsDeps = {}
): AutoresearchExperimentDetail {
  const panel = readAutoresearchEvents(deps);
  const experiment = panel.experiments.find((e) => e.experiment_id === experimentId) ?? null;
  const events = panel.events
    .filter((e) => e.experiment_id === experimentId)
    .sort((a, b) => a.ts.localeCompare(b.ts));
  const policy_trace = latestPolicyTrace(events);
  const env = deps.env ?? process.env;
  const policyEval = evaluatePolicyPredicates(events, {
    env,
    eventsLogPath: panel.logPath,
    existsSync: deps.existsSync,
    readFileSync: deps.readFileSync,
  });

  const failedIds = policyEval.predicates.filter((p) => p.pass === false).map((p) => p.id);
  const kill_switch_blocked = isKillSwitchBlocked(
    policy_trace,
    env.AUTORESEARCH_AUTO_MERGE !== '0',
    failedIds
  );

  const github_compare_url =
    experiment?.github_compare_url ??
    policy_trace?.github?.compare_url ??
    (experiment ? `https://github.com/ManintheCrowds/MiscRepos/compare/main...${encodeURIComponent(experiment.branch)}` : null);

  return {
    ...panel,
    events,
    policy_trace,
    experiment,
    policy_predicates: policyEval.predicates,
    all_predicates_pass: policyEval.all_predicates_pass,
    kill_switch_blocked: kill_switch_blocked || policyEval.kill_switch_blocked,
    mutable_asset_diff: policyEval.mutable_asset_diff,
    github_compare_url,
    summary: experiment
      ? `Experiment ${experimentId}: ${experiment.status}, ${events.length} events.`
      : `Experiment ${experimentId} not found.`,
  };
}
