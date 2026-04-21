'use client';

import { usePathname } from 'next/navigation';

import { NavigationDots } from './NavigationDots';

/** Client island: survey viz ↔ constellation quick nav (see `NavigationDots`). */
export function VisualizationNavDots() {
  const pathname = usePathname() ?? '';
  return <NavigationDots currentPath={pathname} />;
}
