import { createHmac } from 'node:crypto';

import {
  GEN_AI_CONTENT_CAPTURE_MODE,
  GEN_AI_CONTROL_FLOWS,
  ASSISTANT_TEAM_AGENT_NAMES,
  ASSISTANT_TEAM_TOOL_NAMES,
  GEN_AI_MODEL_NAMES,
  GEN_AI_ERROR_TYPES,
  GEN_AI_INFERENCE_OPERATIONS,
  GEN_AI_PROVIDER_NAMES,
  GEN_AI_SEMCONV_SCHEMA_URL,
  GEN_AI_SEMCONV_SCHEMA_VERSION,
  GEN_AI_SHORT_DURATION_BUCKETS,
  INFERENCE_OPERATION_TOKEN_BUCKETS,
  INVOKE_AGENT_DURATION_BUCKETS,
  MCP_METHOD_NAMES,
  MCP_ROLES,
  MCP_SERVER_CALLER_FAULT_CODES,
} from './schema';

export type GenAiAttributeValue = string | number | boolean;

export interface MappedSpan {
  schemaVersion: typeof GEN_AI_SEMCONV_SCHEMA_VERSION;
  name: string;
  kind: 'INTERNAL' | 'CLIENT' | 'SERVER';
  registryType: string;
  statusCode: 'UNSET' | 'ERROR';
  attributes: Record<string, GenAiAttributeValue>;
}

export interface MappedMetric {
  schemaVersion: typeof GEN_AI_SEMCONV_SCHEMA_VERSION;
  name: string;
  instrument: 'histogram' | 'counter';
  unit: 's' | '{token}';
  value: number;
  attributes: Record<string, GenAiAttributeValue>;
  explicitBucketBoundaries?: readonly number[];
}

export interface AssistantTeamMapping {
  schemaVersion: typeof GEN_AI_SEMCONV_SCHEMA_VERSION;
  schemaUrl: typeof GEN_AI_SEMCONV_SCHEMA_URL;
  contentCapture: typeof GEN_AI_CONTENT_CAPTURE_MODE;
  spans: MappedSpan[];
  metrics: MappedMetric[];
  droppedFields: string[];
  omissions: string[];
}

interface SensitiveObservationFields {
  inputMessages?: unknown;
  outputMessages?: unknown;
  systemInstructions?: unknown;
  toolArguments?: unknown;
  toolResult?: unknown;
  secret?: string;
  apiToken?: string;
  clientName?: string;
  clientAddress?: string;
  hostname?: string;
  serverAddress?: string;
  jsonRpcMessage?: string;
}

export type AssistantTeamObservation =
  | ({
      signal: 'invoke_agent';
      controlFlow: 'agent' | 'workflow';
      agentName?: string;
      durationSeconds?: number;
      conversationId?: string;
      errorType?: string;
      inputTokens?: number | null;
      outputTokens?: number | null;
    } & SensitiveObservationFields)
  | ({
      signal: 'execute_tool';
      toolName: string;
      toolCallId?: string;
      agentName?: string;
      durationSeconds?: number;
      errorType?: string;
    } & SensitiveObservationFields)
  | ({
      signal: 'inference';
      operationName: 'chat' | 'generate_content' | 'text_completion';
      providerName: string;
      requestModel?: string;
      responseModel?: string;
      inputTokens?: number | null;
      outputTokens?: number | null;
      cacheReadInputTokens?: number | null;
      cacheWriteInputTokens?: number | null;
      reasoningOutputTokens?: number | null;
      errorType?: string;
      durationSeconds?: number;
    } & SensitiveObservationFields)
  | ({
      signal: 'mcp';
      role: 'client' | 'server';
      methodName: string;
      toolName?: string;
      promptName?: string;
      requestId?: string | number | null;
      jsonRpcErrorCode?: number;
      httpStatus?: number;
      errorType?: string;
      durationSeconds?: number;
    } & SensitiveObservationFields);

export interface LocalAiActivityLike {
  id?: string;
  ts?: string;
  kind: string;
  summary?: string;
  detail?: string;
}

const SENSITIVE_FIELD_NAMES = [
  'inputMessages',
  'outputMessages',
  'systemInstructions',
  'toolArguments',
  'toolResult',
  'secret',
  'apiToken',
  'clientName',
  'clientAddress',
  'hostname',
  'serverAddress',
  'jsonRpcMessage',
] as const satisfies readonly (keyof SensitiveObservationFields)[];

