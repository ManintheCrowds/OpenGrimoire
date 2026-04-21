"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const ADMIN_SUBNAV = [
  { href: '/admin', testId: 'nav-admin-home', label: 'Moderation home', isActive: (p: string) => p === '/admin' || p === '/admin/' },
  { href: '/admin/alignment', testId: 'nav-admin-alignment', label: 'Alignment', isActive: (p: string) => p.startsWith('/admin/alignment') },
  {
    href: '/admin/clarification-queue',
    testId: 'nav-admin-clarification',
    label: 'Clarification',
    isActive: (p: string) => p.startsWith('/admin/clarification-queue'),
  },
  {
    href: '/admin/observability',
    testId: 'nav-admin-observability',
    label: 'Observability',
    isActive: (p: string) => p.startsWith('/admin/observability'),
  },
  { href: '/admin/controls', testId: 'nav-admin-controls', label: 'Controls', isActive: (p: string) => p.startsWith('/admin/controls') },
] as const;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname() || '';
  const isAdmin = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm w-full">
        <nav className="w-full" aria-label="Primary">
          <div className="flex justify-between items-center h-16 w-full px-4 sm:px-6 lg:px-8 max-w-none">
            <div className="flex">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-gray-900">Event Visualization Platform</span>
              </Link>
            </div>
            <div className="flex items-center">
              {!isAdmin && (
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="nav-link-admin"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
          {isAdmin && (
            <div
              className="border-t border-gray-200 bg-gray-50 px-4 sm:px-6 lg:px-8 py-2"
              data-testid="nav-admin-operations-hub"
            >
              <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm" role="navigation" aria-label="Operations hub">
                <span className="text-gray-500 font-medium pr-2 shrink-0">Operations</span>
                {ADMIN_SUBNAV.map(({ href, testId, label, isActive }) => {
                  const active = isActive(pathname);
                  return (
                    <Link
                      key={href}
                      href={href}
                      data-testid={testId}
                      className={cn(
                        'px-2.5 py-1 rounded-md font-medium whitespace-nowrap',
                        active
                          ? 'bg-white text-blue-800 shadow-sm ring-1 ring-gray-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </header>

      <div className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>

      <footer className="bg-white w-full">
        <div className="py-4 w-full px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Event Visualization Platform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 