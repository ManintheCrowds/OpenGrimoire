'use client';

import { useEffect, useState } from 'react';

type MetaResponse = {
  sources: {
    vaultRoots: string[];
    stateDirs: string[];
    updatedAt: string;
  };
  graph: { variant: string; mtime: string | null };
  rebuildHint: string;
};

export function BrainMapSourcesPanel() {
  const [meta, setMeta] = useState<MetaResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/brain-map/meta');
        if (!res.ok) return;
        const data = (await res.json()) as MetaResponse;
        if (!cancelled) setMeta(data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!meta) return null;

  return (
    <details className="mt-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300" data-testid="brain-map-sources-panel">
      <summary className="cursor-pointer font-medium">Data sources (Obsidian / vault roots)</summary>
      <ul className="mt-2 list-disc pl-4 space-y-1">
        <li>
          <strong>Vault roots:</strong>{' '}
          {meta.sources.vaultRoots.length ? meta.sources.vaultRoots.join('; ') : 'none configured'}
        </li>
        <li>
          <strong>State dirs:</strong>{' '}
          {meta.sources.stateDirs.length ? meta.sources.stateDirs.join('; ') : 'none configured'}
        </li>
        <li>
          <strong>Active graph:</strong> {meta.graph.variant}
          {meta.graph.mtime ? ` (mtime ${meta.graph.mtime})` : ''}
        </li>
      </ul>
      <p className="mt-2">{meta.rebuildHint}</p>
      <p className="mt-1 opacity-80">
        Configure paths in Admin or env (<code>BRAIN_MAP_VAULT_ROOTS</code>, <code>CURSOR_STATE_DIRS</code>).
      </p>
    </details>
  );
}
