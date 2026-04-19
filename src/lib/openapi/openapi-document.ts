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
                  harnessProfileId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Optional selected harness profile id from /api/harness-profiles/select.',
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
    '/api/harness-profiles': {
      get: {
        summary: 'List harness profiles for Sync Session/external harness alignment',
        security: [{ AlignmentApiKey: [] }, { OperatorSession: [] }],
        responses: { '200': { description: 'profiles[]' } },
      },
      post: {
        summary: 'Create harness profile',
        security: [{ AlignmentApiKey: [] }, { OperatorSession: [] }],
        responses: { '201': { description: 'profile' } },
      },
      put: {
        summary: 'Import or export harness profile files (?action=import|export)',
        security: [{ AlignmentApiKey: [] }, { OperatorSession: [] }],
        responses: { '200': { description: 'import/export result' } },
      },
    },
    '/api/harness-profiles/{id}': {
      get: {
        summary: 'Get harness profile by id',
        security: [{ AlignmentApiKey: [] }, { OperatorSession: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'profile' } },
      },
      patch: {
        summary: 'Update harness profile',
        security: [{ AlignmentApiKey: [] }, { OperatorSession: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'profile' } },
      },
      delete: {
        summary: 'Delete harness profile',
        security: [{ AlignmentApiKey: [] }, { OperatorSession: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'ok' } },
      },
    },
    '/api/harness-profiles/select': {
      get: {
        summary: 'Resolve selected/default harness profile for Sync Session start',
        security: [],
        responses: { '200': { description: 'selected + items' } },
      },
      post: {
        summary: 'Validate and resolve an explicit harness profile selection',
        security: [],
        responses: { '200': { description: 'selected profile' } },
      },
    },
    '/api/harness-profiles/openharness': {
      get: {
        summary: 'OpenHarness-oriented bundle of harness profiles plus selected profile resolution',
        security: [{ AlignmentApiKey: [] }, { OperatorSession: [] }],
        parameters: [
          {
            name: 'surveyResponseId',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: { '200': { description: 'bundle' } },
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
        description:
          'Returns joined survey rows for visualization. When query `all=1`, all rows are returned and `showTestData` is ignored. Otherwise `showTestData` filters test vs production rows.',
        security: [{ SurveyVizKey: [] }, { AlignmentApiKey: [] }, { OperatorSession: [] }],
        parameters: [
          {
            name: 'all',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['0', '1'] },
            description: '`1` = cohort/all rows path (ignores showTestData). Omit or `0` = apply showTestData filter.',
          },
          {
            name: 'showTestData',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['true', 'false'] },
            description: 'Only when `all` is not `1`: filter rows where test_data matches.',
          },
        ],
        responses: {
          '200': {
            description: 'Survey rows with attendee join',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SurveyVisualizationResponse' },
              },
            },
          },
          '401': { description: 'Survey read denied in production (see checkSurveyReadGate)' },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SurveyVisualizationErrorBody' },
              },
            },
          },
        },
      },
    },
    '/api/survey/approved-qualities': {
      get: {
        summary: 'Approved unique_quality quotes (PII)',
        security: [{ SurveyVizKey: [] }, { AlignmentApiKey: [] }, { OperatorSession: [] }],
        responses: {
          '200': {
            description: 'Approved quotes with attendee names',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApprovedQualitiesResponse' },
              },
            },
          },
          '401': { description: 'Survey read denied in production (see checkSurveyReadGate)' },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SurveyVisualizationErrorBody' },
              },
            },
          },
        },
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
    '/api/study/decks': {
      get: {
        summary: 'List study decks (SRS / flashcards)',
        security: [{ AlignmentApiKey: [] }, { OperatorSession: [] }],
        responses: { '200': { description: 'decks[]' } },
      },
      post: {
        summary: 'Create study deck',
        security: [{ AlignmentApiKey: [] }, { OperatorSession: [] }],
        responses: { '201': { description: 'deck' } },
      },
    },
    '/api/study/decks/{deckId}/cards': {
      get: {
        summary: 'List cards in deck; query due=1 limits to due cards',
        security: [{ AlignmentApiKey: [] }, { OperatorSession: [] }],
        parameters: [{ name: 'deckId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'cards[]' } },
      },
      post: {
        summary: 'Create study card',
        security: [{ AlignmentApiKey: [] }, { OperatorSession: [] }],
        parameters: [{ name: 'deckId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '201': { description: 'card' } },
      },
    },
    '/api/study/cards/{cardId}/review': {
      post: {
        summary: 'Submit SM-2 review (again | hard | good | easy)',
        security: [{ AlignmentApiKey: [] }, { OperatorSession: [] }],
        parameters: [{ name: 'cardId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'card' } },
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
    '/api/operator-probes/ingest': {
      post: {
        summary: 'Ingest operator path/probe run (allowlisted target_host)',
        description:
          'Body: probe_type, target_host, runner_id, runner_type, summary (object), optional raw_blob. Auth: operator session cookie OR x-operator-probe-ingest-key when OPERATOR_PROBE_INGEST_SECRET is set.',
        security: [{ OperatorProbeIngestKey: [] }, { OperatorSession: [] }],
        responses: {
          '201': { description: 'id + expires_at' },
          '400': { description: 'Validation or allowlist failure' },
          '401': { description: 'Unauthorized ingest key' },
          '429': { description: 'Rate limited' },
          '503': { description: 'Ingest secret not configured for non-session callers' },
        },
      },
    },
  },
  components: {
    schemas: {
      SurveyVisualizationAttendee: {
        type: 'object',
        required: ['first_name', 'is_anonymous'],
        properties: {
          first_name: { type: 'string' },
          last_name: { type: 'string', nullable: true },
          is_anonymous: { type: 'boolean' },
        },
      },
      ModerationStatusEntry: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            description: 'pending | approved | rejected',
          },
        },
      },
      SurveyVisualizationRow: {
        type: 'object',
        required: [
          'id',
          'attendee_id',
          'session_type',
          'questionnaire_version',
          'status',
          'test_data',
          'created_at',
          'updated_at',
          'attendee',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          attendee_id: { type: 'string', format: 'uuid' },
          session_type: { type: 'string' },
          questionnaire_version: { type: 'string' },
          tenure_years: { type: 'integer', nullable: true },
          learning_style: {
            type: 'string',
            nullable: true,
            description: 'visual | auditory | kinesthetic | reading_writing',
          },
          shaped_by: {
            type: 'string',
            nullable: true,
            description: 'mentor | challenge | failure | success | team | other',
          },
          peak_performance: { type: 'string', nullable: true },
          motivation: { type: 'string', nullable: true },
          unique_quality: { type: 'string', nullable: true },
          harness_profile_id: { type: 'string', format: 'uuid', nullable: true },
          status: { type: 'string', description: 'Moderation status on survey_responses row' },
          moderated_at: { type: 'string', format: 'date-time', nullable: true },
          test_data: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          attendee: { $ref: '#/components/schemas/SurveyVisualizationAttendee' },
          moderation: {
            type: 'array',
            nullable: true,
            items: { $ref: '#/components/schemas/ModerationStatusEntry' },
          },
        },
      },
      SurveyVisualizationResponse: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/SurveyVisualizationRow' },
          },
        },
      },
      SurveyVisualizationErrorBody: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
      ApprovedQualityAttendee: {
        type: 'object',
        required: ['first_name', 'is_anonymous'],
        properties: {
          first_name: { type: 'string' },
          last_name: { type: 'string', nullable: true },
          is_anonymous: { type: 'boolean' },
        },
      },
      ApprovedQualityItem: {
        type: 'object',
        required: ['unique_quality', 'attendee'],
        properties: {
          unique_quality: { type: 'string', nullable: true },
          attendee: { $ref: '#/components/schemas/ApprovedQualityAttendee' },
        },
      },
      ApprovedQualitiesResponse: {
        type: 'object',
        required: ['items'],
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/ApprovedQualityItem' },
          },
        },
      },
    },
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
      OperatorProbeIngestKey: {
        type: 'apiKey',
        in: 'header',
        name: 'x-operator-probe-ingest-key',
        description: 'Matches OPERATOR_PROBE_INGEST_SECRET when set (runner/CI ingest without operator cookie).',
      },
    },
  },
} as const;
