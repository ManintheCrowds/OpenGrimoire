#!/usr/bin/env node
/**
 * Minimal fetch-only example: POST /api/survey with a valid Sync Session body.
 * Usage: OPENGRIMOIRE_BASE_URL=http://localhost:3001 node scripts/examples/post-sync-session.mjs
 * No business logic — prints JSON including attendeeId and surveyResponseId on success.
 */

const base = (process.env.OPENGRIMOIRE_BASE_URL || process.env.OPENATLAS_BASE_URL || 'http://localhost:3001').replace(
  /\/$/,
  ''
);

const body = {
  firstName: 'Example',
  lastName: 'Agent',
  email: 'example-agent@example.com',
  isAnonymous: false,
  answers: [
    { questionId: 'tenure_years', answer: '3' },
    { questionId: 'learning_style', answer: 'visual' },
    { questionId: 'shaped_by', answer: 'mentor' },
    { questionId: 'peak_performance', answer: 'Introvert, Morning' },
    { questionId: 'motivation', answer: 'growth' },
    { questionId: 'unique_quality', answer: 'Scripted parity check' },
  ],
};

const headers = { 'Content-Type': 'application/json' };
const token = process.env.SURVEY_POST_TOKEN;
if (token) {
  headers['x-survey-post-token'] = token;
}

async function main() {
  const res = await fetch(`${base}/api/survey`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error(res.status, text);
    process.exit(1);
  }
  console.log(JSON.stringify(json, null, 2));
  if (!res.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