const SERVER_CALLER_FAULTS = new Set<number>(MCP_SERVER_CALLER_FAULT_CODES);

function emptyMapping(droppedFields: string[], omissions: string[] = []): AssistantTeamMapping {
  return {
    schemaVersion: GEN_AI_SEMCONV_SCHEMA_VERSION,
    schemaUrl: GEN_AI_SEMCONV_SCHEMA_URL,
    contentCapture: GEN_AI_CONTENT_CAPTURE_MODE,
    spans: [],
    metrics: [],
    droppedFields,
    omissions,
  };
}

function collectDroppedFields(observation: SensitiveObservationFields): string[] {
  const dropped: string[] = [];
  for (const field of SENSITIVE_FIELD_NAMES) {
    if (observation[field] !== undefined) dropped.push(field);
  }
  return dropped;
}

const SECRET_PREFIX =
  /^(?:github_pat_|sk-proj-|sk-ant-|sk-|sk_live_|sk_test_|rk_live_|rk_test_|lin_api_|dop_v1_|glpat-|pypi-|xapp-|glsa_|shpat_|ya29\.|ghp_|gho_|ghs_|ghu_|ghr_|gsk_|npm_|pplx-|xai-|xox[abpser]-|hf_|aiza|akia|asia|eyj|r8_|bearer)/i;
const AGENT_NAMES = new Set<string>(ASSISTANT_TEAM_AGENT_NAMES);
const TOOL_NAMES = new Set<string>(ASSISTANT_TEAM_TOOL_NAMES);
const MODEL_NAMES = new Set<string>(GEN_AI_MODEL_NAMES);
const PROVIDER_NAMES = new Set<string>(GEN_AI_PROVIDER_NAMES);
const MCP_METHODS = new Set<string>(MCP_METHOD_NAMES);

function isIpv4(value: string): boolean {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value);
}

function isHostname(value: string): boolean {
  const normalized = value.endsWith('.') ? value.slice(0, -1) : value;
  return /^(?:[a-z0-9_-]+\.)+[a-z]{2,}$/i.test(normalized);
}

function isIpv6(value: string): boolean {
  return value.includes(':') && /^[0-9a-f:]+$/i.test(value);
}

function isHostPort(value: string): boolean {
  const idx = value.lastIndexOf(':');
  if (idx <= 0) return false;
  const port = value.slice(idx + 1);
  if (!/^\d{1,5}$/.test(port)) return false;
  const host = value.slice(0, idx);
  return host.length > 0 && !host.includes(':');
}

function isDesktopHost(value: string): boolean {
  return /^desktop-[a-z0-9]+$/i.test(value);
}

function isJoinedClientName(value: string): boolean {
  return /[A-Z][A-Za-z0-9]*[_-][A-Z]/.test(value);
}

function isUnsafeNetworkIdentity(value: string): boolean {
  return (
    isIpv4(value) ||
    isIpv6(value) ||
    isHostname(value) ||
    isHostPort(value) ||
    isDesktopHost(value) ||
    isJoinedClientName(value) ||
    isLowerJoinedOrHostLabel(value) ||
    value === 'localhost' ||
    value.endsWith('.')
  );
}

function isLowerJoinedOrHostLabel(value: string): boolean {
  if (/^(?:req|call|conv)[_-]/i.test(value)) return false;
  if (/^desktop-/i.test(value)) return false;
  return /^[a-z0-9]+(?:[_-][a-z0-9]+){1,4}$/.test(value);
}

function looksSecret(value: string): boolean {
  return (
    SECRET_PREFIX.test(value) ||
    value.includes('://') ||
    value.includes('@') ||
    value.includes('\\') ||
    value.includes('/') ||
    /\s/.test(value)
  );
}

function ownData(source: object, key: string): unknown {
  if (!Object.hasOwn(source, key)) return undefined;
  return (source as Record<string, unknown>)[key];
}

function listedName(value: unknown, allow: Set<string>): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || looksSecret(trimmed) || !allow.has(trimmed)) return undefined;
  return trimmed;
}

function cleanAgentName(value: unknown): string | undefined {
  return listedName(value, AGENT_NAMES);
}

function cleanToolName(value: unknown): string | undefined {
  return listedName(value, TOOL_NAMES);
}

