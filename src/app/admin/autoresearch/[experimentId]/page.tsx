'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { isOpenGrimoireAdminSessionUser } from '@/lib/opengrimoire-admin';
import type { AutoresearchExperimentDetail } from '@/lib/autoresearch/events';

function passLabel(pass: boolean | null): string {
  if (pass === null) return 'External';
  return pass ? 'Pass' : 'Fail';
}

function passClass(pass: boolean | null): string {
  if (pass === null) return 'text-gray-600';
  return pass ? 'text-green-700' : 'text-red-700';
}

export default function AdminAutoresearchDetailPage() {
  const router = useRouter();
  const params = useParams<{ experimentId: string }>();
  const experimentId = decodeURIComponent(params.experimentId);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        if (!res.ok) {
          router.replace('/login');
          return;
        }
        const data = (await res.json()) as { authenticated?: boolean; user?: { id: string } };
        if (!data.authenticated || !isOpenGrimoireAdminSessionUser(data.user)) {
          router.replace('/login');
          return;
        }
        setUser(data.user ?? null);
      } finally {
        setIsAuthLoading(false);
      }
    };
    void checkAuth();
  }, [router]);

  const detailQuery = useQuery({
    queryKey: ['admin', 'autoresearch-detail', experimentId],
    enabled: Boolean(user),
    queryFn: async () => {
      const res = await fetch(`/api/admin/cockpit/autoresearch/${encodeURIComponent(experimentId)}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Failed to load experiment (${res.status})`);
      }
      return res.json() as Promise<AutoresearchExperimentDetail>;
    },
  });

  const data = detailQuery.data;

  if (isAuthLoading) {
    return (
      <Layout>
        <p className="p-6 text-sm text-gray-600">Loading autoresearch detail...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="mx-auto max-w-4xl p-6" data-testid="admin-autoresearch-detail-page">
        <p className="mb-4">
          <Link href="/admin" className="text-sm text-blue-700 underline">
            Back to admin cockpit
          </Link>
          {' · '}
          <Link href="/context-atlas" className="text-sm text-blue-700 underline">
            Brain Map
          </Link>
        </p>
        <h1 className="text-xl font-semibold" data-testid="admin-autoresearch-detail-heading">
          Autoresearch: {experimentId}
        </h1>

        {detailQuery.isPending ? (
          <p className="mt-4 text-sm text-gray-600">Loading experiment...</p>
        ) : detailQuery.isError ? (
          <p className="mt-4 text-sm text-amber-700">Experiment detail unavailable.</p>
        ) : (
          <div className="mt-4 space-y-6 text-sm">
            <p>{data?.summary}</p>

            {data?.kill_switch_blocked && (
              <div
                data-testid="admin-autoresearch-kill-switch-badge"
                className="inline-block rounded border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900"
              >
                AUTORESEARCH_AUTO_MERGE=0 (merge blocked on kill switch)
              </div>
            )}

            {data?.experiment && (
              <div className="rounded border border-gray-200 bg-gray-50 p-4">
                <p>
                  Status: <strong>{data.experiment.status}</strong>
                </p>
                <p>Asset: {data.experiment.asset}</p>
                <p>Metric: {data.experiment.latest_metric || '—'}</p>
                <p className="font-mono text-xs">{data.experiment.branch}</p>
                {data.github_compare_url && (
                  <a
                    href={data.github_compare_url}
                    className="text-xs text-blue-700 underline"
                    target="_blank"
                    rel="noreferrer"
                    data-testid="admin-autoresearch-compare-link"
                  >
                    View compare on GitHub
                  </a>
                )}
              </div>
            )}

            <section>
              <h2 className="font-medium">Policy predicates</h2>
              <table
                className="mt-2 w-full text-left text-xs"
                data-testid="admin-autoresearch-predicates"
              >
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-1 pr-2">Predicate</th>
                    <th className="py-1 pr-2">Result</th>
                    <th className="py-1 pr-2">Source</th>
                    <th className="py-1">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.policy_predicates ?? []).map((row) => (
                    <tr key={row.id} className="border-b border-gray-100">
                      <td className="py-1 pr-2 font-mono">{row.id}</td>
                      <td className={`py-1 pr-2 font-medium ${passClass(row.pass)}`}>
                        {passLabel(row.pass)}
                      </td>
                      <td className="py-1 pr-2">{row.source}</td>
                      <td className="py-1">
                        {row.detail}
                        {row.id === 'ci_green' && data?.policy_trace?.github?.pr && (
                          <>
                            {' '}
                            <a
                              href={
                                data.policy_trace.github.compare_url ??
                                `https://github.com/ManintheCrowds/MiscRepos/pull/${data.policy_trace.github.pr}`
                              }
                              className="text-blue-700 underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              PR #{data.policy_trace.github.pr}
                            </a>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data?.all_predicates_pass != null && (
                <p className="mt-2 text-xs text-gray-600">
                  All evaluable predicates: {data?.all_predicates_pass ? 'pass' : 'fail'}
                </p>
              )}
            </section>

            <section data-testid="admin-autoresearch-diff-panel">
              <h2 className="font-medium">Mutable asset diff</h2>
              <div className="mt-2 rounded border border-gray-200 bg-white p-3 text-xs">
                <p className="font-mono">{data?.mutable_asset_diff.path}</p>
                {data?.mutable_asset_diff.available ? (
                  <p>
                    {data.mutable_asset_diff.line_count} / {data.mutable_asset_diff.max_lines} lines —{' '}
                    {data.mutable_asset_diff.bounded ? 'bounded' : 'over cap'}
                  </p>
                ) : (
                  <>
                    <p className="text-amber-700">{data?.mutable_asset_diff.detail}</p>
                    {data?.github_compare_url && (
                      <a
                        href={data.github_compare_url}
                        className="text-blue-700 underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Compare on GitHub
                      </a>
                    )}
                  </>
                )}
              </div>
            </section>

            {data?.policy_trace && (
              <div data-testid="admin-autoresearch-detail-policy-trace" className="rounded border p-4">
                <p className="font-medium">Latest policy trace</p>
                <p className="text-xs text-gray-500">
                  {data.policy_trace.event} / {data.policy_trace.ts}
                </p>
                <p>{data.policy_trace.detail}</p>
              </div>
            )}

            <section>
              <h2 className="font-medium">Event timeline</h2>
              <table
                className="mt-2 w-full text-left text-xs"
                data-testid="admin-autoresearch-timeline"
              >
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-1 pr-2">Time</th>
                    <th className="py-1 pr-2">Event</th>
                    <th className="py-1 pr-2">Source</th>
                    <th className="py-1 pr-2">Pass</th>
                    <th className="py-1 pr-2">Metric</th>
                    <th className="py-1">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.events ?? []).map((event, index) => (
                    <tr key={`${event.ts}-${index}`} className="border-b border-gray-100">
                      <td className="py-1 pr-2 font-mono">{event.ts}</td>
                      <td className="py-1 pr-2">{event.event}</td>
                      <td className="py-1 pr-2">{event.source}</td>
                      <td className="py-1 pr-2">
                        {event.pass === undefined ? '—' : String(event.pass)}
                      </td>
                      <td className="py-1 pr-2">{event.metric ?? '—'}</td>
                      <td className="py-1">{event.detail ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <p className="text-xs text-gray-500 font-mono">{data?.logPath}</p>
          </div>
        )}
      </main>
    </Layout>
  );
}
