import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import type { AutoresearchEvent, AutoresearchGithubMeta, AutoresearchPolicyDecision } from './events';

export type PolicyPredicateSource = 'jsonl' | 'eval_runs' | 'env' | 'git' | 'external';

export interface PolicyPredicateRow {
  id: string;
  pass: boolean | null;
  detail: string;
  source: PolicyPredicateSource;
}

export interface MutableAssetDiff {
  path: string;
  line_count: number | null;
  max_lines: number;
  bounded: boolean | null;
  available: boolean;
  detail: string;
}

export interface EvalRunRow {
  suite?: string;
  pass?: boolean;
  ts?: string;
  detail?: string;
}

interface PolicyDeps {
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
  eventsLogPath?: string;
  existsSync?: typeof fs.existsSync;
  readFileSync?: (filePath: string, encoding: BufferEncoding) => string;
  execGit?: (args: string[], cwd: string) => string;
}

const MAX_DIFF_LINES = 150;
const HARNESS_EDIT_PATTERNS = [/TEST_PROMPTS\.md$/i, /templates[/\\]autoresearch[/\\]/i];

function normalizeLocalPath(value: string): string {
  return value.replace(/\\/g, '/');
}

export function resolveHarnessRoot(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
  eventsLogPath: string
): string | null {
  if (env.OPENGRIMOIRE_HARNESS_ROOT?.trim()) {
    return normalizeLocalPath(path.resolve(env.OPENGRIMOIRE_HARNESS_ROOT.trim()));
  }
  const normalized = normalizeLocalPath(eventsLogPath);
  const stateDir = path.posix.dirname(normalized);
  if (!stateDir.endsWith('/.cursor/state') && !stateDir.endsWith('.cursor/state')) {
    return null;
  }
  return normalizeLocalPath(path.posix.join(stateDir, '..', '..'));
}

export function defaultEvalRunsLogPath(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
  eventsLogPath: string
): string {
  if (env.OPENGRIMOIRE_EVAL_RUNS_LOG?.trim()) {
    return normalizeLocalPath(env.OPENGRIMOIRE_EVAL_RUNS_LOG.trim());
  }
  const stateDir = path.posix.dirname(normalizeLocalPath(eventsLogPath));
  return normalizeLocalPath(path.posix.join(stateDir, 'eval_runs.jsonl'));
}

export function readEvalRunsJsonl(deps: PolicyDeps = {}): EvalRunRow[] {
  const env = deps.env ?? process.env;
  const existsSync = deps.existsSync ?? fs.existsSync;
  const readFileSync = deps.readFileSync ?? fs.readFileSync;
  const eventsLogPath =
    deps.eventsLogPath ??
    normalizeLocalPath(
      env.OPENGRIMOIRE_AUTORESEARCH_EVENTS_LOG ??
        path.join(process.cwd(), '..', 'MiscRepos', '.cursor', 'state', 'autoresearch_events.jsonl')
    );
  const evalPath = defaultEvalRunsLogPath(env, eventsLogPath);

  if (!existsSync(evalPath)) {
    return [];
  }

  return readFileSync(evalPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as EvalRunRow];
      } catch {
        return [];
      }
    });
}

