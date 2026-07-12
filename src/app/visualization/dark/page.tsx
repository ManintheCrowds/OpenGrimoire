'use client';

import Link from 'next/link';
import React, { useEffect } from 'react';
import { DataVisualization } from '@/components/DataVisualization';
import Layout from '@/components/Layout';
import { useAppContext } from '@/lib/context/AppContext';

export default function DarkModeVisualizationPage() {
  const { setDarkModeOverride } = useAppContext();

  // Force dark styling for this route without overwriting the saved preference.
  useEffect(() => {
    setDarkModeOverride(true);
    return () => setDarkModeOverride(null);
  }, [setDarkModeOverride]);

  return (
    <div className="dark">
      <Layout>
        <div className="fixed inset-0 w-screen h-screen bg-gray-900 z-0">
          <DataVisualization />
          
          {/* Dark mode indicator */}
          <div className="absolute top-4 right-4 z-50">
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-200">Dark Mode</span>
              <Link
                href="/visualization" 
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Light Mode
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
} 