'use client';

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { dispatchSurveyDataChanged } from '@/lib/survey/survey-data-change-event';

interface QueueItem {
  id: string;
  unique_quality: string;
  attendee: {
    first_name: string;
    last_name: string | null;
    is_anonymous: boolean;
  };
  moderation: {
    status: 'pending' | 'approved' | 'rejected' | null;
    notes: string | null;
  } | null;
  created_at: string;
}

interface ClarificationBacklogItem {
  id: string;
  created_at: string;
  question_spec: {
    prompt: string;
  };
}

type QueueStatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
type QueueAgeSort = 'newest_first' | 'oldest_first';
type RightColumnTab =
  | 'context'
  | 'backlog'
  | 'activity'
  | 'health'
  | 'jobs'
  | 'ops'
  | 'local-ai'
  | 'recipes'
  | 'local-activity';

interface ActivityFeedResponse {
  mode: 'placeholder';
  status: 'degraded' | 'ok';
  summary: string;
  runbookPath: string;
}

interface CockpitHealthResponse {
  panel: 'capabilities-read-gate-health';
  mode: 'read_only';
  capabilitiesPath: string;
  readGateExpectations: Array<{ id: string; label: string; value: string }>;
  summary: string;
}

interface CockpitJobsResponse {
  panel: 'jobs-and-automation';
  mode: 'read_only_link_aggregation';
  links: Array<{ id: string; title: string; status: string; href: string; note: string }>;
  summary: string;
}

interface CockpitOpsResponse {
  panel: 'recurring-operations';
  mode: 'read_only';
  runbookPath: string;
  items: Array<{
    id: string;
    workflow: string;
    schedule: string;
    owner: string;
    evidencePath: string;
  }>;
}

interface LocalAiRuntimeHealthResponse {
  panel: 'local-ai-runtime-health';
  mode: 'read_only';
  summary: string;
  sqlite: {
    dbPath: string;
    dataDir: string;
    dbExists: boolean;
    dataDirExists: boolean;
    dataDirWritable: boolean;
  };
  ollama: {
    baseUrl: string;
    status: 'ok' | 'missing' | 'unreachable' | 'not_checked';
    models: string[];
    error: string | null;
  };
  docker: {
    status: 'ok' | 'missing' | 'unreachable' | 'not_checked';
    note: string;
  };
  verification: Array<{ id: string; label: string; command: string }>;
  nextActions: string[];
}

interface WorkflowRecipesResponse {
  panel: 'workflow-recipes';
  mode: 'read_only';
  summary: string;
  recipes: Array<{
    id: string;
    title: string;
    purpose: string;
    runtime: string;
    riskTier: string;
    requiredModels: string[];
    commands: string[];
    artifacts: string[];
    verification: string[];
    agentParity: {
      humanSurface: string;
      toolSurface: string;
      note: string;
    };
  }>;
}

interface LocalAiActivityResponse {
  panel: 'local-ai-activity-log';
  mode: 'jsonl_adapter';
  logPath: string;
  summary: string;
  skippedMalformedLines: number;
  events: Array<{
    id: string;
    ts: string;
    kind: string;
    summary: string;
    detail?: string;
  }>;
}

const COCKPIT_SESSION_KEY = 'opengrimoire.adminCockpit.v1';

