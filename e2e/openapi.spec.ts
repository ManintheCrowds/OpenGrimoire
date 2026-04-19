import { test, expect } from '@playwright/test';

test.describe('OpenAPI partial', () => {
  test('GET /api/openapi.json returns OpenAPI 3 document', async ({ request }) => {
    const res = await request.get('/api/openapi.json');
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { openapi?: string; paths?: Record<string, unknown> };
    expect(json.openapi).toMatch(/^3\./);
    expect(json.paths).toBeDefined();
    expect(Object.keys(json.paths ?? {}).length).toBeGreaterThan(0);

    const paths = json.paths as Record<
      string,
      { get?: { responses?: Record<string, { content?: Record<string, { schema?: unknown }> }> } }
    >;
    const viz = paths['/api/survey/visualization']?.get?.responses?.['200']?.content?.['application/json']?.schema;
    const approved =
      paths['/api/survey/approved-qualities']?.get?.responses?.['200']?.content?.['application/json']?.schema;
    expect(viz).toEqual({ $ref: '#/components/schemas/SurveyVisualizationResponse' });
    expect(approved).toEqual({ $ref: '#/components/schemas/ApprovedQualitiesResponse' });
  });
});