const UUID_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ULID_ID = /^[0-9A-HJKMNP-TV-Z]{26}$/;
const PROVIDER_ID = /^(?:call_|chatcmpl-|resp_)[A-Za-z0-9]{8,40}$/;
const HMAC_ID = /^hmac_[0-9a-f]{64}$/;

function hmacKey(): string | undefined {
  const raw = process.env.OPENGRIMOIRE_GENAI_ID_HMAC_KEY;
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return undefined;
  return trimmed;
}

export function hmacLocalId(value: string): string | undefined {
  const key = hmacKey();
  if (key === undefined || value.length === 0) return undefined;
  return `hmac_${createHmac('sha256', key).update(value).digest('hex')}`;
}

export function isAcceptedLocalId(value: string): boolean {
  return UUID_ID.test(value) || ULID_ID.test(value) || PROVIDER_ID.test(value) || HMAC_ID.test(value);
}

function idOmissions(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  const trimmed = value.trim();
  if (trimmed.length === 0) return [];
  if (looksSecret(trimmed)) return ['secret_id_rejected'];
  if (HMAC_ID.test(trimmed) && hmacKey() === undefined) return ['hmac_key_missing'];
  if (!isAcceptedLocalId(trimmed)) return ['id_shape_rejected'];
  return [];
}

function cleanToken(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || looksSecret(trimmed)) return undefined;
  if (HMAC_ID.test(trimmed) && hmacKey() === undefined) return undefined;
  if (!isAcceptedLocalId(trimmed)) return undefined;
  return trimmed;
}

const ERROR_TYPE_ALLOWLIST = new Set<string>(GEN_AI_ERROR_TYPES);

function cleanErrorType(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  if (/^-?[0-9]{1,5}$/.test(trimmed)) return trimmed;
  if (ERROR_TYPE_ALLOWLIST.has(trimmed)) return trimmed;
  return '_OTHER';
}

function cleanMethodName(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!MCP_METHODS.has(trimmed)) return undefined;
  return trimmed;
}

function cleanModel(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  if (MODEL_NAMES.has(trimmed)) return trimmed;
  return '_OTHER';
}

function cleanProvider(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  const normalized = trimmed === 'mistral_ai' ? 'mistral' : trimmed;
  if (PROVIDER_NAMES.has(normalized)) return normalized;
  return '_OTHER';
}

function knownTokenCount(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) return undefined;
  return value;
}

function histogramTokenCount(value: unknown): number {
  return knownTokenCount(value) ?? 0;
}

function durationOrUndefined(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return undefined;
  return value;
}

function attributes(entries: Array<[string, GenAiAttributeValue | undefined]>): Record<string, GenAiAttributeValue> {
  const result: Record<string, GenAiAttributeValue> = {};
  for (const [key, value] of entries) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}

function span(fields: Omit<MappedSpan, 'schemaVersion'>): MappedSpan {
  return { schemaVersion: GEN_AI_SEMCONV_SCHEMA_VERSION, ...fields };
}

function metric(fields: Omit<MappedMetric, 'schemaVersion'>): MappedMetric {
  return { schemaVersion: GEN_AI_SEMCONV_SCHEMA_VERSION, ...fields };
}

const CONTROL_FLOW_SET = new Set<string>(GEN_AI_CONTROL_FLOWS);
const INFERENCE_OPERATION_SET = new Set<string>(GEN_AI_INFERENCE_OPERATIONS);
const MCP_ROLE_SET = new Set<string>(MCP_ROLES);

function isControlFlow(value: unknown): value is (typeof GEN_AI_CONTROL_FLOWS)[number] {
  return typeof value === 'string' && CONTROL_FLOW_SET.has(value);
}

function isInferenceOperation(value: unknown): value is (typeof GEN_AI_INFERENCE_OPERATIONS)[number] {
  return typeof value === 'string' && INFERENCE_OPERATION_SET.has(value);
}

function isMcpRole(value: unknown): value is (typeof MCP_ROLES)[number] {
  return typeof value === 'string' && MCP_ROLE_SET.has(value);
}

function invokeOperation(controlFlow: (typeof GEN_AI_CONTROL_FLOWS)[number]): 'invoke_agent' | 'invoke_workflow' {
  switch (controlFlow) {
    case 'agent':
      return 'invoke_agent';
    case 'workflow':
      return 'invoke_workflow';
    default: {
      const unreachable: never = controlFlow;
      return unreachable;
    }
  }
}

