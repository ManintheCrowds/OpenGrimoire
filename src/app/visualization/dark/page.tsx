'use client';

import React, { useEffect } from 'react';
import { DataVisualization } from '@/components/DataVisualization';
import Layout from '@/components/Layout';
import { AppThemeOverrideProvider, useAppContext } from '@/lib/context/AppContext';

export default function DarkModeVisualizationPage() {
  const { settings } = useAppContext();

  useEffect(() => {
    const shouldRestoreDark = settings.isDarkMode;
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');

    return () => {
      document.documentElement.classList.toggle('dark', shouldRestoreDark);
      document.body.classList.toggle('dark', shouldRestoreDark);
    };
  }, [settings.isDarkMode]);

  return (
    <AppThemeOverrideProvider isDarkMode={true}>
      <div className="dark">
        <Layout>
          <div className="fixed inset-0 w-screen h-screen bg-gray-900 z-0">
            <DataVisualization />

            <div className="absolute top-4 right-4 z-50">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-200">Dark Mode</span>
                <a
                  href="/visualization"
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Light Mode
                </a>
              </div>
            </div>
          </div>
        </Layout>
      </div>
    </AppThemeOverrideProvider>
  );
}