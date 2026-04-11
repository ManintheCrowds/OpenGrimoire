'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { isOpenGrimoireAdminSessionUser } from '@/lib/opengrimoire-admin';

type AlignmentItem = {
  id: string;
  title: string;
  body: string | null;
  tags: string[];
  priority: number | null;
  status: string;
  linked_node_id: string | null;
  attendee_id: string | null;
  source: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type IntentLedgerRecord = {
  attendee: { id: string; first_name: string; last_name: string | null };
  intent_gaps: {
    unresolved: number;
    resolved: number;
    escalation_prompts: string[];
  };
};

export default function AdminAlignmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newStatus, setNewStatus] = useState<'draft' | 'active' | 'archived'>('draft');

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

  const alignmentQuery = useQuery({
    queryKey: ['admin', 'alignment-items'],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch('/api/admin/alignment-context?limit=200', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Failed to load (${res.status})`);
      }
      const data = await res.json();
      return (data.items ?? []) as AlignmentItem[];
    },
  });

  const items = alignmentQuery.data ?? [];
  const intentLedgerQuery = useQuery({
    queryKey: ['admin', 'intent-ledger'],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch('/api/intent-ledger', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Failed to load intent ledger (${res.status})`);
      }
      const data = (await res.json()) as { items?: IntentLedgerRecord[] };
      return data.items ?? [];
    },
  });
  const intentRows = intentLedgerQuery.data ?? [];
  const unresolvedCount = intentRows.reduce((sum, row) => sum + row.intent_gaps.unresolved, 0);
  const resolvedCount = intentRows.reduce((sum, row) => sum + row.intent_gaps.resolved, 0);
  const escalationRows = intentRows.filter((row) => row.intent_gaps.escalation_prompts.length > 0);

  useEffect(() => {
    if (!user) return;
    const inv = () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'alignment-items'] });
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

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/alignment-context', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          body: newBody.trim() || null,
          status: newStatus,
          tags: [],
        }),
      });
      if (!res.ok) {
        throw new Error(`Create failed (${res.status})`);
      }
    },
    onSuccess: () => {
      setLoadError(null);
      setNewTitle('');
      setNewBody('');
      setNewStatus('draft');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'alignment-items'] });
    },
    onError: (e: Error) => setLoadError(e.message),
  });

  const patchMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/alignment-context/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error(`Update failed (${res.status})`);
      }
    },
    onMutate: ({ id }) => setBusyId(id),
    onSettled: () => setBusyId(null),
    onSuccess: () => {
      setLoadError(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'alignment-items'] });
    },
    onError: (e: Error) => setLoadError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/alignment-context/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Delete failed (${res.status})`);
      }
    },
    onMutate: (id) => setBusyId(id),
    onSettled: () => setBusyId(null),
    onSuccess: () => {
      setLoadError(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'alignment-items'] });
    },
    onError: (e: Error) => setLoadError(e.message),
  });

  const createItem = () => {
    if (!newTitle.trim()) return;
    createMutation.mutate();
  };

  const patchStatus = (id: string, status: string) => {
    patchMutation.mutate({ id, status });
  };

  const removeItem = (id: string) => {
    if (!confirm('Delete this alignment context row permanently?')) return;
    deleteMutation.mutate(id);
  };

  const queryError =
    alignmentQuery.error instanceof Error ? alignmentQuery.error.message : null;

  if (isAuthLoading) {
    return (
      <Layout>
        <div className="flex h-96 items-center justify-center">Loading…</div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex h-96 items-center justify-center">Access denied</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alignment context</h1>
            <p className="mt-2 text-gray-600">
              Operator CRUD for <code className="rounded bg-gray-100 px-1">alignment_context_items</code>. Agents
              and scripts use the public API — see <code className="text-sm">docs/agent/ALIGNMENT_CONTEXT_API.md</code>{' '}
              in the repository.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/admin"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to moderation
            </a>
            <a
              href="/admin/clarification-queue"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clarification queue
            </a>
          </div>
        </div>

        {(loadError || queryError) && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-red-800" role="alert">
            {loadError ?? queryError}
          </div>
        )}

        <section className="mb-10 rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm" aria-labelledby="intent-gaps-heading">
          <h2 id="intent-gaps-heading" className="text-lg font-semibold text-amber-900">
            Intent gaps ledger
          </h2>
          <p className="mt-1 text-sm text-amber-800">
            Merged Sync Session + clarification + alignment read model for operator/harness handoff.
          </p>
          {intentLedgerQuery.isPending ? (
            <p className="mt-3 text-sm text-amber-700">Loading intent ledger…</p>
          ) : (
            <div className="mt-4 space-y-3 text-sm">
              <p className="text-amber-900">
                Unresolved gaps: <strong>{unresolvedCount}</strong> · Resolved outcomes:{' '}
                <strong>{resolvedCount}</strong>
              </p>
              {escalationRows.length === 0 ? (
                <p className="text-amber-800">No escalation prompts right now.</p>
              ) : (
                <ul className="space-y-2">
                  {escalationRows.map((row) => (
                    <li key={row.attendee.id} className="rounded border border-amber-300 bg-white p-3">
                      <div className="font-medium text-gray-900">
                        {row.attendee.first_name} {row.attendee.last_name ?? ''} ({row.attendee.id})
                      </div>
                      <ul className="mt-1 list-disc pl-5 text-gray-700">
                        {row.intent_gaps.escalation_prompts.map((prompt) => (
                          <li key={prompt}>{prompt}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        <section className="mb-10 rounded-lg border border-gray-200 bg-white p-6 shadow-sm" aria-labelledby="create-heading">
          <h2 id="create-heading" className="mb-4 text-lg font-semibold text-gray-900">
            New item
          </h2>
          <div className="flex flex-col gap-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Title</span>
              <input
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Short label"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Body</span>
              <textarea
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                rows={4}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Longer context (optional)"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <select
                className="mt-1 rounded border border-gray-300 px-3 py-2"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as typeof newStatus)}
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="archived">archived</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => void createItem()}
              disabled={createMutation.isPending}
              className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </section>

        <section aria-labelledby="list-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="list-heading" className="text-lg font-semibold text-gray-900">
              Items ({items.length})
            </h2>
            <button
              type="button"
              onClick={() => void queryClient.invalidateQueries({ queryKey: ['admin', 'alignment-items'] })}
              className="text-sm text-blue-600 hover:underline"
            >
              Refresh
            </button>
          </div>
          {alignmentQuery.isPending ? (
            <p className="text-gray-500">Loading items…</p>
          ) : (
            <ul className="space-y-4">
              {items.map((it) => (
                <li key={it.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{it.title}</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {it.status} · {it.source} · {new Date(it.updated_at).toLocaleString()}
                      </p>
                      {it.body && (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{it.body}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(['draft', 'active', 'archived'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={busyId === it.id || it.status === s || patchMutation.isPending}
                          onClick={() => void patchStatus(it.id, s)}
                          className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-50"
                        >
                          Set {s}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={busyId === it.id || deleteMutation.isPending}
                        onClick={() => void removeItem(it.id)}
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {items.length === 0 && !alignmentQuery.isPending && !queryError && (
            <p className="text-gray-500">No rows yet. Create one above.</p>
          )}
        </section>
      </div>
    </Layout>
  );
}