function mapInvoke(observation: Extract<AssistantTeamObservation, { signal: 'invoke_agent' }>): AssistantTeamMapping {
  const controlFlow = ownData(observation, 'controlFlow');
  if (!isControlFlow(controlFlow)) {
    return emptyMapping(collectDroppedFields(observation), ['control_flow_rejected']);
  }
  const operation = invokeOperation(controlFlow);
  const agentName = cleanAgentName(ownData(observation, 'agentName'));
  const conversationId = cleanToken(ownData(observation, 'conversationId'));
  const errorType = cleanErrorType(ownData(observation, 'errorType'));
  const inputTokens = controlFlow === 'agent' ? knownTokenCount(ownData(observation, 'inputTokens')) : undefined;
  const outputTokens = controlFlow === 'agent' ? knownTokenCount(ownData(observation, 'outputTokens')) : undefined;
  const spanAttributes = attributes([
    ['gen_ai.operation.name', operation],
    ['error.type', errorType],
    ['gen_ai.agent.name', agentName],
    ['gen_ai.conversation.id', conversationId],
    ['gen_ai.usage.input_tokens', inputTokens],
    ['gen_ai.usage.output_tokens', outputTokens],
  ]);
  const duration = durationOrUndefined(ownData(observation, 'durationSeconds'));
  const metrics: MappedMetric[] = [];
  if (duration !== undefined) {
    metrics.push(
      metric({
        name: 'gen_ai.invoke_agent.duration',
        instrument: 'histogram',
        unit: 's',
        value: duration,
        explicitBucketBoundaries: INVOKE_AGENT_DURATION_BUCKETS,
        attributes: attributes([
          ['gen_ai.operation.name', operation],
          ['error.type', errorType],
          ['gen_ai.agent.name', agentName],
        ]),
      })
    );
  }

  return {
    ...emptyMapping(collectDroppedFields(observation), [
      ...(agentName === undefined && ownData(observation, 'agentName') !== undefined ? ['agent_name_rejected'] : []),
      ...idOmissions(ownData(observation, 'conversationId')),
    ]),
    spans: [
      span({
        name: agentName ? `${operation} ${agentName}` : operation,
        kind: 'INTERNAL',
        registryType: 'gen_ai.invoke_agent.internal',
        statusCode: errorType ? 'ERROR' : 'UNSET',
        attributes: spanAttributes,
      }),
    ],
    metrics,
  };
}

function mapTool(observation: Extract<AssistantTeamObservation, { signal: 'execute_tool' }>): AssistantTeamMapping {
  const toolName = cleanToolName(ownData(observation, 'toolName'));
  const droppedFields = collectDroppedFields(observation);
  if (!toolName) {
    return emptyMapping(droppedFields, ['tool_name_required']);
  }
  const agentName = cleanAgentName(ownData(observation, 'agentName'));
  const toolCallId = cleanToken(ownData(observation, 'toolCallId'));
  const errorType = cleanErrorType(ownData(observation, 'errorType'));
  const spanAttributes = attributes([
    ['gen_ai.operation.name', 'execute_tool'],
    ['gen_ai.tool.name', toolName],
    ['gen_ai.tool.call.id', toolCallId],
    ['gen_ai.agent.name', agentName],
    ['error.type', errorType],
  ]);
  const duration = durationOrUndefined(ownData(observation, 'durationSeconds'));
  const metrics: MappedMetric[] = [];
  if (duration !== undefined) {
    metrics.push(
      metric({
        name: 'gen_ai.execute_tool.duration',
        instrument: 'histogram',
        unit: 's',
        value: duration,
        explicitBucketBoundaries: GEN_AI_SHORT_DURATION_BUCKETS,
        attributes: attributes([
          ['gen_ai.tool.name', toolName],
          ['gen_ai.agent.name', agentName],
          ['error.type', errorType],
        ]),
      })
    );
  }

  return {
    ...emptyMapping(droppedFields, idOmissions(ownData(observation, 'toolCallId'))),
    spans: [
      span({
        name: `execute_tool ${toolName}`,
        kind: 'INTERNAL',
        registryType: 'gen_ai.execute_tool',
        statusCode: errorType ? 'ERROR' : 'UNSET',
        attributes: spanAttributes,
      }),
    ],
    metrics,
  };
}

