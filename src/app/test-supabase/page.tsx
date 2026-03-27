'use client';

import { useState } from 'react';

/** Legacy route name; exercises local SQLite via HTTP (no Supabase). */
export default function LocalStorageApiTester() {
  const [vizResult, setVizResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/survey/visualization?all=1');
      const json = await res.json();
      if (!res.ok) throw new Error(typeof json === 'object' && json && 'error' in json ? String((json as { error?: string }).error) : res.statusText);
      setVizResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Local SQLite API (survey visualization)</h1>
      <p className="text-sm text-gray-600">
        Fetches <code className="text-xs">GET /api/survey/visualization?all=1</code> (OpenGrimoire uses SQLite, not
        Supabase).
      </p>
      <button type="button" onClick={() => void handleFetch()} className="px-4 py-2 bg-blue-500 text-white rounded">
        Fetch visualization JSON
      </button>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      {vizResult != null && (
        <div>
          <h2 className="font-semibold mt-4">Result</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-96">
            {JSON.stringify(vizResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
