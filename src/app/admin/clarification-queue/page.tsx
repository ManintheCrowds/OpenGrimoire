'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { DynamicQuestionPanel } from '@/components/ClarificationQueue/DynamicQuestionPanel';
import { isOpenGrimoireAdminSessionUser } from '@/lib/opengrimoire-admin';
import type { ClarificationResolution } from '@/lib/clarification/schemas';
import type { ClarificationRequestRow } from '@/lib/storage/repositories/clarification';

export default function AdminClarificationQueuePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resolutionDraft, setResolutionDraft] = useState<ClarificationResolution>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        setIsLoading(false);
      }
    };
    void checkAuth();
  }, [router]);

  const pendingQuery = useQuery({
    queryKey: ['admin', 'clarification-requests', 'pending'],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch('/api/admin/clarification-requests?status=pending&limit=200', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Failed to load (${res.status})`);
      }
      const data = (await res.json()) as { items?: ClarificationRequestRow[] };
      return data.items ?? [];
    },
  });

  useEffect(() => {
    if (!user) return;
    const inv = () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'clarification-requests', 'pending'] });
    };
    const onVis = () => {
      if (document.visibilityState === 'visible') inv();
    };
    window.addEventListener('focus', inv);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', inv);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [user, queryClient]);

  const items = pendingQuery.data ?? [];

  const selected = useMemo(() => {
    const list = pendingQuery.data ?? [];
    return list.find((i) => i.id === selectedId) ?? null;
  }, [pendingQuery.data, selectedId]);

  useEffect(() => {
    setResolutionDraft({});
    setSubmitError(null);
  }, [selectedId]);

  const resolveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) throw new Error('Nothing selected');
      const res = await fetch(`/api/admin/clarification-requests/${selectedId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolution: resolutionDraft,
          status: 'answered',
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        throw new Error(payload.message ?? payload.error ?? `Failed (${res.status})`);
      }
    },
    onSuccess: () => {
      setSubmitError(null);
      setSelectedId(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'clarification-requests', 'pending'] });
    },
    onError: (e: Error) => setSubmitError(e.message),
  });

  const supersedeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) throw new Error('Nothing selected');
      const res = await fetch(`/api/admin/clarification-requests/${selectedId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'superseded',
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        throw new Error(payload.message ?? payload.error ?? `Failed (${res.status})`);
      }
    },
    onSuccess: () => {
      setSubmitError(null);
      setSelectedId(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'clarification-requests', 'pending'] });
    },
    onError: (e: Error) => setSubmitError(e.message),
  });

  const busy = resolveMutation.isPending || supersedeMutation.isPending;
  const loadError =
    pendingQuery.error instanceof Error ? pendingQuery.error.message : null;

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  if (!user || !isOpenGrimoireAdminSessionUser(user)) {
    return <div className="flex items-center justify-center h-96">Access denied</div>;
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8" data-testid="clarification-queue-page">
        <h1 className="text-3xl font-bold text-gray-900">Clarification queue</h1>
        <p className="mt-2 text-gray-600">
          Resolve async questions published by agents (OpenGrimoire intent inbox). Distinct from{' '}
          <a className="text-blue-600 underline" href="/operator-intake">
            Sync Session
          </a>{' '}
          profile flow.
        </p>

        {loadError && (
          <p className="mt-4 text-red-600" role="alert">
            {loadError}
          </p>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Pending</h2>
              <button
                type="button"
                onClick={() =>
                  void queryClient.invalidateQueries({
                    queryKey: ['admin', 'clarification-requests', 'pending'],
                  })
                }
                className="text-sm text-blue-600 hover:underline"
              >
                Refresh
              </button>
            </div>
            {pendingQuery.isPending ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-gray-500">No pending clarification requests.</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full text-left p-3 rounded border text-sm ${
                        selectedId === item.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid={`clarification-item-${item.id}`}
                    >
                      <div className="font-mono text-xs text-gray-500">{item.id}</div>
                      <div className="mt-1 line-clamp-2">{item.question_spec.prompt}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Resolve</h2>
            {!selected ? (
              <p className="text-sm text-gray-500">Select a pending item.</p>
            ) : (
              <div className="space-y-4">
                <div className="text-xs font-mono text-gray-500 break-all">{selected.id}</div>
                {(selected.agent_metadata.reason || selected.agent_metadata.blocking !== undefined) && (
                  <div className="text-sm bg-gray-50 border border-gray-100 rounded p-2">
                    {selected.agent_metadata.blocking !== undefined && (
                      <div>
                        Blocking: {selected.agent_metadata.blocking ? 'yes' : 'no'}
                      </div>
                    )}
                    {selected.agent_metadata.reason && (
                      <div className="mt-1 whitespace-pre-wrap">{selected.agent_metadata.reason}</div>
                    )}
                  </div>
                )}
                <DynamicQuestionPanel
                  spec={selected.question_spec}
                  value={resolutionDraft}
                  onChange={setResolutionDraft}
                  disabled={busy}
                />
                {submitError && (
                  <p className="text-sm text-red-600" role="alert">
                    {submitError}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void resolveMutation.mutate()}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    data-testid="clarification-submit-resolve"
                  >
                    Submit answer
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void supersedeMutation.mutate()}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Mark superseded
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-10 text-sm text-gray-500">
          <a className="text-blue-600 underline" href="/admin/alignment">
            Alignment context
          </a>{' '}
          ·{' '}
          <a className="text-blue-600 underline" href="/admin">
            Moderation
          </a>
        </p>
      </div>
    </Layout>
  );
}
