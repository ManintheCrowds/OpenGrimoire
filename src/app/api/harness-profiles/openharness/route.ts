import { NextResponse } from 'next/server';
import { checkAlignmentOrAdminSession } from '@/lib/alignment-context/api-auth';
import { listHarnessProfiles } from '@/lib/storage/repositories/harness-profiles';
import { getSurveyResponseById } from '@/lib/storage/repositories/survey';

/**
 * OpenHarness-oriented profile bundle.
 * Query:
 * - surveyResponseId (optional): resolves selected profile from Sync Session artifact.
 */
export async function GET(request: Request) {
  const gate = await checkAlignmentOrAdminSession(request);
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const surveyResponseId = searchParams.get('surveyResponseId');

  const profiles = listHarnessProfiles();
  const defaultProfile = profiles.find((item) => item.is_default) ?? profiles[0] ?? null;

  let selectedProfile = defaultProfile;
  if (surveyResponseId) {
    const surveyResponse = getSurveyResponseById(surveyResponseId);
    if (surveyResponse?.harness_profile_id) {
      selectedProfile = profiles.find((item) => item.id === surveyResponse.harness_profile_id) ?? defaultProfile;
    }
  }

  return NextResponse.json({
    integration: 'openharness.v1',
    exportedAt: new Date().toISOString(),
    selectedProfile,
    profiles,
    mappingHints: {
      purpose: 'mission',
      question_strategy: 'question_strategy',
      risk_posture: 'risk_tier',
      preferred_clarification_modes: 'clarification_mode_preferences',
      output_style: 'response_style',
    },
  });
}
