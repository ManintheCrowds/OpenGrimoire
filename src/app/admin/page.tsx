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
          <p className="mt-3 text-sm text-gray-500">
            <a className="text-blue-600 underline hover:text-blue-800" href="/admin/alignment">
              Alignment context (operator CRUD)
            </a>
            {' · '}
            <a className="text-blue-600 underline hover:text-blue-800" href="/admin/clarification-queue">
              Clarification queue (async agent questions)
            </a>
            {' · '}
            <a className="text-blue-600 underline hover:text-blue-800" href="/admin/observability">
              Operator observability (probe runs)
            </a>
          </p>
        </div>

        <ApiDiscoveryMirror />

        <AdminPanel />
      </div>
    </Layout>
  );
}
