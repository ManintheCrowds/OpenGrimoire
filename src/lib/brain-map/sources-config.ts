import { existsSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';

export type BrainMapSourcesConfig = {
  vaultRoots: string[];
  vaultLabels: string[];
  stateDirs: string[];
  stateLabels: string[];
  updatedAt: string;
};

const CONFIG_FILENAME = 'brain-map-sources.json';

function configPath(): string {
  const dataDir = process.env.OPENGRIMOIRE_DATA_DIR?.trim() || join(process.cwd(), 'data');
  return join(dataDir, CONFIG_FILENAME);
}

function parseList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function envBrainMapSources(): Omit<BrainMapSourcesConfig, 'updatedAt'> {
  return {
    vaultRoots: parseList(process.env.BRAIN_MAP_VAULT_ROOTS),
    vaultLabels: parseList(process.env.BRAIN_MAP_VAULT_LABELS),
    stateDirs: parseList(process.env.CURSOR_STATE_DIRS || process.env.CURSOR_STATE_DIR),
    stateLabels: parseList(process.env.CURSOR_STATE_DIR_LABELS),
  };
}

export async function readBrainMapSourcesConfig(): Promise<BrainMapSourcesConfig> {
  const env = envBrainMapSources();
  const path = configPath();
  if (!existsSync(path)) {
    return { ...env, updatedAt: '' };
  }
  try {
    const raw = await readFile(path, 'utf8');
    const parsed = JSON.parse(raw) as BrainMapSourcesConfig;
    return {
      vaultRoots: parsed.vaultRoots?.length ? parsed.vaultRoots : env.vaultRoots,
      vaultLabels: parsed.vaultLabels?.length ? parsed.vaultLabels : env.vaultLabels,
      stateDirs: parsed.stateDirs?.length ? parsed.stateDirs : env.stateDirs,
      stateLabels: parsed.stateLabels?.length ? parsed.stateLabels : env.stateLabels,
      updatedAt: parsed.updatedAt ?? '',
    };
  } catch {
    return { ...env, updatedAt: '' };
  }
}

export async function writeBrainMapSourcesConfig(
  input: Omit<BrainMapSourcesConfig, 'updatedAt'>
): Promise<BrainMapSourcesConfig> {
  const path = configPath();
  await mkdir(dirname(path), { recursive: true });
  const next: BrainMapSourcesConfig = {
    ...input,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(path, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

export function resolveActiveGraphPath(): { path: string; source: 'local' | 'default' } {
  const publicDir = join(process.cwd(), 'public');
  const localPath = join(publicDir, 'brain-map-graph.local.json');
  const defaultPath = join(publicDir, 'brain-map-graph.json');
  if (existsSync(localPath)) return { path: localPath, source: 'local' };
  return { path: defaultPath, source: 'default' };
}
