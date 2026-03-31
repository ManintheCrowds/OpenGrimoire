/**
 * Partial OpenAPI 3.0 document for machine discovery (OA-REST-2).
 * Extend when adding routes; keep in sync with ARCHITECTURE_REST_CONTRACT.md.
 */
export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'OpenGrimoire API',
    description:
      'Partial spec — paths and security schemes. Full request/response schemas live in Zod validators per route. See GET /api/capabilities.',
    version: '0.1.0',
  },
  servers: [{ url: '/', description: 'Same origin as the app' }],
  paths: {
    '/api/capabilities': {
      get: {
        summary: 'Capabilities manifest (routes, auth hints)',
        security: [],
        responses: { '200': { description: 'JSON manifest' } },
      },
    },
    '/api/openapi': {
      get: {
        summary: 'Partial OpenAPI 3 document (alias: GET /api/openapi.json via rewrite)',
        security: [],
        responses: { '200': { description: 'OpenAPI 3 JSON' } },
      },
    },
    '/api/alignment-context': {
      get: {
        summary: 'List alignment context items',
        security: [{ AlignmentApiKey: [] }],
        responses: { '200': { description: 'items[]' } },
      },
      post: {
        summary: 'Create alignment context item',
        security: [{ AlignmentApiKey: [] }],
        responses: { '201': { description: 'item' } },
      },
    },
    '/api/alignment-context/{id}': {
      patch: {
        summary: 'Update alignment context item',
        security: [{ AlignmentApiKey: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'item' } },
      },
      delete: {
        summary: 'Delete alignment context item',
        security: [{ AlignmentApiKey: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/api/clarification-requests': {
      get: {
        summary: 'List clarification requests',
        security: [{ ClarificationApiKey: [] }, { AlignmentApiKey: [] }],
        responses: { '200': { description: 'items[]' } },
      },
      post: {
        summary: 'Create clarification request',
        security: [{ ClarificationApiKey: [] }, { AlignmentApiKey: [] }],
        responses: { '201': { description: 'item' } },
      },
    },
    '/api/clarification-requests/{id}': {
      get: {
        summary: 'Get clarification request by id',
        security: [{ ClarificationApiKey: [] }, { AlignmentApiKey: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'item' } },
      },
      patch: {
        summary: 'Resolve clarification request',
        security: [{ ClarificationApiKey: [] }, { AlignmentApiKey: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'item' } },
      },
    },
    '/api/brain-map/graph': {
      get: {
        summary: 'Brain map graph JSON',
        security: [{ BrainMapKey: [] }, { OperatorSession: [] }],
        responses: { '200': { description: 'Graph JSON' } },
      },
    },
    '/api/survey': {
      post: {
        summary: 'Submit Sync Session (survey) response',
        description:
          'Creates attendees + survey_responses. questionId values are fixed (tenure_years, learning_style, shaped_by, peak_performance, motivation, unique_quality). Enum constraints: src/lib/survey/mapAnswersToSurveyResponse.ts.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'answers'],
                properties: {
                  firstName: { type: 'string', minLength: 1, maxLength: 200 },
                  lastName: { type: 'string', minLength: 1, maxLength: 200 },
                  email: { type: 'string', format: 'email' },
                  isAnonymous: { type: 'boolean', default: false },
                  answers: {
                    type: 'array',
                    minItems: 1,
                    items: {
                      type: 'object',
                      required: ['questionId', 'answer'],
                      properties: {
                        questionId: {
                          type: 'string',
                          description:
                            'Known IDs: tenure_years | learning_style | shaped_by | peak_performance | motivation | unique_quality',
                        },
                        answer: { type: 'string', maxLength: 8000 },
                      },
                    },
                  },
                  turnstileToken: {
                    type: 'string',
                    description: 'Optional. Cloudflare Turnstile token when SURVEY_POST_CAPTCHA_REQUIRED or production captcha is enabled.',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'message', 'attendeeId', 'surveyResponseId'],
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    attendeeId: { type: 'string', format: 'uuid' },
                    surveyResponseId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation failed' },
          '401': { description: 'Missing or invalid x-survey-post-token when SURVEY_POST_REQUIRE_TOKEN is enabled' },
          '409': { description: 'Duplicate constraint (e.g. email)' },
          '429': { description: 'Rate limited' },
          '503': { description: 'Captcha or token enforcement misconfigured' },
        },
      },
    },
    '/api/survey/bootstrap-token': {
      get: {
        summary: 'Optional JWT for POST /api/survey when SURVEY_POST_REQUIRE_TOKEN is enabled',
        description: 'Returns { token: null } when token not required; otherwise a short-lived JWT for x-survey-post-token.',
        security: [],
        responses: {
          '200': { description: 'token + expiresIn, or token null' },
          '503': { description: 'Token required but secret not configured' },
        },
      },
    },
    '/api/survey/visualization': {
      get: {
        summary: 'Survey visualization (PII)',
        security: [{ SurveyVizKey: [] }, { AlignmentApiKey: [] }, { OperatorSession: [] }],
        responses: { '200': { description: 'Rows' } },
      },
    },
    '/api/survey/approved-qualities': {
      get: {
        summary: 'Approved quotes',
        security: [{ SurveyVizKey: [] }, { AlignmentApiKey: [] }, { OperatorSession: [] }],
        responses: { '200': { description: 'Rows' } },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Operator login',
        security: [],
        responses: { '200': { description: 'Sets session cookie' }, '429': { description: 'Rate limited' } },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: 'Clear operator session cookie',
        security: [],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/api/auth/session': {
      get: {
        summary: 'Current operator session',
        security: [],
        responses: {
          '200': { description: 'authenticated + user' },
          '401': { description: 'Not logged in' },
        },
      },
    },
    '/api/test-data/{dataset}': {
      get: {
        summary: 'Stub test dataset JSON (dev/tests)',
        security: [],
        parameters: [{ name: 'dataset', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Stub JSON' } },
      },
    },
  },
  components: {
    securitySchemes: {
      AlignmentApiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'x-alignment-context-key',
        description: 'Matches ALIGNMENT_CONTEXT_API_SECRET when set.',
      },
      ClarificationApiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'x-clarification-queue-key',
        description:
          'When CLARIFICATION_QUEUE_API_SECRET is set; otherwise use x-alignment-context-key (alignment secret).',
      },
      BrainMapKey: {
        type: 'apiKey',
        in: 'header',
        name: 'x-brain-map-key',
        description: 'Matches BRAIN_MAP_SECRET when set (or use operator session cookie same-origin).',
      },
      SurveyVizKey: {
        type: 'apiKey',
        in: 'header',
        name: 'x-survey-visualization-key',
        description: 'Matches SURVEY_VISUALIZATION_API_SECRET for survey read endpoints in production.',
      },
      OperatorSession: {
        type: 'apiKey',
        in: 'cookie',
        name: 'opengrimoire_session',
        description: 'Signed session after POST /api/auth/login.',
      },
    },
  },
} as const;
