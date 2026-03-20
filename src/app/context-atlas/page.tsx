'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const BrainMapGraph = dynamic(() => import('@/components/BrainMap/BrainMapGraph'), {
  ssr: false,
  loading: () => <div className="flex h-96 items-center justify-center">Loading context graph...</div>,
});

export default function ContextAtlasPage() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <div className="flex-1 min-h-0">
        <BrainMapGraph />
      </div>
    </div>
  );
}
