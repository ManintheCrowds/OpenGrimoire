/**
 * Bottom “dot” nav between **`/visualization`** (survey charts) and **`/constellation`**.
 * Mounted from [`VisualizationNavDots`](./VisualizationNavDots.tsx) on those routes (OA-FR-2 §1.7).
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Visualization {
  id: string;
  name: string;
  path: string;
}

/** Only `app/` routes that exist today (OA-FR-2 G-S2-04). */
const visualizations: Visualization[] = [
  { id: 'visualization', name: 'Survey charts', path: '/visualization' },
  { id: 'constellation', name: 'Constellation', path: '/constellation' },
];

interface NavigationDotsProps {
  currentPath: string;
  className?: string;
}

export function NavigationDots({ currentPath, className }: NavigationDotsProps) {
  const router = useRouter();
  const currentIndex = visualizations.findIndex(viz => viz.path === currentPath);

  return (
    <div
      className={cn(
        'fixed bottom-8 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-full px-4 py-2 shadow-lg',
        className
      )}
    >
      {visualizations.map((viz, index) => (
        <button
          key={viz.id}
          onClick={() => router.push(viz.path)}
          className={cn(
            'w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
            {
              'bg-primary scale-125': index === currentIndex,
              'bg-muted hover:bg-muted/80': index !== currentIndex,
            }
          )}
          title={viz.name}
          aria-label={`Go to ${viz.name} visualization`}
        />
      ))}
    </div>
  );
} 