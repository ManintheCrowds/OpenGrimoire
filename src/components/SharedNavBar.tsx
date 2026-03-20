'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/context-atlas', label: 'Context graph' },
  { href: '/visualization', label: 'Visualization' },
  { href: '/admin/controls', label: 'Admin' },
];

export default function SharedNavBar() {
  const pathname = usePathname() ?? '';

  return (
    <nav
      className="flex items-center gap-4 border-b bg-white px-4 py-2"
      aria-label="Main navigation"
    >
      {navItems.map(({ href, label }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`text-sm font-medium ${
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