function tokenCounter(
  name: string,
  value: number | undefined,
  shared: Record<string, GenAiAttributeValue>,
  includeModality: boolean
): MappedMetric | undefined {
  if (value === undefined || value <= 0) return undefined;
  return metric({
    name,
    instrument: 'counter',
    unit: '{token}',
    value,
    attributes: includeModality ? { ...shared, 'gen_ai.token.modality': 'unknown' } : { ...shared },
  });
}

function mapInference(observation: Extract<AssistantTeamObservation, { signal: 'inference' }>): AssistantTeamMapping {
  const droppedFields = collectDroppedFields(observation);
  const operationName = ownData(observation, 'operationName');
  if (!isInferenceOperation(operationName)) {
    return emptyMapping(droppedFields, ['inference_operation_rejected']);
  }
  const providerName = cleanProvider(ownData(observation, 'providerName'));
  if (!providerName) {
    return emptyMapping(droppedFields, ['inference_provider_required']);
  }

  const requestModel = cleanModel(ownData(observation, 'requestModel'));
  const responseModel = cleanModel(ownData(observation, 'responseModel'));
  const errorType = cleanErrorType(ownData(observation, 'errorType'));
  const inputTokens = knownTokenCount(ownData(observation, 'inputTokens'));
  const outputTokens = knownTokenCount(ownData(observation, 'outputTokens'));
  const cacheRead = knownTokenCount(ownData(observation, 'cacheReadInputTokens'));
  const cacheWrite = knownTokenCount(ownData(observation, 'cacheWriteInputTokens'));
  const reasoning = knownTokenCount(ownData(observation, 'reasoningOutputTokens'));
  const shared = attributes([
    ['gen_ai.operation.name', operationName],
    ['gen_ai.provider.name', providerName],
    ['gen_ai.request.model', requestModel],
    ['gen_ai.response.model', responseModel],
  ]);
  const histogramAttributes = errorType ? { ...shared, 'error.type': errorType } : { ...shared };

  const metrics: MappedMetric[] = [
    metric({
      name: 'gen_ai.client.inference.operation.input_tokens',
      instrument: 'histogram',
      unit: '{token}',
      value: histogramTokenCount(ownData(observation, 'inputTokens')),
      explicitBucketBoundaries: INFERENCE_OPERATION_TOKEN_BUCKETS,
      attributes: histogramAttributes,
    }),
    metric({
      name: 'gen_ai.client.inference.operation.output_tokens',
      instrument: 'histogram',
      unit: '{token}',
      value: histogramTokenCount(ownData(observation, 'outputTokens')),
      explicitBucketBoundaries: INFERENCE_OPERATION_TOKEN_BUCKETS,
      attributes: histogramAttributes,
    }),
  ];

  for (const counter of [
    tokenCounter('gen_ai.client.inference.usage.input_tokens', inputTokens, shared, true),
    tokenCounter('gen_ai.client.inference.usage.output_tokens', outputTokens, shared, true),
    tokenCounter('gen_ai.client.inference.usage.cache_read.input_tokens', cacheRead, shared, true),
    tokenCounter('gen_ai.client.inference.usage.cache_write.input_tokens', cacheWrite, shared, true),
    tokenCounter('gen_ai.client.inference.usage.reasoning.output_tokens', reasoning, shared, false),
  ]) {
    if (counter) metrics.push(counter);
  }

  const duration = durationOrUndefined(ownData(observation, 'durationSeconds'));
  if (duration !== undefined) {
    metrics.push(
      metric({
        name: 'gen_ai.client.inference.duration',
        instrument: 'histogram',
        unit: 's',
        value: duration,
        explicitBucketBoundaries: GEN_AI_SHORT_DURATION_BUCKETS,
        attributes: histogramAttributes,
      })
    );
  }

  return {
    ...emptyMapping(droppedFields),
    spans: [
      span({
        name: requestModel ? `${operationName} ${requestModel}` : operationName,
        kind: 'CLIENT',
        registryType: 'gen_ai.client.inference',
        statusCode: errorType ? 'ERROR' : 'UNSET',
        attributes: attributes([
          ['gen_ai.operation.name', operationName],
          ['gen_ai.provider.name', providerName],
          ['error.type', errorType],
          ['gen_ai.request.model', requestModel],
          ['gen_ai.response.model', responseModel],
          ['gen_ai.usage.input_tokens', inputTokens],
          ['gen_ai.usage.output_tokens', outputTokens],
          ['gen_ai.usage.cache_read.input_tokens', cacheRead && cacheRead > 0 ? cacheRead : undefined],
          ['gen_ai.usage.cache_write.input_tokens', cacheWrite && cacheWrite > 0 ? cacheWrite : undefined],
        ]),
      }),
    ],
    metrics,
  };
}

