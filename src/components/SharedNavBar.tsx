'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navGroups: { label: string; items: { href: string; label: string; testId?: string }[] }[] = [
  {
    label: 'Operate',
    items: [
      { href: '/', label: 'Base camp' },
      { href: '/operator-intake', label: 'Sync Session', testId: 'nav-link-operator-intake' },
      { href: '/admin', label: 'Operator Cockpit' },
    ],
  },
  {
    label: 'Inspect',
    items: [
      { href: '/context-atlas', label: 'Context Atlas' },
      { href: '/visualization', label: 'Data Constellations' },
      { href: '/wiki', label: 'LLM Wiki' },
      { href: '/capabilities', label: 'Capabilities' },
    ],
  },
  {
    label: 'Configure',
    items: [{ href: '/admin/controls', label: 'Controls' }],
  },
];

export default function SharedNavBar() {
  const pathname = usePathname() ?? '';

  return (
    <nav
      className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-white px-3 py-2 sm:gap-4 sm:px-4"
      aria-label="Main navigation"
    >
      {navGroups.map((group) => (
        <div key={group.label} className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{group.label}</span>
          {group.items.map(({ href, label, testId }) => {
            const isActive =
              href === '/'
                ? pathname === href
                : href === '/admin'
                  ? pathname === href || pathname === '/admin/'
                  : pathname === href || pathname.startsWith(`${href}/`);
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
        </div>
      ))}
    </nav>
  );
}
