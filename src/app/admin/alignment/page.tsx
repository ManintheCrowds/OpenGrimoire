'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';

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

export default function AdminAlignmentPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ user_metadata?: { role?: string } } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<AlignmentItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newStatus, setNewStatus] = useState<'draft' | 'active' | 'archived'>('draft');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user: u },
        } = await supabase.auth.getUser();
        if (!u || u.user_metadata?.role !== 'admin') {
          router.replace('/login');
          return;
        }
        setUser(u);
      } catch {
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const refresh = useCallback(async () => {
    setLoadError(null);
    const res = await fetch('/api/admin/alignment-context?limit=200', {
      credentials: 'include',
    });
    if (!res.ok) {
      setLoadError(`Failed to load (${res.status})`);
      return;
    }
    const data = await res.json();
    setItems(data.items ?? []);
  }, []);

  useEffect(() => {
    if (user) {
      void refresh();
    }
  }, [user, refresh]);

  const createItem = async () => {
    if (!newTitle.trim()) return;
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
      setLoadError(`Create failed (${res.status})`);
      return;
    }
    setNewTitle('');
    setNewBody('');
    setNewStatus('draft');
    await refresh();
  };

  const patchStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/alignment-context/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setLoadError(`Update failed (${res.status})`);
        return;
      }
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (id: string) => {
    if (!confirm('Delete this alignment context row permanently?')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/alignment-context/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        setLoadError(`Delete failed (${res.status})`);
        return;
      }
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
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
              and scripts use the public API — see <code className="text-sm">OpenAtlas/docs/agent/ALIGNMENT_CONTEXT_API.md</code>{' '}
              in the repository.
            </p>
          </div>
          <a
            href="/admin"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to moderation
          </a>
        </div>

        {loadError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-red-800" role="alert">
            {loadError}
          </div>
        )}

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
              className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
              onClick={() => void refresh()}
              className="text-sm text-blue-600 hover:underline"
            >
              Refresh
            </button>
          </div>
          <ul className="space-y-4">
            {items.map((it) => (
              <li
                key={it.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
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
                        disabled={busyId === it.id || it.status === s}
                        onClick={() => void patchStatus(it.id, s)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-50"
                      >
                        Set {s}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={busyId === it.id}
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
          {items.length === 0 && !loadError && (
            <p className="text-gray-500">No rows yet. Create one above or apply the Supabase migration.</p>
          )}
        </section>
      </div>
    </Layout>
  );
}
