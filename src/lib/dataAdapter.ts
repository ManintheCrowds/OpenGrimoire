import type { Database } from '@/lib/supabase/types';
import type { LearningStyle, ShapedBy, PeakPerformanceType, MotivationType } from '@/lib/supabase/types';
import type { SurveyData } from '@/types/survey';

// Database type
type DBSurveyResponse = Database['public']['Tables']['survey_responses']['Row'] & {
  attendee: {
    first_name: string;
    last_name: string | null;
    is_anonymous: boolean;
  };
};

// Application type
type AppSurveyResponse = {
  id: string;
  created_at: string;
  name: string;
  tenure_years: string;
  learning_style: LearningStyle;
  shaped_by: ShapedBy;
  peak_performance: PeakPerformanceType;
  motivation: MotivationType;
  unique_quality: string;
};

type JsonSurveyResponse = {
  id: string;
  timestamp: string;
  first_name: string;
  location: string;
  responses: {
    tenure_years: number;
    learning_style: string;
    shaped_by: string;
    peak_performance: string;
    motivation: string;
    unique_quality: string;
  };
};

type JsonData = {
  survey_data: JsonSurveyResponse[];
};

// Helper function to generate a last name based on first name and location
const generateLastName = (firstName: string, location: string): string => {
  // Extract city from location (e.g., "Minneapolis, MN" -> "Minneapolis")
  const city = location.split(',')[0].trim();
  
  // Generate a random number between 100-999
  const randomNum = Math.floor(Math.random() * 900) + 100;
  
  // Combine city and number for a unique last name
  return `${city}${randomNum}`;
};

// Helper function to determine if a response should be anonymous
const shouldBeAnonymous = (firstName: string, location: string): boolean => {
  // Make responses anonymous if:
  // 1. The first name is "Anonymous" (case insensitive)
  // 2. The unique quality contains sensitive information
  // 3. Random 20% chance for diversity
  const isExplicitlyAnonymous = firstName.toLowerCase() === 'anonymous';
  const hasSensitiveInfo = /patient|medical|health|disease|condition|diagnosis/i.test(firstName);
  const randomChance = Math.random() < 0.2;
  
  return isExplicitlyAnonymous || hasSensitiveInfo || randomChance;
};

// Helper function to normalize learning style
const normalizeLearningStyle = (style: string): LearningStyle => {
  const normalized = style.toLowerCase().replace(/[^a-z]/g, '_');
  switch (normalized) {
    case 'visual':
    case 'auditory':
    case 'kinesthetic':
    case 'reading_writing':
      return normalized as LearningStyle;
    default:
      return 'visual';
  }
};

// Helper function to normalize shaped by
const normalizeShapedBy = (shaped: string): ShapedBy => {
  const normalized = shaped.toLowerCase().replace(/[^a-z]/g, '_');
  switch (normalized) {
    case 'mentor':
    case 'challenge':
    case 'failure':
    case 'success':
    case 'team':
    case 'other':
      return normalized as ShapedBy;
    default:
      return 'other';
  }
};

// Helper function to normalize peak performance
const normalizePeakPerformance = (peak: string): PeakPerformanceType => {
  const valid: PeakPerformanceType[] = [
    'Extrovert, Morning', 'Extrovert, Evening', 'Introvert, Morning',
    'Introvert, Night', 'Ambivert, Morning', 'Ambivert, Night'
  ];
  const match = valid.find(v => v.toLowerCase().includes(peak.toLowerCase().slice(0, 4)));
  return match ?? 'Extrovert, Morning';
};

// Helper function to normalize motivation
const normalizeMotivation = (motivation: string): MotivationType => {
  const normalized = motivation.toLowerCase().replace(/[^a-z]/g, '_');
  switch (normalized) {
    case 'impact':
    case 'growth':
    case 'recognition':
    case 'autonomy':
    case 'purpose':
      return normalized as MotivationType;
    default:
      return 'impact';
  }
};

/** Map generated `SurveyData` (see `generateMockData`) to `AppSurveyResponse[]`. */
const convertGeneratedMockToApp = (data: SurveyData): AppSurveyResponse[] => {
  return data.survey_data.map((item) => {
    const isAnonymous = item.is_anonymous;
    const fullName = isAnonymous
      ? 'Anonymous'
      : `${item.first_name} ${item.last_name || ''}`.trim();

    return {
      id: item.id,
      created_at: item.timestamp,
      name: fullName,
      tenure_years: item.responses.tenure_years.toString(),
      learning_style: normalizeLearningStyle(item.responses.learning_style),
      shaped_by: normalizeShapedBy(item.responses.shaped_by),
      peak_performance: normalizePeakPerformance(item.responses.peak_performance),
      motivation: normalizeMotivation(item.responses.motivation),
      unique_quality: item.responses.unique_quality,
    };
  });
};

// Convert JSON format to application format
export const convertJsonToAppResponse = (jsonData: JsonData): AppSurveyResponse[] => {
  return jsonData.survey_data.map((item) => {
    const isAnonymous = shouldBeAnonymous(item.first_name, item.location);
    const lastName = isAnonymous ? null : generateLastName(item.first_name, item.location);
    const fullName = isAnonymous ? 'Anonymous' : `${item.first_name} ${lastName}`;
    
    return {
      id: item.id,
      created_at: item.timestamp,
      name: fullName,
      tenure_years: item.responses.tenure_years.toString(),
      learning_style: normalizeLearningStyle(item.responses.learning_style),
      shaped_by: normalizeShapedBy(item.responses.shaped_by),
      peak_performance: normalizePeakPerformance(item.responses.peak_performance),
      motivation: normalizeMotivation(item.responses.motivation),
      unique_quality: item.responses.unique_quality,
    };
  });
};

// Convert application format to database format
export const convertAppToDBResponse = (appResponse: AppSurveyResponse): DBSurveyResponse => {
  const [firstName, ...lastNameParts] = appResponse.name.split(' ');
  const lastName = lastNameParts.join(' ');
  const isAnonymous = appResponse.name === 'Anonymous';

  return {
    id: appResponse.id,
    attendee_id: `a${appResponse.id.split('_')[1]}`,
    created_at: appResponse.created_at,
    updated_at: appResponse.created_at,
    attendee: {
      first_name: firstName,
      last_name: isAnonymous ? null : lastName,
      is_anonymous: isAnonymous,
    },
    tenure_years: parseInt(appResponse.tenure_years),
    learning_style: appResponse.learning_style,
    shaped_by: appResponse.shaped_by,
    peak_performance: appResponse.peak_performance,
    motivation: appResponse.motivation,
    unique_quality: appResponse.unique_quality,
  };
};

// Function to load and process data from either source
export const loadSurveyData = async (): Promise<AppSurveyResponse[]> => {
  try {
    // Try to load JSON data first
    const jsonResponse = await fetch('/data/mockSurveyResponses2.json');
    if (jsonResponse.ok) {
      const jsonData: JsonData = await jsonResponse.json();
      return convertJsonToAppResponse(jsonData);
    }
    
    // Fallback to TypeScript data if JSON loading fails
    const { mockSurveyResponses } = await import('@/data/generateMockData');
    return convertGeneratedMockToApp(mockSurveyResponses);
  } catch (error) {
    console.error('Error loading survey data:', error);
    // Fallback to TypeScript data
    const { mockSurveyResponses } = await import('@/data/generateMockData');
    return convertGeneratedMockToApp(mockSurveyResponses);
  }
}; 