function defaultExecGit(args: string[], cwd: string): string {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    timeout: 8000,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

export function computeMutableAssetDiff(
  harnessRoot: string | null,
  branch: string,
  asset: string,
  maxLines = MAX_DIFF_LINES,
  execGit: (args: string[], cwd: string) => string = defaultExecGit
): MutableAssetDiff {
  const skillRel = `.cursor/skills/${asset}/SKILL.md`;
  const skillPath = normalizeLocalPath(path.posix.join(skillRel));

  if (!harnessRoot) {
    return {
      path: skillPath,
      line_count: null,
      max_lines: maxLines,
      bounded: null,
      available: false,
      detail: 'Set OPENGRIMOIRE_HARNESS_ROOT or OPENGRIMOIRE_AUTORESEARCH_EVENTS_LOG to enable local git diff',
    };
  }

  try {
    const diffOutput = execGit(['diff', `main...${branch}`, '--', skillRel], harnessRoot);
    const lineCount = diffOutput
      ? diffOutput.split(/\r?\n/).filter((line) => line.length > 0).length
      : 0;
    return {
      path: skillPath,
      line_count: lineCount,
      max_lines: maxLines,
      bounded: lineCount <= maxLines,
      available: true,
      detail: `${lineCount} diff lines (max ${maxLines})`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      path: skillPath,
      line_count: null,
      max_lines: maxLines,
      bounded: null,
      available: false,
      detail: `git diff unavailable: ${message}`,
    };
  }
}

function checkNoHarnessEdit(
  harnessRoot: string | null,
  branch: string,
  execGit: (args: string[], cwd: string) => string
): { pass: boolean | null; detail: string } {
  if (!harnessRoot) {
    return { pass: null, detail: 'git unavailable — cannot verify fixed harness paths' };
  }
  try {
    const names = execGit(['diff', '--name-only', `main...${branch}`], harnessRoot)
      .split(/\r?\n/)
      .filter(Boolean);
    const blocked = names.filter((name) => HARNESS_EDIT_PATTERNS.some((re) => re.test(name)));
    return {
      pass: blocked.length === 0,
      detail: blocked.length === 0 ? 'fixed harness paths unchanged' : `blocked edits: ${blocked.join(', ')}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { pass: null, detail: `git name-only unavailable: ${message}` };
  }
}

function latestEventOfType(events: AutoresearchEvent[], type: string): AutoresearchEvent | null {
  return (
    [...events]
      .filter((e) => e.event === type)
      .sort((a, b) => b.ts.localeCompare(a.ts))[0] ?? null
  );
}

export function buildGithubCompareUrl(branch: string, github?: AutoresearchGithubMeta): string | null {
  if (github?.compare_url) return github.compare_url;
  const slug = branch.replace(/^autoresearch\//, '');
  return `https://github.com/ManintheCrowds/MiscRepos/compare/main...autoresearch/${encodeURIComponent(slug)}`;
}

export function evaluatePolicyPredicates(
  events: AutoresearchEvent[],
  deps: PolicyDeps = {}
): {
  predicates: PolicyPredicateRow[];
  all_predicates_pass: boolean | null;
  kill_switch_blocked: boolean;
  mutable_asset_diff: MutableAssetDiff;
} {
  const env = deps.env ?? process.env;
  const execGit = deps.execGit ?? defaultExecGit;
  const eventsLogPath = deps.eventsLogPath;
  const sorted = [...events].sort((a, b) => a.ts.localeCompare(b.ts));
  const started = sorted.find((e) => e.event === 'experiment_started') ?? sorted[0];
  const asset = started?.asset ?? 'unknown';
  const branch = started?.branch ?? 'unknown';

  const tierB = latestEventOfType(events, 'tier_b_complete');
  const critic = latestEventOfType(events, 'critic_scored');
  const evalRuns = readEvalRunsJsonl({ ...deps, eventsLogPath });
  const suiteName = `${asset}-autoresearch-tier-b`;
  const evalRecorded = evalRuns.some((row) => row.suite === suiteName && row.pass === true);

  const harnessRoot = eventsLogPath ? resolveHarnessRoot(env, eventsLogPath) : null;
  const mutable_asset_diff = computeMutableAssetDiff(harnessRoot, branch, asset, MAX_DIFF_LINES, execGit);
  const harnessEdit = checkNoHarnessEdit(harnessRoot, branch, execGit);

  const autoMergeEnabled = env.AUTORESEARCH_AUTO_MERGE !== '0';

  const policyTrace = [...events]
    .sort((a, b) => b.ts.localeCompare(a.ts))
    .find((e) => ['merge_eligible', 'merge_applied', 'merge_blocked', 'policy_violation'].includes(e.event));

  const ciDetail = policyTrace?.github?.pr
    ? `Check GitHub PR #${policyTrace.github.pr} checks`
    : 'Check GitHub PR checks on experiment branch';

  const predicates: PolicyPredicateRow[] = [
    {
      id: 'tier_b_pass',
      pass: tierB ? tierB.pass === true : false,
      detail: tierB ? (tierB.detail ?? 'tier_b_complete recorded') : 'missing tier_b_complete',
      source: 'jsonl',
    },
    {
      id: 'critic_pass',
      pass: critic ? critic.pass === true : false,
      detail: critic ? (critic.detail ?? 'critic_scored recorded') : 'missing critic_scored',
      source: 'jsonl',
    },
    {
      id: 'eval_recorded',
      pass: evalRecorded,
      detail: evalRecorded ? `eval_runs.jsonl pass for ${suiteName}` : `no pass row for ${suiteName}`,
      source: 'eval_runs',
    },
    {
      id: 'auto_merge_enabled',
      pass: autoMergeEnabled,
      detail: `AUTORESEARCH_AUTO_MERGE=${env.AUTORESEARCH_AUTO_MERGE ?? '(unset)'}`,
      source: 'env',
    },
    {
      id: 'diff_bounded',
      pass: mutable_asset_diff.available ? mutable_asset_diff.bounded === true : null,
      detail: mutable_asset_diff.detail,
      source: 'git',
    },
    {
      id: 'no_harness_edit',
      pass: harnessEdit.pass,
      detail: harnessEdit.detail,
      source: 'git',
    },
    {
      id: 'ci_green',
      pass: null,
      detail: ciDetail,
      source: 'external',
    },
  ];

  const evaluable = predicates.filter((p) => p.pass !== null);
  const all_predicates_pass =
    evaluable.length === 0 ? null : evaluable.every((p) => p.pass === true);

  const kill_switch_blocked =
    policyTrace?.event === 'merge_blocked' &&
    !autoMergeEnabled &&
    (policyTrace.detail?.includes('auto_merge_enabled') ?? false);

  return {
    predicates,
    all_predicates_pass,
    kill_switch_blocked,
    mutable_asset_diff,
  };
}

export function isKillSwitchBlocked(
  policyTrace: AutoresearchPolicyDecision | null,
  autoMergeEnabled: boolean,
  failedPredicateIds: string[]
): boolean {
  if (!policyTrace || policyTrace.event !== 'merge_blocked') return false;
  if (autoMergeEnabled) return false;
  return (
    failedPredicateIds.includes('auto_merge_enabled') ||
    (policyTrace.detail?.includes('auto_merge_enabled') ?? false)
  );
}
