'use client';

/**
 * PURPOSE: Operator-only Sync Session Success parking lot — deferred non-blocking clarifications with inline resolve.
 * DEPENDENCIES: /api/auth/session, /api/admin/clarification-requests, DynamicQuestionPanel
 * MODIFICATION NOTES: Filter blocking !== true; group by agent_metadata.project; cap display at PARKING_LOT_CAP.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DynamicQuestionPanel } from '@/components/ClarificationQueue/DynamicQuestionPanel';
import type { ClarificationResolution } from '@/lib/clarification/schemas';
import { isOpenGrimoireAdminSessionUser } from '@/lib/opengrimoire-admin';
import type { ClarificationRequestRow } from '@/lib/storage/repositories/clarification';

const PARKING_LOT_CAP = 8;

function isParkedItem(item: ClarificationRequestRow): boolean {
  return item.agent_metadata?.blocking !== true;
}

function projectLabel(item: ClarificationRequestRow): string {
  const p = item.agent_metadata?.project;
  return typeof p === 'string' && p.trim() ? p.trim() : 'Unscoped';
}

function promptPreview(item: ClarificationRequestRow): string {
  const prompt = item.question_spec?.prompt;
  return typeof prompt === 'string' && prompt.trim() ? prompt.trim() : '(no prompt)';
}

type AuthState = 'loading' | 'anonymous' | 'operator';

export function ParkingLotPanel() {
  const [auth, setAuth] = useState<AuthState>('loading');
  const [items, setItems] = useState<ClarificationRequestRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resolutionDraft, setResolutionDraft] = useState<ClarificationResolution>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoadError(null);
    const res = await fetch('/api/admin/clarification-requests?status=pending&limit=50', {
      credentials: 'include',
    });
    if (!res.ok) {
      setLoadError(`Failed to load deferred questions (${res.status})`);
      setItems([]);
      return;
    }
    const data = (await res.json()) as { items?: ClarificationRequestRow[] };
    setItems((data.items ?? []).filter(isParkedItem));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        if (!res.ok) {
          if (!cancelled) setAuth('anonymous');
          return;
        }
        const data = (await res.json()) as { authenticated?: boolean; user?: { id: string } };
        if (!data.authenticated || !isOpenGrimoireAdminSessionUser(data.user)) {
          if (!cancelled) setAuth('anonymous');
          return;
        }
        if (!cancelled) setAuth('operator');
        await refresh();
      } catch {
        if (!cancelled) setAuth('anonymous');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    setResolutionDraft({});
    setSubmitError(null);
  }, [selectedId]);

  const parkedVisible = useMemo(() => items.slice(0, PARKING_LOT_CAP), [items]);

  const grouped = useMemo(() => {
    const map = new Map<string, ClarificationRequestRow[]>();
    for (const item of parkedVisible) {
      const key = projectLabel(item);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [parkedVisible]);

  const selected = parkedVisible.find((i) => i.id === selectedId) ?? null;

  const patchItem = async (status: 'answered' | 'superseded') => {
    if (!selectedId) return;
    setBusy(true);
    setSubmitError(null);
    try {
      const body =
        status === 'answered'
          ? { resolution: resolutionDraft, status: 'answered' as const }
          : { status: 'superseded' as const };
      const res = await fetch(`/api/admin/clarification-requests/${selectedId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        throw new Error(payload.message ?? payload.error ?? `Failed (${res.status})`);
      }
      setSelectedId(null);
      await refresh();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Resolve failed');
    } finally {
      setBusy(false);
    }
  };

  if (auth === 'loading') {
    return (
      <div className="mt-6 text-left text-sm text-gray-500 dark:text-gray-400" data-testid="success-parking-lot">
        Checking operator session…
      </div>
    );
  }

  if (auth === 'anonymous') {
    return (
      <div
        className="mt-6 rounded-md border border-dashed border-gray-300 p-4 text-left dark:border-gray-600"
        data-testid="success-parking-lot"
      >
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Deferred questions</p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Sign in as operator to see and resolve parked harness questions from other projects.
        </p>
        <a
          href="/login"
          className="mt-3 inline-block text-sm text-blue-600 underline dark:text-blue-400"
          data-testid="success-parking-login-cta"
        >
          Sign in to resolve deferred questions
        </a>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3 text-left" data-testid="success-parking-lot">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Deferred questions</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Non-blocking parking lot (`blocking: false`). Grouped by project.
          </p>
        </div>
        <a
          href="/admin/clarification-queue"
          className="text-xs text-blue-600 underline dark:text-blue-400"
          data-testid="success-parking-full-queue-link"
        >
          Full clarification queue
        </a>
      </div>

      {loadError ? (
        <p className="text-sm text-red-600" role="alert">
          {loadError}
        </p>
      ) : null}

      {items.length === 0 && !loadError ? (
        <p className="text-sm text-gray-500 dark:text-gray-400" data-testid="success-parking-empty">
          No parked questions. Agents POST clarifications with `blocking: false` and `project` to fill this list.
        </p>
      ) : null}

      {grouped.map(([project, projectItems]) => (
          <div key={project} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {project}
            </p>
            <ul className="space-y-2">
              {projectItems.map((item) => {
                const open = selectedId === item.id;
                return (
                  <li
                    key={item.id}
                    className="rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
                    data-testid={`success-parking-item-${item.id}`}
                  >
                    <button
                      type="button"
                      className="w-full text-left text-sm text-gray-900 dark:text-gray-100"
                      onClick={() => setSelectedId(open ? null : item.id)}
                      data-testid={`success-parking-toggle-${item.id}`}
                    >
                      <span className="line-clamp-2">{promptPreview(item)}</span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {open ? 'Collapse' : 'Resolve inline'}
                      </span>
                    </button>
                    {open && selected?.id === item.id ? (
                      <div className="mt-3 space-y-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                        <DynamicQuestionPanel
                          spec={item.question_spec}
                          value={resolutionDraft}
                          onChange={setResolutionDraft}
                          disabled={busy}
                        />
                        {submitError ? (
                          <p className="text-xs text-red-600" role="alert">
                            {submitError}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="secondary-button"
                            disabled={busy}
                            onClick={() => void patchItem('answered')}
                            data-testid={`success-parking-answer-${item.id}`}
                          >
                            Answer
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            disabled={busy}
                            onClick={() => void patchItem('superseded')}
                            data-testid={`success-parking-supersede-${item.id}`}
                          >
                            Supersede
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

      {items.length > PARKING_LOT_CAP ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing {PARKING_LOT_CAP} of {items.length}. See the{' '}
          <a href="/admin/clarification-queue" className="underline">
            full queue
          </a>{' '}
          for the rest.
        </p>
      ) : null}
    </div>
  );
}
