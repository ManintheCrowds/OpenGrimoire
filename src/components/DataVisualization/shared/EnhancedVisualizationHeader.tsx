'use client';

import React, { useCallback, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { useApprovedQuotes } from './useApprovedQuotes';
import {
  OPENGRIMOIRE_VIZ_MAIN_PANEL_ID,
  OPENGRIMOIRE_VIZ_TAB_ALLUVIAL_ID,
  OPENGRIMOIRE_VIZ_TAB_CHORD_ID,
} from './vizLayoutIds';

interface EnhancedVisualizationHeaderProps {
  visualizationType: 'alluvial' | 'chord';
  onVisualizationTypeChange: (type: 'alluvial' | 'chord') => void;
  isAutoPlay: boolean;
  onAutoPlayToggle: () => void;
  /** Optional hint for agent-driven UIs / docs (A2UI-style declarative field). */
  usageHint?: string;
}

/**
 * Header for OpenGrimoire data visualization (alluvial / chord).
 * Regions: `data-region` attributes for agent or test selectors.
 */
export function EnhancedVisualizationHeader({
  visualizationType,
  onVisualizationTypeChange,
  isAutoPlay,
  onAutoPlayToggle,
  usageHint,
}: EnhancedVisualizationHeaderProps) {
  const { currentQuote, isLoading, hasQuotes } = useApprovedQuotes();
  const alluvialTabRef = useRef<HTMLButtonElement>(null);
  const chordTabRef = useRef<HTMLButtonElement>(null);

  const onTabListKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      if (visualizationType === 'alluvial' && e.key === 'ArrowDown') {
        onVisualizationTypeChange('chord');
        requestAnimationFrame(() => chordTabRef.current?.focus());
        return;
      }
      if (visualizationType === 'chord' && e.key === 'ArrowUp') {
        onVisualizationTypeChange('alluvial');
        requestAnimationFrame(() => alluvialTabRef.current?.focus());
      }
    },
    [visualizationType, onVisualizationTypeChange]
  );

  const getAuthor = (author: string | undefined) => {
    if (!author || author.trim().toLowerCase() === 'anonymous') return 'Anonymous';
    return author;
  };

  const headerFont = { fontFamily: 'var(--opengrimoire-viz-header-font)' } as const;

  return (
    <header
      className="flex w-full flex-row items-center justify-between px-8 py-4"
      style={{
        minHeight: hasQuotes && currentQuote ? 120 : 88,
        background: 'var(--opengrimoire-viz-header-bg)',
        alignItems: 'center',
        display: 'flex',
      }}
      data-region="opengrimoire-viz-header"
      {...(usageHint ? { 'data-usage-hint': usageHint } : {})}
    >
      <div
        className="flex flex-shrink-0 flex-row items-center justify-start gap-3"
        style={{ minWidth: 220 }}
        data-region="opengrimoire-viz-wordmark"
      >
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg font-bold text-white"
          aria-hidden
        >
          OG
        </div>
        <div className="flex flex-col text-left">
          <span
            className="font-bold leading-tight text-white"
            style={{ ...headerFont, fontSize: '1.35rem', letterSpacing: 0.5 }}
          >
            OpenGrimoire
          </span>
          <span className="mt-0.5 text-sm font-medium text-white/80" style={headerFont}>
            Agent Context Atlas
          </span>
        </div>
      </div>

      <div
        className="flex min-w-0 flex-1 flex-col items-center justify-center px-4 text-center"
        data-region="opengrimoire-viz-quote-slot"
      >
        {isLoading ? (
          <span className="text-xs text-white/40" aria-live="polite">
            Loading…
          </span>
        ) : hasQuotes && currentQuote ? (
          <div className="flex w-full max-w-[700px] flex-col items-center space-y-2">
            <div
              className="mx-auto rounded-lg border border-white/30 bg-white/5 px-6 font-bold italic text-white shadow-lg backdrop-blur-sm"
              style={{
                ...headerFont,
                fontSize: 'clamp(0.7rem, 1.8vw, 1.2rem)',
                lineHeight: 1.3,
                wordBreak: 'break-word',
                whiteSpace: 'pre-line',
                minHeight: 0,
                height: 80,
                maxHeight: 80,
                maxWidth: 700,
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <span className="text-[1.4rem] font-black" style={{ marginRight: 6, verticalAlign: 'top' }}>
                &ldquo;
              </span>
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  lineClamp: 4,
                  maxHeight: '100%',
                }}
              >
                {currentQuote.text}
              </span>
              <span className="text-[1.4rem] font-black" style={{ marginLeft: 6, verticalAlign: 'bottom' }}>
                &rdquo;
              </span>
            </div>
            <div className="text-sm font-medium text-white" style={{ ...headerFont, opacity: 0.9, marginTop: 4 }}>
              — {getAuthor(currentQuote.author)}
            </div>
          </div>
        ) : null}
      </div>

      <div
        className="flex flex-shrink-0 flex-col items-center justify-center"
        style={{ minWidth: 90, height: 100, justifyContent: 'center' }}
        data-region="opengrimoire-viz-controls"
        role="toolbar"
        aria-label="Visualization type and playback"
      >
        <div
          role="tablist"
          aria-label="Chart type"
          className="mb-2 flex flex-col items-center"
          onKeyDown={onTabListKeyDown}
        >
          <button
            ref={alluvialTabRef}
            type="button"
            role="tab"
            id={OPENGRIMOIRE_VIZ_TAB_ALLUVIAL_ID}
            aria-selected={visualizationType === 'alluvial'}
            aria-controls={OPENGRIMOIRE_VIZ_MAIN_PANEL_ID}
            tabIndex={visualizationType === 'alluvial' ? 0 : -1}
            onClick={() => onVisualizationTypeChange('alluvial')}
            className={`mb-2 h-10 w-20 rounded-lg border border-gray-400 bg-white/10 text-base font-semibold text-white/80 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
              visualizationType === 'alluvial' ? 'ring-2 ring-blue-400' : ''
            }`}
            style={{ ...headerFont, fontSize: '0.95rem', width: 80 }}
          >
            Alluvial
          </button>
          <button
            ref={chordTabRef}
            type="button"
            role="tab"
            id={OPENGRIMOIRE_VIZ_TAB_CHORD_ID}
            aria-selected={visualizationType === 'chord'}
            aria-controls={OPENGRIMOIRE_VIZ_MAIN_PANEL_ID}
            tabIndex={visualizationType === 'chord' ? 0 : -1}
            onClick={() => onVisualizationTypeChange('chord')}
            className={`h-10 w-20 rounded-lg border border-gray-400 bg-white/10 text-base font-semibold text-white/80 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
              visualizationType === 'chord' ? 'ring-2 ring-blue-400' : ''
            }`}
            style={{ ...headerFont, fontSize: '0.95rem', width: 80 }}
          >
            Chord
          </button>
        </div>
        <button
          type="button"
          onClick={onAutoPlayToggle}
          aria-label={isAutoPlay ? 'Pause automatic playback' : 'Start automatic playback'}
          className="h-10 w-20 rounded-lg border border-gray-400 bg-white/10 text-base font-semibold text-white/80 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          style={{ ...headerFont, fontSize: '0.95rem', width: 80 }}
          title={isAutoPlay ? 'Switch to interactive mode' : 'Switch to auto-play mode'}
        >
          {isAutoPlay ? (
            <span className="flex items-center justify-center">
              <Pause className="mr-1 h-4 w-4" aria-hidden />
              Pause
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Play className="mr-1 h-4 w-4" aria-hidden />
              Play
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