function pureInteger(value: unknown): number | undefined {
  let parsed: number | undefined;
  if (typeof value === 'number') {
    if (!Number.isInteger(value)) return undefined;
    parsed = value;
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!/^-?\d+$/.test(trimmed)) return undefined;
    parsed = Number(trimmed);
  } else {
    return undefined;
  }
  if (!Number.isSafeInteger(parsed) || Math.abs(parsed) > 99999) return undefined;
  return parsed;
}

function hasMixedCodeText(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== '' && !/^-?\d+$/.test(value.trim());
}

function jsonRpcCode(value: unknown): number | 'rejected' | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (hasMixedCodeText(value)) return 'rejected';
  const parsed = pureInteger(value);
  if (parsed !== undefined) return parsed;
  if (typeof value === 'number' && Number.isInteger(value)) return 'rejected';
  if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) return 'rejected';
  return undefined;
}

function httpStatusCode(value: unknown): number | 'rejected' | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (hasMixedCodeText(value)) return 'rejected';
  const parsed = pureInteger(value);
  if (parsed === undefined) {
    if (typeof value === 'number' && Number.isInteger(value)) return 'rejected';
    if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) return 'rejected';
    return undefined;
  }
  if (parsed >= 100 && parsed <= 399) return undefined;
  if (parsed >= 400 && parsed <= 599) return parsed;
  return 'rejected';
}

function safeIntegerToken(value: unknown): string | undefined {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) ? String(value) : undefined;
  }
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isSafeInteger(parsed) || String(parsed) !== trimmed) return undefined;
  return trimmed;
}

function requestId(value: unknown): string | undefined {
  return safeIntegerToken(value) ?? cleanToken(value);
}

function requestIdOmissions(value: unknown): string[] {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) ? [] : ['request_id_rejected'];
  }
  if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) {
    return safeIntegerToken(value) === undefined ? ['request_id_rejected'] : [];
  }
  return idOmissions(value);
}

function mcpFailure(
  role: 'client' | 'server',
  code: number | 'rejected' | undefined,
  httpStatus: number | 'rejected' | undefined,
  errorType: string | undefined
): {
  statusCode: 'UNSET' | 'ERROR';
  errorType?: string;
  rpcStatusCode?: string;
} {
  if (code === 'rejected' || httpStatus === 'rejected') {
    return { statusCode: 'ERROR', errorType: '_OTHER' };
  }
  if (code !== undefined) {
    const callerFault = SERVER_CALLER_FAULTS.has(code);
    const failed = role === 'client' || !callerFault;
    return {
      statusCode: failed ? 'ERROR' : 'UNSET',
      errorType: failed ? String(code) : undefined,
      rpcStatusCode: String(code),
    };
  }
  if (typeof httpStatus === 'number' && Number.isInteger(httpStatus) && httpStatus >= 400) {
    return { statusCode: 'ERROR', errorType: String(httpStatus) };
  }
  if (errorType) return { statusCode: 'ERROR', errorType };
  return { statusCode: 'UNSET' };
}

