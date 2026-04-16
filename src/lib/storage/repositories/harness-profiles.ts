import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { asc, eq, sql } from 'drizzle-orm';
import { harnessProfiles } from '@/db/schema';
import { getDb } from '@/db/client';
import type { HarnessProfileRow } from '@/lib/types/database';

const LOCAL_PROFILE_DIR = path.join(process.cwd(), 'data', 'harness-profiles');
const DEFAULT_IMPORT_FILE = 'profiles.json';

function nowIso() {
  return new Date().toISOString();
}

function parseModes(raw: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function rowToProfile(row: typeof harnessProfiles.$inferSelect): HarnessProfileRow {
  return {
    id: row.id,
    name: row.name,
    purpose: row.purpose,
    question_strategy: row.questionStrategy,
    risk_posture: row.riskPosture,
    preferred_clarification_modes: parseModes(row.preferredClarificationModes),
    output_style: row.outputStyle,
    is_default: row.isDefault,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

function ensureDefaultInvariant() {
  const db = getDb();
  const defaults = db.select().from(harnessProfiles).where(eq(harnessProfiles.isDefault, true)).all();
  if (defaults.length <= 1) return;
  const [keep, ...rest] = defaults;
  for (const row of rest) {
    db.update(harnessProfiles).set({ isDefault: false, updatedAt: nowIso() }).where(eq(harnessProfiles.id, row.id)).run();
  }
  if (!keep) return;
}

function ensureSeedProfiles() {
  const db = getDb();
  const existing = db.select({ count: sql<number>`count(*)` }).from(harnessProfiles).get();
  if ((existing?.count ?? 0) > 0) return;
  createHarnessProfile({
    id: randomUUID(),
    name: 'Balanced interviewer',
    purpose: 'Collect complete operator context while staying concise and neutral.',
    question_strategy: 'Start broad, then ask one scoped follow-up per ambiguity.',
    risk_posture: 'Moderate risk acceptance; escalate uncertainty explicitly.',
    preferred_clarification_modes: ['multiple_choice', 'short_free_text'],
    output_style: 'Structured bullets with rationale and explicit unknowns.',
    is_default: true,
  });
  createHarnessProfile({
    id: randomUUID(),
    name: 'Safety-first verifier',
    purpose: 'Bias toward conservative execution and explicit policy checks.',
    question_strategy: 'Front-load constraints, edge cases, and failure modes.',
    risk_posture: 'Low risk tolerance; block on missing critical details.',
    preferred_clarification_modes: ['yes_no', 'checklist'],
    output_style: 'Decision log + safeguards + required approvals.',
    is_default: false,
  });
}

export function listHarnessProfiles(): HarnessProfileRow[] {
  ensureSeedProfiles();
  ensureDefaultInvariant();
  return getDb().select().from(harnessProfiles).orderBy(sql`${harnessProfiles.isDefault} DESC`, asc(harnessProfiles.name)).all().map(rowToProfile);
}

export function getHarnessProfileById(id: string): HarnessProfileRow | null {
  const row = getDb().select().from(harnessProfiles).where(eq(harnessProfiles.id, id)).get();
  return row ? rowToProfile(row) : null;
}

export function createHarnessProfile(input: Omit<HarnessProfileRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }): HarnessProfileRow {
  const db = getDb();
  const id = input.id ?? randomUUID();
  const ts = nowIso();
  if (input.is_default) {
    db.update(harnessProfiles).set({ isDefault: false, updatedAt: ts }).run();
  }
  db.insert(harnessProfiles).values({
    id,
    name: input.name,
    purpose: input.purpose,
    questionStrategy: input.question_strategy,
    riskPosture: input.risk_posture,
    preferredClarificationModes: JSON.stringify(input.preferred_clarification_modes ?? []),
    outputStyle: input.output_style,
    isDefault: input.is_default,
    createdAt: ts,
    updatedAt: ts,
  }).run();
  const row = db.select().from(harnessProfiles).where(eq(harnessProfiles.id, id)).get();
  if (!row) throw new Error('Harness profile insert failed');
  return rowToProfile(row);
}

export function updateHarnessProfile(id: string, patch: Partial<Omit<HarnessProfileRow, 'id' | 'created_at' | 'updated_at'>>): HarnessProfileRow | null {
  const db = getDb();
  const ts = nowIso();
  if (patch.is_default === true) {
    db.update(harnessProfiles).set({ isDefault: false, updatedAt: ts }).run();
  }
  const set: Partial<typeof harnessProfiles.$inferInsert> = { updatedAt: ts };
  if (patch.name !== undefined) set.name = patch.name;
  if (patch.purpose !== undefined) set.purpose = patch.purpose;
  if (patch.question_strategy !== undefined) set.questionStrategy = patch.question_strategy;
  if (patch.risk_posture !== undefined) set.riskPosture = patch.risk_posture;
  if (patch.preferred_clarification_modes !== undefined) {
    set.preferredClarificationModes = JSON.stringify(patch.preferred_clarification_modes);
  }
  if (patch.output_style !== undefined) set.outputStyle = patch.output_style;
  if (patch.is_default !== undefined) set.isDefault = patch.is_default;

  const result = db.update(harnessProfiles).set(set).where(eq(harnessProfiles.id, id)).run();
  if (result.changes === 0) return null;
  const row = db.select().from(harnessProfiles).where(eq(harnessProfiles.id, id)).get();
  return row ? rowToProfile(row) : null;
}

export function deleteHarnessProfile(id: string): boolean {
  const result = getDb().delete(harnessProfiles).where(eq(harnessProfiles.id, id)).run();
  return result.changes > 0;
}

function resolveImportExportPath(file?: string): string {
  const relative = (file?.trim() || DEFAULT_IMPORT_FILE).replace(/\\/g, '/');
  const resolved = path.resolve(LOCAL_PROFILE_DIR, relative);
  if (!resolved.startsWith(LOCAL_PROFILE_DIR)) {
    throw new Error('Invalid file path');
  }
  return resolved;
}

export function exportHarnessProfilesToFile(file?: string): { file: string; count: number } {
  const profiles = listHarnessProfiles();
  fs.mkdirSync(LOCAL_PROFILE_DIR, { recursive: true });
  const target = resolveImportExportPath(file);
  fs.writeFileSync(target, JSON.stringify({ exported_at: nowIso(), items: profiles }, null, 2), 'utf8');
  return { file: path.relative(process.cwd(), target), count: profiles.length };
}

export function importHarnessProfilesFromFile(file?: string): { imported: number; file: string } {
  const target = resolveImportExportPath(file);
  const raw = fs.readFileSync(target, 'utf8');
  const parsed = JSON.parse(raw) as { items?: HarnessProfileRow[] };
  const items = Array.isArray(parsed.items) ? parsed.items : [];

  let imported = 0;
  for (const item of items) {
    const existing = getHarnessProfileById(item.id);
    if (existing) {
      const updated = updateHarnessProfile(item.id, item);
      if (updated) imported += 1;
      continue;
    }
    createHarnessProfile(item);
    imported += 1;
  }
  return { imported, file: path.relative(process.cwd(), target) };
}
