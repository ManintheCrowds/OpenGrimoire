'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CapabilitiesPage() {
  const [json, setJson] = useState<string>('');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/capabilities', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then((data) => setJson(JSON.stringify(data, null, 2)))
      .catch((e: unknown) =>
        setErr(e instanceof Error ? e.message : 'Failed to load capabilities')
      );
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">API capabilities</h1>
      <p className="mt-2 text-gray-600">
        Hand-maintained manifest from <code className="rounded bg-gray-100 px-1">GET /api/capabilities</code>.
        Full REST matrix: <code className="rounded bg-gray-100 px-1">docs/ARCHITECTURE_REST_CONTRACT.md</code> in the repo.
      </p>
      <p className="mt-2">
        <Link href="/" className="text-blue-600 hover:underline">
          Home
        </Link>
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Single integration guide: <code className="rounded bg-gray-100 px-1">docs/AGENT_INTEGRATION.md</code>
      </p>
      <p className="mt-2 text-sm text-gray-600">
        Action parity and optional thin MCP over REST:{' '}
        <code className="rounded bg-gray-100 px-1">docs/agent/INTEGRATION_PATHS.md</code>. Operator GUI flows:{' '}
        <code className="rounded bg-gray-100 px-1">docs/OPERATOR_GUI_RUNBOOK.md</code>.
      </p>
      {err && (
        <p className="mt-4 text-red-700" role="alert">
          {err}
        </p>
      )}
      <pre className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-left text-sm">
        {json || (err ? '' : 'Loading…')}
      </pre>
    </div>
  );
}