function mapMcp(observation: Extract<AssistantTeamObservation, { signal: 'mcp' }>): AssistantTeamMapping {
  const role = ownData(observation, 'role');
  if (!isMcpRole(role)) {
    return emptyMapping(collectDroppedFields(observation), ['mcp_role_rejected']);
  }
  const methodName = cleanMethodName(ownData(observation, 'methodName'));
  const droppedFields = collectDroppedFields(observation);
  if (!methodName) return emptyMapping(droppedFields, ['mcp_method_required']);

  const toolName = cleanToolName(ownData(observation, 'toolName'));
  const promptName = toolName ? undefined : cleanToolName(ownData(observation, 'promptName'));
  const target = toolName ?? promptName;
  const code = jsonRpcCode(ownData(observation, 'jsonRpcErrorCode'));
  const failure = mcpFailure(role, code, httpStatusCode(ownData(observation, 'httpStatus')), cleanErrorType(ownData(observation, 'errorType')));
  const isToolCall = methodName === 'tools/call';
  const spanAttributes = attributes([
    ['mcp.method.name', methodName],
    ['gen_ai.tool.name', toolName],
    ['gen_ai.prompt.name', promptName],
    ['gen_ai.operation.name', isToolCall ? 'execute_tool' : undefined],
    ['jsonrpc.request.id', requestId(ownData(observation, 'requestId'))],
    ['rpc.status_code', failure.rpcStatusCode],
    ['error.type', failure.errorType],
  ]);
  const duration = durationOrUndefined(ownData(observation, 'durationSeconds'));
  const metrics: MappedMetric[] = [];
  if (duration !== undefined) {
    metrics.push(
      metric({
        name: role === 'client' ? 'mcp.client.operation.duration' : 'mcp.server.operation.duration',
        instrument: 'histogram',
        unit: 's',
        value: duration,
        attributes: attributes([
          ['mcp.method.name', methodName],
          ['gen_ai.tool.name', toolName],
          ['gen_ai.prompt.name', promptName],
          ['gen_ai.operation.name', isToolCall ? 'execute_tool' : undefined],
          ['rpc.status_code', failure.rpcStatusCode],
          ['error.type', failure.errorType],
        ]),
      })
    );
  }

  const kind = role === 'client' ? 'CLIENT' : 'SERVER';
  const registryType = role === 'client' ? 'mcp.client' : 'mcp.server';

  return {
    ...emptyMapping(droppedFields, requestIdOmissions(ownData(observation, 'requestId'))),
    spans: [
      span({
        name: target ? `${methodName} ${target}` : methodName,
        kind,
        registryType,
        statusCode: failure.statusCode,
        attributes: spanAttributes,
      }),
    ],
    metrics,
  };
}

function isKnownSignal(value: unknown): value is AssistantTeamObservation['signal'] {
  return value === 'invoke_agent' || value === 'execute_tool' || value === 'inference' || value === 'mcp';
}

function mapAssistantTeamObservationInner(observation: AssistantTeamObservation): AssistantTeamMapping {
  if (!observation || typeof observation !== 'object') {
    return emptyMapping([], ['unknown_signal']);
  }
  const signal = ownData(observation, 'signal');
  if (!isKnownSignal(signal)) {
    return emptyMapping(collectDroppedFields(observation), ['unknown_signal']);
  }

  switch (signal) {
    case 'invoke_agent':
      return mapInvoke(observation as Extract<AssistantTeamObservation, { signal: 'invoke_agent' }>);
    case 'execute_tool':
      return mapTool(observation as Extract<AssistantTeamObservation, { signal: 'execute_tool' }>);
    case 'inference':
      return mapInference(observation as Extract<AssistantTeamObservation, { signal: 'inference' }>);
    case 'mcp':
      return mapMcp(observation as Extract<AssistantTeamObservation, { signal: 'mcp' }>);
    default: {
      const unreachable: never = signal;
      void unreachable;
      return emptyMapping(collectDroppedFields(observation), ['unknown_signal']);
    }
  }
}

export function mapAssistantTeamObservation(observation: AssistantTeamObservation): AssistantTeamMapping {
  try {
    return mapAssistantTeamObservationInner(observation);
  } catch {
    return emptyMapping([], ['observation_unreadable']);
  }
}

function mapLocalAiActivityEventInner(event: LocalAiActivityLike): AssistantTeamMapping {
  if (!event || typeof event !== 'object') {
    return emptyMapping([], ['local_ai_activity_not_gen_ai']);
  }
  const droppedFields: string[] = [];
  if (ownData(event, 'summary') !== undefined) droppedFields.push('summary');
  if (ownData(event, 'detail') !== undefined) droppedFields.push('detail');
  return emptyMapping(droppedFields, ['local_ai_activity_not_gen_ai']);
}

export function mapLocalAiActivityEvent(event: LocalAiActivityLike): AssistantTeamMapping {
  try {
    return mapLocalAiActivityEventInner(event);
  } catch {
    return emptyMapping([], ['observation_unreadable']);
  }
}
