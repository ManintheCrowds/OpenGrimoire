'use client';

import { useMutation, useQuery, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { isOpenGrimoireAdminSessionUser } from '@/lib/opengrimoire-admin';

type ProbeDetail = {
  id: string;
  created_at: string;
  probe_type: string;
  target_host: string;
  runner_id: string;
  runner_type: string;
  raw_blob: string | null;
  ingest_via: string;
  expires_at: string;
  summary: unknown;
};

export default function AdminObservabilityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const queryClient = useQueryClient();
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

  const detailQuery = useQuery({
    queryKey: ['admin', 'operator-probes', id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const res = await fetch(`/api/admin/operator-probes/${encodeURIComponent(id)}`, {
        credentials: 'include',
      });
      if (res.status === 404) {
        return null;
      }
      if (!res.ok) {
        throw new Error(`Failed to load (${res.status})`);
      }
      return (await res.json()) as ProbeDetail;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/operator-probes/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Delete failed (${res.status})`);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'operator-probes'] });
      router.replace('/admin/observability');
    },
  });

  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  if (!user || !id) {
    return null;
  }

  const row = detailQuery.data;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="mb-4 text-sm">
          <Link href="/admin/observability" className="text-blue-600 underline">
            All probe runs
          </Link>
          {' · '}
          <Link href="/admin" className="text-blue-600 underline">
            Admin home
          </Link>
        </p>

        {detailQuery.isLoading ? (
          <div className="text-gray-600">Loading…</div>
        ) : detailQuery.isError ? (
          <div className="text-red-700">
            {detailQuery.error instanceof Error ? detailQuery.error.message : 'Error'}
          </div>
        ) : row ? (
          <ProbeDetailView row={row} deleteMutation={deleteMutation} />
        ) : (
          <div className="text-gray-700">Not found (expired or deleted).</div>
        )}
      </div>
    </Layout>
  );
}

function ProbeDetailView({
  row,
  deleteMutation,
}: {
  row: ProbeDetail;
  deleteMutation: UseMutationResult<void, Error, void, unknown>;
}) {
  return (
    <>
            <h1 className="text-2xl font-bold text-gray-900 mb-4" data-testid="operator-probe-detail-heading">
              Probe run
            </h1>
            <div className="space-y-3 text-sm mb-6">
              <div>
                <span className="text-gray-500">Target</span>{' '}
                <span className="inline-block rounded bg-slate-800 text-white text-xs font-semibold px-2 py-0.5">
                  {row.target_host}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Runner type</span>{' '}
                <span className="inline-block rounded bg-indigo-100 text-indigo-900 text-xs font-medium px-2 py-0.5">
                  {row.runner_type}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Runner id</span> <code className="text-xs bg-gray-100 px-1">{row.runner_id}</code>
              </div>
              <div>
                <span className="text-gray-500">Probe type</span> {row.probe_type}
              </div>
              <div>
                <span className="text-gray-500">Ingest</span> {row.ingest_via}
              </div>
              <div>
                <span className="text-gray-500">Created</span> {row.created_at}
              </div>
              <div>
                <span className="text-gray-500">Expires</span> {row.expires_at}
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 mb-2">Summary (JSON)</h2>
            <pre className="text-xs bg-gray-50 border rounded p-3 overflow-x-auto mb-6 max-h-64 overflow-y-auto">
              {JSON.stringify(row.summary, null, 2)}
            </pre>

            {row.raw_blob ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Raw (sensitive)</h2>
                <pre className="text-xs bg-amber-50 border border-amber-200 rounded p-3 overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
                  {row.raw_blob}
                </pre>
              </>
            ) : null}

            <div className="mt-8 flex gap-3 items-center">
              <button
                type="button"
                className="rounded bg-red-600 text-white text-sm font-medium px-4 py-2 hover:bg-red-700 disabled:opacity-50"
                data-testid="operator-probe-delete-button"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (window.confirm('Delete this probe run permanently?')) {
                    void deleteMutation.mutate();
                  }
                }}
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete run'}
              </button>
              {deleteMutation.isError ? (
                <span className="text-red-600 text-sm">
                  {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Delete failed'}
                </span>
              ) : null}
            </div>
    </>
  );
}
