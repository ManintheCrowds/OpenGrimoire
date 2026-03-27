'use client';

import { useEffect, useState } from 'react';

interface ApprovedQuote {
  unique_quality: string;
  attendee: {
    first_name: string;
    last_name: string | null;
    is_anonymous: boolean;
  };
}

export function useApprovedQuotes() {
  const [quotes, setQuotes] = useState<ApprovedQuote[]>([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchQuotes() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch('/api/survey/approved-qualities', {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error(`Failed to load (${res.status})`);
        }
        const data = (await res.json()) as {
          items?: { unique_quality: string | null; attendee: ApprovedQuote['attendee'] }[];
        };

        if (mounted) {
          const filteredQuotes =
            data.items
              ?.filter((item) => item.unique_quality && item.unique_quality.trim() !== '')
              .map((item) => ({
                unique_quality: item.unique_quality as string,
                attendee: item.attendee,
              })) ?? [];

          setQuotes(filteredQuotes);
        }
      } catch (err) {
        console.error('Error fetching quotes:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch quotes');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchQuotes();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (quotes.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  const currentQuote = quotes[currentQuoteIndex];

  const formatQuote = (quote: ApprovedQuote) => {
    if (!quote) return null;

    const { unique_quality, attendee } = quote;
    let authorName = 'Anonymous';

    if (!attendee.is_anonymous && attendee.first_name) {
      authorName = attendee.first_name;
      if (attendee.last_name) {
        authorName += ` ${attendee.last_name}`;
      }
    }

    return {
      text: unique_quality,
      author: authorName,
    };
  };

  return {
    quotes,
    currentQuote: currentQuote ? formatQuote(currentQuote) : null,
    isLoading,
    error,
    hasQuotes: quotes.length > 0,
  };
}
