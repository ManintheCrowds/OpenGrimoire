import React, { useEffect, useState } from 'react';
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
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const router = useRouter();

  const loadQueue = async () => {
    const res = await fetch('/api/admin/moderation-queue', { credentials: 'include' });
    if (!res.ok) {
      throw new Error(`Failed to load queue (${res.status})`);
    }
    const data = (await res.json()) as { items?: QueueItem[] };
    setQueue(data.items ?? []);
  };

  useEffect(() => {
    const run = async () => {
      try {
        await loadQueue();
      } catch (err) {
        console.error('Error fetching queue:', err);
        setError(err instanceof Error ? err.message : 'Failed to load moderation queue');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  const handleModeration = async (
    responseId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    try {
      const res = await fetch(`/api/admin/moderation/${responseId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (!res.ok) {
        const text = await res.text();
        setError(`Moderation failed (${res.status}): ${text}`);
        return;
      }
      setLoading(true);
      await loadQueue();
      setLoading(false);
    } catch (err) {
      console.error('Moderation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update moderation status');
    }
  };

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };

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
                      onClick={() => void handleModeration(item.id, 'approved')}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-1/2 sm:w-auto"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => void handleModeration(item.id, 'rejected')}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 w-1/2 sm:w-auto"
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
