'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const BrainMapGraph = dynamic(() => import('@/components/BrainMap/BrainMapGraph'), {
  ssr: false,
  loading: () => <div className="flex h-96 items-center justify-center">Loading context graph...</div>,
});

export default function ContextAtlasPage() {
  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1">
        <BrainMapGraph />
      </div>
    </div>
  );
}
