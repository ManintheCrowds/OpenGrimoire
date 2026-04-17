import { describe, expect, it } from 'vitest';

import { decideSurveyReadAccess } from './survey-read-gate-logic';

describe('decideSurveyReadAccess', () => {
  const base = {
    nodeEnv: 'production' as const,
    surveyVisualizationAllowPublic: undefined as string | undefined,
    hasAdminSession: false,
    alignmentContextKeyAllowsSurveyRead: undefined as string | undefined,
    alignmentApiSecret: '',
    alignmentContextKeyHeader: '',
    surveyVizSecret: '',
    surveyVizKeyHeader: '',
  };

  it('allows in non-production regardless of headers', () => {
    const d = decideSurveyReadAccess({
      ...base,
      nodeEnv: 'development',
    });
    expect(d).toEqual({ allow: true, reason: 'development' });
  });

  it('allows production when SURVEY_VISUALIZATION_ALLOW_PUBLIC is true', () => {
    const d = decideSurveyReadAccess({
      ...base,
      surveyVisualizationAllowPublic: 'true',
    });
    expect(d).toEqual({ allow: true, reason: 'public_demo' });
  });

  it('allows production with admin session and no keys', () => {
    const d = decideSurveyReadAccess({
      ...base,
      hasAdminSession: true,
    });
    expect(d).toEqual({ allow: true, reason: 'admin_session' });
  });

  it('denies production with no session, no keys, no public flag', () => {
    const d = decideSurveyReadAccess({ ...base });
    expect(d).toEqual({ allow: false, reason: 'session_required' });
  });

  it('allows production with visualization secret + matching header', () => {
    const d = decideSurveyReadAccess({
      ...base,
      surveyVizSecret: 'viz-secret',
      surveyVizKeyHeader: 'viz-secret',
    });
    expect(d).toEqual({ allow: true, reason: 'visualization_key' });
  });

  it('denies production when viz secret set but header wrong', () => {
    const d = decideSurveyReadAccess({
      ...base,
      surveyVizSecret: 'viz-secret',
      surveyVizKeyHeader: 'wrong',
    });
    expect(d).toEqual({ allow: false, reason: 'session_required' });
  });

  it('allows production with ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ + secret + matching alignment header', () => {
    const d = decideSurveyReadAccess({
      ...base,
      alignmentContextKeyAllowsSurveyRead: 'true',
      alignmentApiSecret: 'align-secret',
      alignmentContextKeyHeader: 'align-secret',
    });
    expect(d).toEqual({ allow: true, reason: 'alignment_key' });
  });

  it('denies when alignment escape hatch env is true but header does not match secret', () => {
    const d = decideSurveyReadAccess({
      ...base,
      alignmentContextKeyAllowsSurveyRead: 'true',
      alignmentApiSecret: 'align-secret',
      alignmentContextKeyHeader: 'nope',
    });
    expect(d).toEqual({ allow: false, reason: 'session_required' });
  });

  it('denies when alignment header matches but escape hatch is off', () => {
    const d = decideSurveyReadAccess({
      ...base,
      alignmentContextKeyAllowsSurveyRead: 'false',
      alignmentApiSecret: 'align-secret',
      alignmentContextKeyHeader: 'align-secret',
    });
    expect(d).toEqual({ allow: false, reason: 'session_required' });
  });

  it('prefers admin session over missing viz key', () => {
    const d = decideSurveyReadAccess({
      ...base,
      hasAdminSession: true,
      surveyVizSecret: 'viz',
      surveyVizKeyHeader: '',
    });
    expect(d).toEqual({ allow: true, reason: 'admin_session' });
  });
});
