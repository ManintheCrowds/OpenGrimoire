'use client';

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

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

export function AdminPanel() {
  const queryClient = useQueryClient();
  const router = useRouter();

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
    const inv = () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'moderation-queue'] });
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

  const queue = queueQuery.data ?? [];
  const loading = queueQuery.isPending;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Response Moderation Queue</h2>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() =>
              void queryClient.invalidateQueries({ queryKey: ['admin', 'moderation-queue'] })
            }
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
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
        <div className="space-y-4">
          {queue.map((item) => (
            <div key={item.id} className="bg-white shadow rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-start flex-col sm:flex-row">
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
                <div className="w-full sm:w-auto mt-4 sm:mt-0">
                  <div className="flex flex-row space-x-2 w-full">
                    <button
                      type="button"
                      disabled={moderationMutation.isPending}
                      onClick={() => void handleModeration(item.id, 'approved')}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-1/2 sm:w-auto disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={moderationMutation.isPending}
                      onClick={() => void handleModeration(item.id, 'rejected')}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 w-1/2 sm:w-auto disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <p className="text-gray-800">{item.unique_quality}</p>
              </div>
              <div>
                <label htmlFor={`notes-${item.id}`} className="block text-sm font-medium text-gray-700">
                  Moderation Notes (Optional)
                </label>
                <textarea
                  id={`notes-${item.id}`}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add notes about your moderation decision..."
                  defaultValue=""
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v) void handleModeration(item.id, 'approved', v);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