export function AdminPanel() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedResponseId, setSelectedResponseId] = React.useState<string | null>(null);
  const [detailNotesDraft, setDetailNotesDraft] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<QueueStatusFilter>('all');
  const [ageSort, setAgeSort] = React.useState<QueueAgeSort>('newest_first');
  const [activeRightTab, setActiveRightTab] = React.useState<RightColumnTab>('context');
  const [sessionHydrated, setSessionHydrated] = React.useState(false);

  const queueQuery = useQuery({
    queryKey: ['admin', 'moderation-queue'],
    queryFn: async () => {
      const res = await fetch('/api/admin/moderation-queue', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Failed to load queue (${res.status})`);
      }
      const data = (await res.json()) as { items?: QueueItem[] };
      return data.items ?? [];
    },
  });

  const moderationMutation = useMutation({
    mutationFn: async ({
      responseId,
      status,
      notes,
    }: {
      responseId: string;
      status: 'approved' | 'rejected';
      notes?: string;
    }) => {
      const res = await fetch(`/api/admin/moderation/${responseId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Moderation failed (${res.status}): ${text}`);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'moderation-queue'] });
      dispatchSurveyDataChanged('moderation-patch');
    },
  });
  const clarificationBacklogQuery = useQuery({
    queryKey: ['admin', 'clarification-requests', 'pending', 'cockpit'],
    queryFn: async () => {
      const res = await fetch('/api/admin/clarification-requests?status=pending&limit=5', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Failed to load backlog (${res.status})`);
      }
      const data = (await res.json()) as { items?: ClarificationBacklogItem[] };
      return data.items ?? [];
    },
  });
  const activityFeedQuery = useQuery({
    queryKey: ['admin', 'activity-feed', 'cockpit'],
    queryFn: async () => {
      const res = await fetch('/api/admin/activity', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Failed to load activity (${res.status})`);
      }
      return (await res.json()) as ActivityFeedResponse;
    },
  });
  const healthPanelQuery = useQuery({
    queryKey: ['admin', 'cockpit-health', 'read-gate'],
    queryFn: async () => {
      const res = await fetch('/api/admin/cockpit/health', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Failed to load health panel (${res.status})`);
      }
      return (await res.json()) as CockpitHealthResponse;
    },
  });
  const jobsPanelQuery = useQuery({
    queryKey: ['admin', 'cockpit-jobs'],
    queryFn: async () => {
      const res = await fetch('/api/admin/cockpit/jobs', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Failed to load jobs panel (${res.status})`);
      }
      return (await res.json()) as CockpitJobsResponse;
    },
  });
  const opsPanelQuery = useQuery({
    queryKey: ['admin', 'cockpit-ops'],
    queryFn: async () => {
      const res = await fetch('/api/admin/cockpit/ops', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Failed to load ops panel (${res.status})`);
      }
      return (await res.json()) as CockpitOpsResponse;
    },
  });
  const localAiHealthQuery = useQuery({
    queryKey: ['admin', 'cockpit-local-ai-health'],
    queryFn: async () => {
      const res = await fetch('/api/admin/cockpit/local-ai/health', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Failed to load local AI health (${res.status})`);
      }
      return (await res.json()) as LocalAiRuntimeHealthResponse;
    },
  });
  const workflowRecipesQuery = useQuery({
    queryKey: ['admin', 'cockpit-workflow-recipes'],
    queryFn: async () => {
      const res = await fetch('/api/admin/cockpit/workflow-recipes', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Failed to load workflow recipes (${res.status})`);
      }
      return (await res.json()) as WorkflowRecipesResponse;
    },
  });
  const localAiActivityQuery = useQuery({
    queryKey: ['admin', 'cockpit-local-ai-activity'],
    queryFn: async () => {
      const res = await fetch('/api/admin/cockpit/local-ai/activity', { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Failed to load local AI activity (${res.status})`);
      }
      return (await res.json()) as LocalAiActivityResponse;
    },
  });

  const error =
    queueQuery.error instanceof Error
      ? queueQuery.error.message
      : queueQuery.isError
        ? 'Failed to load moderation queue'
        : moderationMutation.error instanceof Error
          ? moderationMutation.error.message
          : moderationMutation.isError
            ? 'Failed to update moderation status'
            : undefined;

  React.useEffect(() => {
    if (queueQuery.error) {
      console.error('Error fetching queue:', queueQuery.error);
    }
  }, [queueQuery.error]);

  React.useEffect(() => {
    if (moderationMutation.error) {
      console.error('Moderation error:', moderationMutation.error);
    }
  }, [moderationMutation.error]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(COCKPIT_SESSION_KEY);
      // #region agent log
      fetch('http://127.0.0.1:7713/ingest/8fdb4202-1934-46c9-88cd-ef079adb7a06',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0032f5'},body:JSON.stringify({sessionId:'0032f5',runId:'pre-fix',hypothesisId:'H2',location:'src/components/AdminPanel/index.tsx:localStorageHydration',message:'Admin cockpit session raw state loaded',data:{hasRaw:Boolean(raw),rawLength:raw?.length ?? 0},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (!raw) {
        setSessionHydrated(true);
        return;
      }
      const parsed = JSON.parse(raw) as {
        statusFilter?: QueueStatusFilter;
        ageSort?: QueueAgeSort;
        activeRightTab?: RightColumnTab;
        selectedResponseId?: string | null;
      };
      // #region agent log
      fetch('http://127.0.0.1:7713/ingest/8fdb4202-1934-46c9-88cd-ef079adb7a06',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0032f5'},body:JSON.stringify({sessionId:'0032f5',runId:'pre-fix',hypothesisId:'H2',location:'src/components/AdminPanel/index.tsx:localStorageParsed',message:'Admin cockpit session parsed active tab',data:{activeRightTab:parsed.activeRightTab ?? null,statusFilter:parsed.statusFilter ?? null,ageSort:parsed.ageSort ?? null},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (parsed.statusFilter) setStatusFilter(parsed.statusFilter);
      if (parsed.ageSort) setAgeSort(parsed.ageSort);
      if (parsed.activeRightTab) setActiveRightTab(parsed.activeRightTab);
      if (typeof parsed.selectedResponseId === 'string') setSelectedResponseId(parsed.selectedResponseId);
    } catch (error) {
      console.warn('Unable to restore admin cockpit session state', error);
    } finally {
      setSessionHydrated(true);
    }
  }, []);

  React.useEffect(() => {
    if (!sessionHydrated || typeof window === 'undefined') return;
    const payload = {
      statusFilter,
      ageSort,
      activeRightTab,
      selectedResponseId,
    };
    window.localStorage.setItem(COCKPIT_SESSION_KEY, JSON.stringify(payload));
  }, [statusFilter, ageSort, activeRightTab, selectedResponseId, sessionHydrated]);

  React.useEffect(() => {
    const inv = () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'moderation-queue'] });
      dispatchSurveyDataChanged('admin-focus');
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
  }, [queryClient]);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const tabs = Array.from(document.querySelectorAll('[data-testid="admin-right-tabs"] [role="tab"]')).map((tab) => ({
      id: tab.id,
      ariaSelected: tab.getAttribute('aria-selected'),
      ariaControls: tab.getAttribute('aria-controls'),
    }));
    // #region agent log
    fetch('http://127.0.0.1:7713/ingest/8fdb4202-1934-46c9-88cd-ef079adb7a06',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0032f5'},body:JSON.stringify({sessionId:'0032f5',runId:'pre-fix',hypothesisId:'H1,H3,H4',location:'src/components/AdminPanel/index.tsx:tabDomSnapshot',message:'Admin cockpit tab DOM aria snapshot',data:{activeRightTab,tabs,invalidValues:tabs.filter((tab)=>tab.ariaSelected !== 'true' && tab.ariaSelected !== 'false'),selectedCount:tabs.filter((tab)=>tab.ariaSelected === 'true').length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [activeRightTab]);

  const handleModeration = (
    responseId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    moderationMutation.mutate({ responseId, status, notes });
  };

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };
  const applyPreset = (preset: 'pending_newest' | 'rejected_oldest') => {
    if (preset === 'pending_newest') {
      setStatusFilter('pending');
      setAgeSort('newest_first');
      return;
    }
    setStatusFilter('rejected');
    setAgeSort('oldest_first');
  };
  const getBacklogAgeBucket = (createdAt: string) => {
    const ageHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (ageHours >= 72) return { label: 'stale', classes: 'bg-red-100 text-red-800' };
    if (ageHours >= 24) return { label: 'aging', classes: 'bg-amber-100 text-amber-800' };
    return { label: 'fresh', classes: 'bg-emerald-100 text-emerald-800' };
  };

  const queue = queueQuery.data ?? [];
  const queueFilteredAndSorted = [...queue]
    .filter((item) => {
      if (statusFilter === 'all') {
        return true;
      }
      return (item.moderation?.status ?? 'pending') === statusFilter;
    })
    .sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return ageSort === 'newest_first' ? timeB - timeA : timeA - timeB;
    });
  const loading = queueQuery.isPending;
  const selectedItem =
    queueFilteredAndSorted.find((item) => item.id === selectedResponseId) ?? queueFilteredAndSorted[0] ?? null;

  React.useEffect(() => {
    if (!queueFilteredAndSorted.length) {
      setSelectedResponseId(null);
      setDetailNotesDraft('');
      return;
    }
    if (
      !selectedResponseId ||
      !queueFilteredAndSorted.some((item) => item.id === selectedResponseId)
    ) {
      setSelectedResponseId(queueFilteredAndSorted[0].id);
    }
  }, [queueFilteredAndSorted, selectedResponseId]);

  React.useEffect(() => {
    setDetailNotesDraft(selectedItem?.moderation?.notes ?? '');
  }, [selectedItem?.id, selectedItem?.moderation?.notes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" data-testid="admin-moderation-shell">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Response Moderation Queue</h2>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              void queryClient.invalidateQueries({ queryKey: ['admin', 'moderation-queue'] });
              dispatchSurveyDataChanged('admin-refresh-button');
            }}
            className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Refresh
          </button>
          <button
            onClick={async () => {
              const res = await fetch('/api/admin/debug-survey', { credentials: 'include' });
              const body = await res.json();
              console.log('Debug survey:', body);
            }}
            className="px-4 py-2 bg-amber-900 text-white rounded hover:bg-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-700"
          >
            Debug Data
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">{error}</div>
      )}

      {queue.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No responses waiting for moderation.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <section
            className="space-y-4 lg:col-span-3"
            data-testid="admin-moderation-column-queue"
            aria-label="Moderation queue"
          >
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2">
              <label className="text-sm text-gray-700" htmlFor="moderation-status-filter">
                Status
                <select
                  id="moderation-status-filter"
                  data-testid="moderation-queue-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as QueueStatusFilter)}
                  className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label className="text-sm text-gray-700" htmlFor="moderation-age-sort">
                Age
                <select
                  id="moderation-age-sort"
                  data-testid="moderation-queue-age-sort"
                  value={ageSort}
                  onChange={(e) => setAgeSort(e.target.value as QueueAgeSort)}
                  className="mt-1 block w-full rounded-md border-gray-300 text-sm"
                >
                  <option value="newest_first">Newest first</option>
                  <option value="oldest_first">Oldest first</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                data-testid="moderation-queue-preset-pending-newest"
                onClick={() => applyPreset('pending_newest')}
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800 hover:bg-blue-100"
              >
                Pending + Newest
              </button>
              <button
                type="button"
                data-testid="moderation-queue-preset-rejected-oldest"
                onClick={() => applyPreset('rejected_oldest')}
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-800 hover:bg-rose-100"
              >
                Rejected + Oldest
              </button>
            </div>
            {queueFilteredAndSorted.length === 0 ? (
              <p className="text-sm text-gray-500" data-testid="moderation-queue-empty-filtered">
                No queue items match the selected filters.
              </p>
            ) : (
              queueFilteredAndSorted.map((item) => (
              <button
                type="button"
                key={item.id}
                data-testid={`moderation-queue-item-${item.id}`}
                onClick={() => setSelectedResponseId(item.id)}
                className={`w-full text-left bg-white shadow rounded-lg p-6 space-y-3 border ${
                  selectedItem?.id === item.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">
                      From:{' '}
                      {item.attendee && item.attendee.first_name
                        ? `${item.attendee.first_name}${item.attendee.last_name ? ' ' + item.attendee.last_name : ''}`
                        : 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                    {item.moderation?.status ?? 'pending'}
                  </span>
                </div>
                <p className="text-gray-800 line-clamp-3">{item.unique_quality}</p>
              </button>
              ))
            )}
          </section>
          <aside
            className="bg-white shadow rounded-lg p-6 space-y-4 lg:col-span-2"
            data-testid="admin-moderation-column-detail"
            aria-label="Selected moderation detail"
          >
            <div
              role="tablist"
              aria-label="Cockpit detail tabs"
              data-testid="admin-right-tabs"
              data-agent-debug-build="aria-literal-tabs-v2"
              className="grid grid-cols-2 gap-2 sm:grid-cols-3"
            >
              {activeRightTab === 'context' ? (
                <button
                  id="admin-right-tab-context"
                  type="button"
                  role="tab"
                  aria-selected="true"
                  aria-controls="admin-right-tabpanel-context"
                  data-testid="admin-right-tab-context"
                  onClick={() => setActiveRightTab('context')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-900 text-white"
                >
                  Context
                </button>
              ) : (
                <button
                  id="admin-right-tab-context"
                  type="button"
                  role="tab"
                  aria-selected="false"
                  aria-controls="admin-right-tabpanel-context"
                  data-testid="admin-right-tab-context"
                  onClick={() => setActiveRightTab('context')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700"
                >
                  Context
                </button>
              )}
              {activeRightTab === 'backlog' ? (
                <button
                  id="admin-right-tab-backlog"
                  type="button"
                  role="tab"
                  aria-selected="true"
                  aria-controls="admin-right-tabpanel-backlog"
                  data-testid="admin-right-tab-backlog"
                  onClick={() => setActiveRightTab('backlog')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-900 text-white"
                >
                  Backlog
                </button>
              ) : (
                <button
                  id="admin-right-tab-backlog"
                  type="button"
                  role="tab"
                  aria-selected="false"
                  aria-controls="admin-right-tabpanel-backlog"
                  data-testid="admin-right-tab-backlog"
                  onClick={() => setActiveRightTab('backlog')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700"
                >
                  Backlog
                </button>
              )}
              {activeRightTab === 'activity' ? (
                <button
                  id="admin-right-tab-activity"
                  type="button"
                  role="tab"
                  aria-selected="true"
                  aria-controls="admin-right-tabpanel-activity"
                  data-testid="admin-right-tab-activity"
                  onClick={() => setActiveRightTab('activity')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-900 text-white"
                >
                  Activity
                </button>
              ) : (
                <button
                  id="admin-right-tab-activity"
                  type="button"
                  role="tab"
                  aria-selected="false"
                  aria-controls="admin-right-tabpanel-activity"
                  data-testid="admin-right-tab-activity"
                  onClick={() => setActiveRightTab('activity')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700"
                >
                  Activity
                </button>
              )}
              {activeRightTab === 'health' ? (
                <button
                  id="admin-right-tab-health"
                  type="button"
                  role="tab"
                  aria-selected="true"
                  aria-controls="admin-right-tabpanel-health"
                  data-testid="admin-right-tab-health"
                  onClick={() => setActiveRightTab('health')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-900 text-white"
                >
                  Health
                </button>
              ) : (
                <button
                  id="admin-right-tab-health"
                  type="button"
                  role="tab"
                  aria-selected="false"
                  aria-controls="admin-right-tabpanel-health"
                  data-testid="admin-right-tab-health"
                  onClick={() => setActiveRightTab('health')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700"
                >
                  Health
                </button>
              )}
              {activeRightTab === 'jobs' ? (
                <button
                  id="admin-right-tab-jobs"
                  type="button"
                  role="tab"
                  aria-selected="true"
                  aria-controls="admin-right-tabpanel-jobs"
                  data-testid="admin-right-tab-jobs"
                  onClick={() => setActiveRightTab('jobs')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-900 text-white"
                >
                  Jobs
                </button>
              ) : (
                <button
                  id="admin-right-tab-jobs"
                  type="button"
                  role="tab"
                  aria-selected="false"
                  aria-controls="admin-right-tabpanel-jobs"
                  data-testid="admin-right-tab-jobs"
                  onClick={() => setActiveRightTab('jobs')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700"
                >
                  Jobs
                </button>
              )}
              {activeRightTab === 'ops' ? (
                <button
                  id="admin-right-tab-ops"
                  type="button"
                  role="tab"
                  aria-selected="true"
                  aria-controls="admin-right-tabpanel-ops"
                  data-testid="admin-right-tab-ops"
                  onClick={() => setActiveRightTab('ops')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-900 text-white"
                >
                  Ops
                </button>
              ) : (
                <button
                  id="admin-right-tab-ops"
                  type="button"
                  role="tab"
                  aria-selected="false"
                  aria-controls="admin-right-tabpanel-ops"
                  data-testid="admin-right-tab-ops"
                  onClick={() => setActiveRightTab('ops')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700"
                >
                  Ops
                </button>
              )}
              {activeRightTab === 'local-ai' ? (
                <button
                  id="admin-right-tab-local-ai"
                  type="button"
                  role="tab"
                  aria-selected="true"
                  aria-controls="admin-right-tabpanel-local-ai"
                  data-testid="admin-right-tab-local-ai"
                  onClick={() => setActiveRightTab('local-ai')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-900 text-white"
                >
                  Local AI
                </button>
              ) : (
                <button
                  id="admin-right-tab-local-ai"
                  type="button"
                  role="tab"
                  aria-selected="false"
                  aria-controls="admin-right-tabpanel-local-ai"
                  data-testid="admin-right-tab-local-ai"
                  onClick={() => setActiveRightTab('local-ai')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700"
                >
                  Local AI
                </button>
              )}
              {activeRightTab === 'recipes' ? (
                <button
                  id="admin-right-tab-recipes"
                  type="button"
                  role="tab"
                  aria-selected="true"
                  aria-controls="admin-right-tabpanel-recipes"
                  data-testid="admin-right-tab-recipes"
                  onClick={() => setActiveRightTab('recipes')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-900 text-white"
                >
                  Recipes
                </button>
              ) : (
                <button
                  id="admin-right-tab-recipes"
                  type="button"
                  role="tab"
                  aria-selected="false"
                  aria-controls="admin-right-tabpanel-recipes"
                  data-testid="admin-right-tab-recipes"
                  onClick={() => setActiveRightTab('recipes')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700"
                >
                  Recipes
                </button>
              )}
              {activeRightTab === 'local-activity' ? (
                <button
                  id="admin-right-tab-local-activity"
                  type="button"
                  role="tab"
                  aria-selected="true"
                  aria-controls="admin-right-tabpanel-local-activity"
                  data-testid="admin-right-tab-local-activity"
                  onClick={() => setActiveRightTab('local-activity')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-900 text-white"
                >
                  Activity Log
                </button>
              ) : (
                <button
                  id="admin-right-tab-local-activity"
                  type="button"
                  role="tab"
                  aria-selected="false"
                  aria-controls="admin-right-tabpanel-local-activity"
                  data-testid="admin-right-tab-local-activity"
                  onClick={() => setActiveRightTab('local-activity')}
                  className="rounded-md px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700"
                >
                  Activity Log
                </button>
              )}
            </div>
            {!selectedItem && activeRightTab === 'context' ? (
              <p className="text-sm text-gray-500" data-testid="moderation-detail-empty">
                Select a queue item to view details.
              </p>
            ) : (
              <>
                {activeRightTab === 'context' && selectedItem && (
                  <section
                    role="tabpanel"
                    id="admin-right-tabpanel-context"
                    aria-labelledby="admin-right-tab-context"
                    data-testid="admin-right-tabpanel-context"
                    className="space-y-4"
                  >
                    <div data-testid="moderation-detail-pane">
                      <p className="text-xs uppercase text-gray-500 tracking-wide">Selected response</p>
                      <p className="text-sm text-gray-700 mt-1" data-testid="moderation-detail-selected-id">
                        {selectedItem.id}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Submitted: {new Date(selectedItem.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Current status: {selectedItem.moderation?.status ?? 'pending'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded p-4">
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedItem.unique_quality}</p>
                    </div>
                    <div className="flex flex-row space-x-2 w-full">
                      <button
                        type="button"
                        data-testid="moderation-detail-approve"
                        disabled={moderationMutation.isPending}
                        onClick={() => void handleModeration(selectedItem.id, 'approved')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-800 hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 w-1/2 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        data-testid="moderation-detail-reject"
                        disabled={moderationMutation.isPending}
                        onClick={() => void handleModeration(selectedItem.id, 'rejected')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 w-1/2 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                    <div>
                      <label htmlFor="moderation-detail-notes" className="block text-sm font-medium text-gray-700">
                        Moderation Notes (Optional)
                      </label>
                      <textarea
                        id="moderation-detail-notes"
                        data-testid="moderation-detail-notes"
                        rows={3}
                        value={detailNotesDraft}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Add notes about your moderation decision..."
                        onChange={(e) => setDetailNotesDraft(e.target.value)}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value && selectedItem) {
                            void handleModeration(selectedItem.id, 'approved', value);
                          }
                        }}
                      />
                    </div>
                  </section>
                )}
                {activeRightTab === 'backlog' && (
                  <section
                    role="tabpanel"
                    id="admin-right-tabpanel-backlog"
                    aria-labelledby="admin-right-tab-backlog"
                    data-testid="admin-right-tabpanel-backlog"
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Survey review backlog</h3>
                    {clarificationBacklogQuery.isPending ? (
                      <p className="mt-2 text-sm text-gray-500">Loading backlog...</p>
                    ) : clarificationBacklogQuery.isError ? (
                      <p className="mt-2 text-sm text-amber-700" data-testid="admin-backlog-error">
                        Unable to load backlog right now.
                      </p>
                    ) : (
                      <>
                        <p className="mt-2 text-sm text-gray-700" data-testid="admin-backlog-count">
                          Pending clarification items: {clarificationBacklogQuery.data?.length ?? 0}
                        </p>
                        <ul className="mt-2 space-y-2 text-sm text-gray-700" data-testid="admin-backlog-list">
                          {(clarificationBacklogQuery.data ?? []).map((item) => {
                            const age = getBacklogAgeBucket(item.created_at);
                            return (
                              <li key={item.id} className="rounded border border-gray-200 bg-white p-2">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="line-clamp-2">{item.question_spec.prompt}</span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${age.classes}`}
                                    data-testid={`admin-backlog-age-${item.id}`}
                                  >
                                    {age.label}
                                  </span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <a className="text-blue-600 underline" href="/admin/clarification-queue" data-testid="admin-backlog-link">
                        Open clarification queue
                      </a>
                      <a className="text-blue-600 underline" href="/admin/alignment">
                        Alignment context
                      </a>
                    </div>
                  </section>
                )}
                {activeRightTab === 'activity' && (
                  <section
                    role="tabpanel"
                    id="admin-right-tabpanel-activity"
                    aria-labelledby="admin-right-tab-activity"
                    data-testid="admin-right-tabpanel-activity"
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Activity stream</h3>
                    {activityFeedQuery.isPending ? (
                      <p className="mt-2 text-sm text-gray-600" data-testid="admin-activity-loading">
                        Loading activity feed...
                      </p>
                    ) : activityFeedQuery.isError ? (
                      <p className="mt-2 text-sm text-amber-700" data-testid="admin-activity-error">
                        Activity feed unavailable. Use the runbook while canonical sources are finalized.
                      </p>
                    ) : (
                      <div data-testid="admin-activity-placeholder">
                        <p className="mt-2 text-sm text-gray-700">
                          {activityFeedQuery.data?.summary ??
                            'Canonical activity feed endpoint is not yet available. This panel is a placeholder and does not claim live event completeness.'}
                        </p>
                      </div>
                    )}
                    <a
                      className="mt-2 inline-block text-blue-600 underline text-sm"
                      href={activityFeedQuery.data?.runbookPath ?? '/docs/OPERATOR_GUI_RUNBOOK.md'}
                      data-testid="admin-activity-runbook-link"
                    >
                      Open operator runbook
                    </a>
                  </section>
                )}
                {activeRightTab === 'health' && (
                  <section
                    role="tabpanel"
                    id="admin-right-tabpanel-health"
                    aria-labelledby="admin-right-tab-health"
                    data-testid="admin-right-tabpanel-health"
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Capabilities / read-gate health
                    </h3>
                    {healthPanelQuery.isPending ? (
                      <p className="mt-2 text-sm text-gray-600">Loading health panel...</p>
                    ) : healthPanelQuery.isError ? (
                      <p className="mt-2 text-sm text-amber-700" data-testid="admin-health-error">
                        Health panel unavailable right now.
                      </p>
                    ) : (
                      <div data-testid="admin-health-panel" className="mt-2 space-y-2 text-sm text-gray-700">
                        <p>{healthPanelQuery.data?.summary}</p>
                        <a
                          className="text-blue-600 underline"
                          href={healthPanelQuery.data?.capabilitiesPath ?? '/api/capabilities'}
                          data-testid="admin-health-capabilities-link"
                        >
                          Open capabilities manifest
                        </a>
                        <ul className="space-y-1">
                          {(healthPanelQuery.data?.readGateExpectations ?? []).map((expectation) => (
                            <li key={expectation.id}>
                              <span className="font-semibold">{expectation.label}:</span>{' '}
                              <span
                                data-testid={
                                  expectation.id === 'prod-smoke-command'
                                    ? 'admin-health-read-gate-command'
                                    : undefined
                                }
                              >
                                {expectation.value}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}
                {activeRightTab === 'jobs' && (
                  <section
                    role="tabpanel"
                    id="admin-right-tabpanel-jobs"
                    aria-labelledby="admin-right-tab-jobs"
                    data-testid="admin-right-tabpanel-jobs"
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Jobs and automation</h3>
                    {jobsPanelQuery.isPending ? (
                      <p className="mt-2 text-sm text-gray-600">Loading jobs panel...</p>
                    ) : jobsPanelQuery.isError ? (
                      <p className="mt-2 text-sm text-amber-700" data-testid="admin-jobs-error">
                        Jobs panel unavailable right now.
                      </p>
                    ) : (
                      <div data-testid="admin-jobs-panel" className="mt-2 space-y-2 text-sm text-gray-700">
                        <p>{jobsPanelQuery.data?.summary}</p>
                        <ul className="space-y-2">
                          {(jobsPanelQuery.data?.links ?? []).map((link) => (
                            <li key={link.id} className="rounded border border-gray-200 bg-white p-2">
                              <p className="font-medium">{link.title}</p>
                              <a
                                className="text-blue-600 underline"
                                href={link.href}
                                data-testid={
                                  link.id === 'e2e'
                                    ? 'admin-jobs-link-e2e'
                                    : link.id === 'prod-smoke'
                                      ? 'admin-jobs-link-prod-smoke'
                                      : link.id === 'gha'
                                        ? 'admin-jobs-link-gha'
                                        : undefined
                                }
                                target="_blank"
                                rel="noreferrer"
                              >
                                {link.status}
                              </a>
                              <p className="text-xs text-gray-500">{link.note}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}
                {activeRightTab === 'ops' && (
                  <section
                    role="tabpanel"
                    id="admin-right-tabpanel-ops"
                    aria-labelledby="admin-right-tab-ops"
                    data-testid="admin-right-tabpanel-ops"
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Recurring operations</h3>
                    {opsPanelQuery.isPending ? (
                      <p className="mt-2 text-sm text-gray-600">Loading recurring operations...</p>
                    ) : opsPanelQuery.isError ? (
                      <p className="mt-2 text-sm text-amber-700" data-testid="admin-ops-error">
                        Recurring operations unavailable right now.
                      </p>
                    ) : (
                      <div data-testid="admin-ops-panel" className="mt-2 space-y-2">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left text-sm text-gray-700">
                            <thead>
                              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                                <th className="py-1 pr-2">Workflow</th>
                                <th className="py-1 pr-2">Schedule</th>
                                <th className="py-1 pr-2">Owner</th>
                                <th className="py-1">Evidence</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(opsPanelQuery.data?.items ?? []).map((item) => (
                                <tr key={item.id} data-testid={`admin-ops-row-${item.id}`} className="border-b border-gray-100">
                                  <td className="py-1 pr-2">{item.workflow}</td>
                                  <td className="py-1 pr-2">{item.schedule}</td>
                                  <td className="py-1 pr-2">{item.owner}</td>
                                  <td className="py-1 font-mono text-xs">{item.evidencePath}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <a
                          className="text-blue-600 underline text-sm"
                          href={opsPanelQuery.data?.runbookPath ?? '/docs/runbooks/recurring-operations.md'}
                          data-testid="admin-ops-runbook-link"
                        >
                          Open recurring operations runbook
                        </a>
                      </div>
                    )}
                  </section>
                )}
                {activeRightTab === 'local-ai' && (
                  <section
                    role="tabpanel"
                    id="admin-right-tabpanel-local-ai"
                    aria-labelledby="admin-right-tab-local-ai"
                    data-testid="admin-right-tabpanel-local-ai"
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Local AI setup
                    </h3>
                    {localAiHealthQuery.isPending ? (
                      <p className="mt-2 text-sm text-gray-600">Loading local AI setup...</p>
                    ) : localAiHealthQuery.isError ? (
                      <p className="mt-2 text-sm text-amber-700" data-testid="admin-local-ai-error">
                        Local AI setup unavailable right now.
                      </p>
                    ) : (
                      <div data-testid="admin-local-ai-panel" className="mt-2 space-y-3 text-sm text-gray-700">
                        <p>{localAiHealthQuery.data?.summary}</p>
                        <div className="rounded border border-gray-200 bg-white p-2">
                          <p className="font-semibold">SQLite</p>
                          <p className="font-mono text-xs" data-testid="admin-local-ai-db-path">
                            {localAiHealthQuery.data?.sqlite.dbPath}
                          </p>
                          <p data-testid="admin-local-ai-data-dir-status">
                            Data directory writable:{' '}
                            {localAiHealthQuery.data?.sqlite.dataDirWritable ? 'yes' : 'no'}
                          </p>
                        </div>
                        <div className="rounded border border-gray-200 bg-white p-2">
                          <p className="font-semibold">Ollama</p>
                          <p data-testid="admin-local-ai-ollama-status">
                            Status: {localAiHealthQuery.data?.ollama.status}
                          </p>
                          <p className="font-mono text-xs">{localAiHealthQuery.data?.ollama.baseUrl}</p>
                          <p>
                            Models:{' '}
                            {(localAiHealthQuery.data?.ollama.models ?? []).length > 0
                              ? localAiHealthQuery.data?.ollama.models.join(', ')
                              : 'none detected'}
                          </p>
                        </div>
                        <div className="rounded border border-gray-200 bg-white p-2">
                          <p className="font-semibold">Docker</p>
                          <p data-testid="admin-local-ai-docker-note">{localAiHealthQuery.data?.docker.note}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Next action</p>
                          <ul className="list-disc pl-5">
                            {(localAiHealthQuery.data?.nextActions ?? []).map((action) => (
                              <li key={action} data-testid="admin-local-ai-next-action">
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </section>
                )}
                {activeRightTab === 'recipes' && (
                  <section
                    role="tabpanel"
                    id="admin-right-tabpanel-recipes"
                    aria-labelledby="admin-right-tab-recipes"
                    data-testid="admin-right-tabpanel-recipes"
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Workflow recipes
                    </h3>
                    {workflowRecipesQuery.isPending ? (
                      <p className="mt-2 text-sm text-gray-600">Loading workflow recipes...</p>
                    ) : workflowRecipesQuery.isError ? (
                      <p className="mt-2 text-sm text-amber-700" data-testid="admin-recipes-error">
                        Workflow recipes unavailable right now.
                      </p>
                    ) : (
                      <div data-testid="admin-recipes-panel" className="mt-2 space-y-3 text-sm text-gray-700">
                        <p>{workflowRecipesQuery.data?.summary}</p>
                        {(workflowRecipesQuery.data?.recipes ?? []).map((recipe) => (
                          <article
                            key={recipe.id}
                            className="rounded border border-gray-200 bg-white p-3"
                            data-testid={`admin-recipe-${recipe.id}`}
                          >
                            <h4 className="font-semibold">{recipe.title}</h4>
                            <p className="mt-1">{recipe.purpose}</p>
                            <p className="mt-2">
                              Runtime: <span data-testid="admin-recipe-runtime">{recipe.runtime}</span> / Risk:{' '}
                              {recipe.riskTier}
                            </p>
                            <p>Required models: {recipe.requiredModels.join(', ')}</p>
                            <p>Commands: {recipe.commands.join(' | ')}</p>
                            <p>Artifacts: {recipe.artifacts.join(', ')}</p>
                            <p className="text-xs text-gray-500">{recipe.agentParity.note}</p>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                )}
                {activeRightTab === 'local-activity' && (
                  <section
                    role="tabpanel"
                    id="admin-right-tabpanel-local-activity"
                    aria-labelledby="admin-right-tab-local-activity"
                    data-testid="admin-right-tabpanel-local-activity"
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Local AI activity log
                    </h3>
                    {localAiActivityQuery.isPending ? (
                      <p className="mt-2 text-sm text-gray-600">Loading local AI activity...</p>
                    ) : localAiActivityQuery.isError ? (
                      <p className="mt-2 text-sm text-amber-700" data-testid="admin-local-activity-error">
                        Local AI activity unavailable right now.
                      </p>
                    ) : (
                      <div data-testid="admin-local-activity-panel" className="mt-2 space-y-3 text-sm text-gray-700">
                        <p>{localAiActivityQuery.data?.summary}</p>
                        <p className="font-mono text-xs" data-testid="admin-local-activity-log-path">
                          {localAiActivityQuery.data?.logPath}
                        </p>
                        <p>Malformed lines skipped: {localAiActivityQuery.data?.skippedMalformedLines ?? 0}</p>
                        <ul className="space-y-2">
                          {(localAiActivityQuery.data?.events ?? []).map((event) => (
                            <li key={event.id} className="rounded border border-gray-200 bg-white p-2">
                              <p className="font-medium">{event.summary}</p>
                              <p className="text-xs text-gray-500">
                                {event.kind} / {event.ts}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
