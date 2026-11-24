/**
 * Single pin for the OpenTelemetry GenAI semantic conventions this mapping implements.
 * Revision of the mapping starts by changing this constant.
 *
 * Release: semantic-conventions-genai v0.1.0 (21 Nov 2026), Apache-2.0.
 * https://github.com/open-telemetry/semantic-conventions-genai/releases/tag/v0.1.0
 */
export const GEN_AI_SEMCONV_SCHEMA_VERSION = 'gen_ai semconv 0.1.0' as const;

/**
 * OTel schema URL from semantic-conventions-genai v0.1.0 model/manifest.yaml.
 * `GEN_AI_SEMCONV_SCHEMA_VERSION` is only an internal label. Exporters must use this URL.
 */
export const GEN_AI_SEMCONV_SCHEMA_URL = 'https://opentelemetry.io/schemas/semconv-genai-dev/0.1.0-dev' as const;

/**
 * Spec content-capture mode. This mapping implements only the default.
 * SPAN_ONLY, EVENT_ONLY, and SPAN_AND_EVENT are not implemented.
 */
export const GEN_AI_CONTENT_CAPTURE_MODE = 'NO_CONTENT' as const;

/** Closed runtime sets. Values outside these lists are omitted, not copied into span names. */
export const GEN_AI_CONTROL_FLOWS = ['agent', 'workflow'] as const;
export const GEN_AI_INFERENCE_OPERATIONS = ['chat', 'generate_content', 'text_completion'] as const;
export const MCP_ROLES = ['client', 'server'] as const;

/**
 * Low-cardinality `error.type` classes. Any other non-numeric text is recorded
 * as `_OTHER` so free-text errors, hosts, and secrets are not copied.
 */
export const GEN_AI_ERROR_TYPES = [
  'timeout',
  'rate_limited',
  'tool_error',
  'cancelled',
  'invalid_request',
  'provider_error',
  '_OTHER',
] as const;

/** v0.1.0 `gen_ai.provider.name` members. Anything else is recorded as `_OTHER`. */
export const GEN_AI_PROVIDER_NAMES = [
  'anthropic',
  'aws.bedrock',
  'azure.ai.inference',
  'azure.ai.openai',
  'cohere',
  'deepseek',
  'gcp.gemini',
  'gcp.gen_ai',
  'gcp.vertex_ai',
  'groq',
  'ibm.watsonx.ai',
  'mistral',
  'moonshot_ai',
  'ollama',
  'openai',
  'perplexity',
  'x_ai',
] as const;

/**
 * Exact agent names this mapping will record. Any other agent name is omitted.
 * `recipe_runner` is the local workflow name used by the cockpit recipes.
 */
export const ASSISTANT_TEAM_AGENT_NAMES = ['Scout', 'recipe_runner'] as const;

/** Exact tool and prompt names this mapping will record. Any other name is omitted. */
export const ASSISTANT_TEAM_TOOL_NAMES = ['read_file'] as const;

/**
 * Exact model ids, plus the safe-shape rule in the mapper (a digit, and an
 * uppercase letter or a `.` or `:`). Host-style labels are not in this list.
 */
export const GEN_AI_MODEL_NAMES = [
  'gpt-4',
  'llama3.2:3b',
  'mistral-small',
  'Qwen2.5-7B-Instruct',
  'Mistral-Large-2',
] as const;

/** `mcp.method.name` members from semantic-conventions-genai v0.1.0. */
export const MCP_METHOD_NAMES = [
  'notifications/cancelled',
  'initialize',
  'notifications/initialized',
  'notifications/progress',
  'ping',
  'resources/list',
  'resources/templates/list',
  'resources/read',
  'notifications/resources/list_changed',
  'resources/subscribe',
  'resources/unsubscribe',
  'notifications/resources/updated',
  'prompts/list',
  'prompts/get',
  'notifications/prompts/list_changed',
  'tools/list',
  'tools/call',
  'notifications/tools/list_changed',
  'logging/setLevel',
  'notifications/message',
  'sampling/createMessage',
  'completion/complete',
  'roots/list',
  'notifications/roots/list_changed',
  'elicitation/create',
] as const;

/**
 * Names removed or replaced in v0.1.0. OpenGrimoire has no consumer of these
 * names, so the mapper does not emit them beside the v0.1.0 names.
 */
export const RETIRED_GEN_AI_SIGNAL_NAMES = [
  'gen_ai.workflow.name',
  'gen_ai.client.token.usage',
  'gen_ai.token.type',
  'rpc.response.status_code',
  'gen_ai.usage.cache_creation.input_tokens',
] as const;

/** Explicit bucket boundaries for the per-operation inference token histograms. */
export const INFERENCE_OPERATION_TOKEN_BUCKETS = [
  1, 4, 16, 64, 256, 1024, 4096, 16384, 65536, 262144, 1048576, 4194304, 16777216, 67108864,
] as const;

/**
 * Explicit bucket boundaries, in seconds, for `gen_ai.execute_tool.duration`
 * and `gen_ai.client.inference.duration`.
 */
export const GEN_AI_SHORT_DURATION_BUCKETS = [
  0.01, 0.02, 0.04, 0.08, 0.16, 0.32, 0.64, 1.28, 2.56, 5.12, 10.24, 20.48, 40.96, 81.92,
] as const;

/** Explicit bucket boundaries for `gen_ai.invoke_agent.duration`, in seconds. */
export const INVOKE_AGENT_DURATION_BUCKETS = [
  0.1, 0.2, 0.4, 0.8, 1.6, 3.2, 6.4, 12.8, 25.6, 51.2, 102.4, 204.8, 409.6, 900, 1800, 3600, 7200,
  14400, 43200, 86400,
] as const;

/**
 * JSON-RPC codes a MCP server span records on `rpc.status_code` but does not
 * treat as operation failures. Client spans treat every JSON-RPC code as a failure.
 */
export const MCP_SERVER_CALLER_FAULT_CODES = [-32700, -32600, -32601, -32602, -32002] as const;
