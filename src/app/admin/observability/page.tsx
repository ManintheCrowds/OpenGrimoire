'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { isOpenGrimoireAdminSessionUser } from '@/lib/opengrimoire-admin';

type ProbeListItem = {
  id: string;
  created_at: string;
  probe_type: string;
  target_host: string;
  runner_id: string;
  runner_type: string;
  ingest_via: string;
  expires_at: string;
  summary: unknown;
};

export default function AdminObservabilityPage() {
  const router = useRouter();
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
      } catch {
        router.replace('/login');
      } finally {
        setIsAuthLoading(false);
      }
    };
    void checkAuth();
  }, [router]);

  const probesQuery = useQuery({
    queryKey: ['admin', 'operator-probes'],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch('/api/admin/operator-probes', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Failed to load probe runs (${res.status})`);
      }
      const data = (await res.json()) as { items?: ProbeListItem[] };
      return data.items ?? [];
    },
  });

  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const items = probesQuery.data ?? [];
  const err =
    probesQuery.error instanceof Error ? probesQuery.error.message : probesQuery.isError ? 'Failed to load' : null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900" data-testid="operator-observability-heading">
            Operator observability
          </h1>
          <p className="mt-2 text-gray-600">
            Path / connectivity probe runs ingested from trusted runners or operator session. Results measure the{' '}
            <strong>runner environment</strong>, not end-user browsers, unless the runner is on that machine.
          </p>
          <p className="mt-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            Raw traces may include sensitive topology — treat this page as operator-only; retention is enforced server-side
            (<code className="text-xs">OPERATOR_PROBE_RETENTION_DAYS</code>, default 30).
          </p>
          <p className="mt-3 text-sm text-gray-500">
            <Link className="text-blue-600 underline" href="/admin">
              Admin home
            </Link>
          </p>
        </div>

        {err ? (
          <div className="rounded border border-red-200 bg-red-50 text-red-800 px-4 py-3">{err}</div>
        ) : probesQuery.isLoading ? (
          <div className="text-gray-600" data-testid="operator-probe-list-loading">
            Loading runs…
          </div>
        ) : items.length === 0 ? (
          <div className="text-gray-600" data-testid="operator-probe-empty">
            No probe runs yet. POST to <code>/api/operator-probes/ingest</code> (see docs).
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg" data-testid="operator-probe-runs-table">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">When</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Runner</th>
                  <th className="p-3">Type / via</th>
                  <th className="p-3">Expires</th>
                  <th className="p-3" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100" data-testid={`operator-probe-run-${row.id}`}>
                    <td className="p-3 whitespace-nowrap text-gray-700">{row.created_at}</td>
                    <td className="p-3">
                      <span
                        className="inline-block rounded bg-slate-800 text-white text-xs font-semibold px-2 py-0.5"
                        data-testid={`operator-probe-target-host-${row.id}`}
                      >
                        {row.target_host}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className="inline-block w-fit rounded bg-indigo-100 text-indigo-900 text-xs font-medium px-2 py-0.5"
                          data-testid={`operator-probe-runner-type-${row.id}`}
                        >
                          {row.runner_type}
                        </span>
                        <span
                          className="text-xs text-gray-600 truncate max-w-[14rem]"
                          title={row.runner_id}
                          data-testid={`operator-probe-runner-id-${row.id}`}
                        >
                          {row.runner_id}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-700">
                      <div>{row.probe_type}</div>
                      <div className="text-xs text-gray-500">via {row.ingest_via}</div>
                    </td>
                    <td className="p-3 text-gray-600 text-xs whitespace-nowrap">{row.expires_at}</td>
                    <td className="p-3">
                      <Link
                        className="text-blue-600 underline text-sm"
                        href={`/admin/observability/${encodeURIComponent(row.id)}`}
                        data-testid={`operator-probe-detail-link-${row.id}`}
                      >
                        View / delete
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
