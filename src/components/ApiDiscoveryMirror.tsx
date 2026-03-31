'use client';

import { useEffect, useState } from 'react';

type CapabilitiesPayload = {
  app?: string;
  routes?: { path: string; methods?: string[] }[];
  documentation?: Record<string, string>;
};

/**
 * Phase C (scoped): operator-visible "mirror" of API discovery state — links and counts only,
 * no activation introspection or model self-report (see docs/engineering/DISCOVERY_STABILITY_GATE.md).
 */
export function ApiDiscoveryMirror() {
  const [data, setData] = useState<CapabilitiesPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/capabilities', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<CapabilitiesPayload>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const routeCount = data?.routes?.length ?? 0;

  return (
    <section
      className="mt-10 rounded-lg border border-slate-200 bg-slate-50/80 p-6 text-left shadow-sm"
      aria-labelledby="api-discovery-mirror-heading"
    >
      <h2 id="api-discovery-mirror-heading" className="text-lg font-semibold text-slate-900">
        API discovery (mirror)
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Live view of the public capabilities manifest. Use this to confirm the contract you ship matches what agents
        can discover — not model-internal state.
      </p>
      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          Could not load capabilities: {error}
        </p>
      )}
      {!error && !data && <p className="mt-3 text-sm text-slate-500">Loading capabilities…</p>}
      {data && (
        <dl className="mt-4 grid gap-2 text-sm text-slate-800 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500">App</dt>
            <dd>{data.app ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Routes in manifest</dt>
            <dd>{routeCount}</dd>
          </div>
        </dl>
      )}
      <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-blue-700">
        <li>
          <a className="underline hover:text-blue-900" href="/api/capabilities" target="_blank" rel="noreferrer">
            GET /api/capabilities
          </a>{' '}
          (JSON)
        </li>
        <li>
          <a className="underline hover:text-blue-900" href="/api/openapi.json" target="_blank" rel="noreferrer">
            GET /api/openapi.json
          </a>{' '}
          (partial OpenAPI 3)
        </li>
        <li>
          <a className="underline hover:text-blue-900" href="/brain-map">
            Brain map
          </a>{' '}
          (context graph UI)
        </li>
      </ul>
    </section>
  );
}
