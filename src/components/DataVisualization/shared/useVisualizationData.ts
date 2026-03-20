'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase/types';

type SurveyResponse = Database['public']['Tables']['survey_responses']['Row'] & {
  attendee: Database['public']['Tables']['attendees']['Row'];
};

interface UseVisualizationDataOptions {
  realtime?: boolean;
}

const vizDebug =
  typeof process !== 'undefined' &&
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_DEBUG_VISUALIZATION === '1';

function logViz(message: string, meta?: Record<string, unknown>) {
  if (vizDebug) {
    if (meta) console.log(message, meta);
    else console.log(message);
  }
}

function warnViz(message: string) {
  if (vizDebug) console.warn(message);
}

// Fallback mock data
const mockData: SurveyResponse[] = [
  {
    id: 'mock-1',
    attendee_id: 'mock-attendee-1',
    tenure_years: 5,
    learning_style: 'visual',
    shaped_by: 'mentor',
    peak_performance: 'Extrovert, Morning',
    motivation: 'growth',
    unique_quality: 'Mock response 1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    attendee: {
      id: 'mock-attendee-1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      is_anonymous: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 'mock-2',
    attendee_id: 'mock-attendee-2',
    tenure_years: 10,
    learning_style: 'auditory',
    shaped_by: 'challenge',
    peak_performance: 'Introvert, Morning',
    motivation: 'impact',
    unique_quality: 'Mock response 2',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    attendee: {
      id: 'mock-attendee-2',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      is_anonymous: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 'mock-3',
    attendee_id: 'mock-attendee-3',
    tenure_years: 15,
    learning_style: 'kinesthetic',
    shaped_by: 'success',
    peak_performance: 'Ambivert, Morning',
    motivation: 'purpose',
    unique_quality: 'Mock response 3',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    attendee: {
      id: 'mock-attendee-3',
      first_name: 'Bob',
      last_name: 'Johnson',
      email: 'bob@example.com',
      is_anonymous: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  }
];

export function useVisualizationData({ realtime = true }: UseVisualizationDataOptions = {}) {
  const [data, setData] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);

  // Only log when state changes, not on every render
  const prevDataLength = useRef(data.length);
  const prevIsLoading = useRef(isLoading);
  
  useEffect(() => {
    if (prevDataLength.current !== data.length || prevIsLoading.current !== isLoading) {
      logViz('📊 useVisualizationData state changed', {
        dataLength: data.length,
        isLoading,
        error,
        isMockData
      });
      prevDataLength.current = data.length;
      prevIsLoading.current = isLoading;
    }
  }, [data.length, isLoading, error, isMockData]);

  // Validate survey response data
  const validateResponse = (response: any): response is SurveyResponse => {
    if (!response) return false;
    if (typeof response.tenure_years !== 'number' || response.tenure_years < 0) return false;
    if (!response.learning_style || typeof response.learning_style !== 'string') return false;
    if (!response.shaped_by || typeof response.shaped_by !== 'string') return false;
    if (!response.peak_performance || typeof response.peak_performance !== 'string') return false;
    if (!response.motivation || typeof response.motivation !== 'string') return false;
    if (!response.attendee || typeof response.attendee !== 'object') return false;
    return true;
  };

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function fetchData(isRetry = false) {
      try {
        if (isRetry) {
          setError('Retrying connection...');
        } else {
          setIsLoading(true);
          setError(null);
        }

        const { data: responses, error: fetchError } = await supabase
          .from('survey_responses')
          .select(`
            *,
            attendee:attendees(*)
          `);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (mounted) {
          if (responses && responses.length > 0) {
            // Validate and deduplicate responses
            const validResponses = responses
              .filter(validateResponse)
              .reduce((acc: SurveyResponse[], curr) => {
                const existingIndex = acc.findIndex(r => r.attendee_id === curr.attendee_id);
                if (existingIndex === -1) {
                  acc.push(curr);
                } else if (new Date(curr.updated_at) > new Date(acc[existingIndex].updated_at)) {
                  acc[existingIndex] = curr;
                }
                return acc;
              }, []);

            logViz('✅ Loaded real data', {
              totalResponses: responses.length,
              validResponses: validResponses.length
            });
            setData(validResponses);
            setIsMockData(false);
          } else {
            warnViz('⚠️ No data available, using mock data');
            setData(mockData);
            setIsMockData(true);
          }
          setError(null);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch data';
        if (vizDebug) console.error('❌ Error fetching data:', err);
        else console.error('❌ Error fetching data:', msg);
        if (mounted) {
          if (isRetry && retryCount < MAX_RETRIES) {
            retryCount++;
            logViz(`🔄 Retrying data fetch (${retryCount}/${MAX_RETRIES}) in ${1000 * retryCount}ms`);
            setTimeout(() => fetchData(true), 1000 * retryCount);
          } else {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
            logViz('🔄 Fallback to mock data due to error');
            setData(mockData);
            setIsMockData(true);
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    if (realtime) {
      channel = supabase
        .channel('survey_responses_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'survey_responses',
          },
          async (payload) => {
            if (!mounted) return;

            try {
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                const { data: response, error: fetchError } = await supabase
                  .from('survey_responses')
                  .select(`
                    *,
                    attendee:attendees(*)
                  `)
                  .eq('id', payload.new.id)
                  .single();

                if (fetchError) throw new Error(fetchError.message);

                if (response && validateResponse(response)) {
                  setData((currentData) => {
                    const newData = [...currentData];
                    const index = newData.findIndex((item) => item.id === response.id);

                    if (index !== -1) {
                      newData[index] = response;
                    } else {
                      newData.push(response);
                    }

                    return newData;
                  });
                }
              } else if (payload.eventType === 'DELETE') {
                setData((currentData) => currentData.filter((item) => item.id !== payload.old.id));
              }
            } catch (err) {
              const rmsg = err instanceof Error ? err.message : 'Failed to process update';
              if (vizDebug) console.error('Error processing realtime update:', err);
              else console.error('Error processing realtime update:', rmsg);
              setError(rmsg);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            logViz('Successfully subscribed to realtime updates');
          } else {
            console.error('Failed to subscribe to realtime updates');
            setError('Realtime connection failed');
          }
        });

      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
        mounted = false;
      };
    }

    return () => {
      mounted = false;
    };
  }, [realtime]);

  return {
    data,
    isLoading,
    error,
    isMockData
  };
} 