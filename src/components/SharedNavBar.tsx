'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems: { href: string; label: string; testId?: string }[] = [
  { href: '/', label: 'Home' },
  { href: '/context-atlas', label: 'Context graph' },
  { href: '/visualization', label: 'Visualization' },
  { href: '/operator-intake', label: 'Sync Session', testId: 'nav-link-operator-intake' },
  { href: '/capabilities', label: 'Capabilities' },
  { href: '/admin/controls', label: 'Admin' },
];

export default function SharedNavBar() {
  const pathname = usePathname() ?? '';

  return (
    <nav
      className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-white px-3 py-2 sm:gap-4 sm:px-4"
      aria-label="Main navigation"
    >
      {navItems.map(({ href, label, testId }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            data-testid={testId}
            className={`inline-flex min-h-[44px] items-center text-sm font-medium ${
              isActive ? 'text-blue-600 underline' : 'text-gray-600 hover:text-gray-900 hover:underline'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
