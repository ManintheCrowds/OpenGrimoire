"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminPanel } from '@/components/AdminPanel/index';
import { ApiDiscoveryMirror } from '@/components/ApiDiscoveryMirror';
import Layout from '@/components/Layout';
import { isOpenGrimoireAdminSessionUser } from '@/lib/opengrimoire-admin';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    void checkAuth();
  }, [router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  if (!user || !isOpenGrimoireAdminSessionUser(user)) {
    return <div className="flex items-center justify-center h-96">Access denied</div>;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Response Moderation</h1>
          <p className="mt-4 text-lg text-gray-600">
            Review and moderate survey responses to ensure appropriate content for visualization.
          </p>
          <section
            className="mt-6 mx-auto max-w-2xl text-left rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 sm:px-5"
            aria-labelledby="operations-hub-heading"
            data-testid="admin-operations-hub-section"
          >
            <h2 id="operations-hub-heading" className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Operations hub
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Related operator consoles—same destinations as the header <strong>Operations</strong> bar.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-800 list-disc list-inside">
              <li>
                <a className="text-blue-600 underline hover:text-blue-800 font-medium" href="/admin/alignment">
                  Alignment
                </a>{' '}
                — operator CRUD for alignment context
              </li>
              <li>
                <a className="text-blue-600 underline hover:text-blue-800 font-medium" href="/admin/clarification-queue">
                  Clarification queue
                </a>{' '}
                — async agent questions inbox
              </li>
              <li>
                <a className="text-blue-600 underline hover:text-blue-800 font-medium" href="/admin/observability">
                  Observability
                </a>{' '}
                — operator probe runs (SQLite-backed)
              </li>
              <li>
                <a className="text-blue-600 underline hover:text-blue-800 font-medium" href="/admin/controls">
                  Controls
                </a>{' '}
                — admin controls surface
              </li>
            </ul>
          </section>
        </div>

        <ApiDiscoveryMirror />

        <AdminPanel />
      </div>
    </Layout>
  );
}
