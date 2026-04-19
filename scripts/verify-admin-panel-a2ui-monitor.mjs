#!/usr/bin/env node
/**
 * OG-GUI-A2 / audit dim 5: block decorative-only React component names under AdminPanel
 * so future A2UI/agent surfaces have meaningful identifiers. Conservative exact-name denylist;
 * ambiguous names belong in PR discussion (see CONTRIBUTING.md). When OA-OG-5 ships, extend
 * with catalog semantics alongside this guard.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const ADMIN_PANEL = path.join(root, 'src', 'components', 'AdminPanel');

/** PascalCase names that are structure-only, not domain semantics (exact match). */
const DECORATIVE_NAMES = new Set([
  'Wrapper',
  'Container',
  'Inner',
  'Outer',
  'Content',
  'Root',
  'Box',
  'Row',
  'Col',
  'Section',
  'Panel',
  'Layout',
  'Stack',
  'Flex',
  'Grid',
  'Spacer',
  'Divider',
  'Sidebar',
  'Header',
  'Footer',
  'Main',
  'Body',
  'Area',
  'Slot',
  'Group',
]);

function fail(msg) {
  console.error(`verify-admin-panel-a2ui-monitor: ${msg}`);
  process.exit(1);
}

function walkFiles(dir, ext, out = []) {
  if (!fs.existsSync(dir)) {
    return out;
  }
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walkFiles(full, ext, out);
    } else if (ent.isFile() && ent.name.endsWith(ext)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * @param {string} filePath
 * @param {string} source
 * @returns {{ line: number; name: string }[]}
 */
function findComponentNames(filePath, source) {
  const lines = source.split(/\r?\n/);
  /** @type {{ line: number; name: string }[]} */
  const hits = [];

  const patterns = [
    /^\s*export\s+default\s+function\s+(\w+)\s*\(/,
    /^\s*export\s+function\s+(\w+)\s*\(/,
    /^\s*export\s+const\s+(\w+)\s*=\s*(?:React\.)?(?:forwardRef|memo)\s*\(/,
    /** Non-export `function Foo(` — nested components only (avoid `export const x = (` arrow false positives). */
    /^\s*function\s+(\w+)\s*\(/,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const re of patterns) {
      const m = line.match(re);
      if (!m) continue;
      const name = m[1];
      if (name.startsWith('use')) continue;
      hits.push({ line: i + 1, name });
      break;
    }
  }

  return hits;
}

function main() {
  if (!fs.existsSync(ADMIN_PANEL)) {
    fail(`missing AdminPanel dir ${ADMIN_PANEL}`);
  }

  const tsxFiles = walkFiles(ADMIN_PANEL, '.tsx');
  const tsFiles = walkFiles(ADMIN_PANEL, '.ts');
  if (tsxFiles.length === 0) {
    fail(`no .tsx files under ${ADMIN_PANEL} (unexpected move or empty tree)`);
  }

  /** @type {string[]} */
  const violations = [];

  for (const filePath of [...tsxFiles, ...tsFiles]) {
    const rel = path.relative(root, filePath);
    const src = fs.readFileSync(filePath, 'utf8');
    for (const { line, name } of findComponentNames(filePath, src)) {
      if (DECORATIVE_NAMES.has(name)) {
        violations.push(`${rel}:${line} — component "${name}" is a decorative-only name (OG-GUI-A2); use a domain-specific name (e.g. ModerationQueueToolbar).`);
      }
    }
  }

  if (violations.length) {
    for (const v of violations) console.error(v);
    fail(`${violations.length} decorative component name(s) in AdminPanel`);
  }

  console.log('verify-admin-panel-a2ui-monitor: ok');
}

main();
