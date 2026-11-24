import {
  GEN_AI_CONTENT_CAPTURE_MODE,
  GEN_AI_CONTROL_FLOWS,
  GEN_AI_INFERENCE_OPERATIONS,
  GEN_AI_SEMCONV_SCHEMA_VERSION,
  INFERENCE_OPERATION_TOKEN_BUCKETS,
  INVOKE_AGENT_DURATION_BUCKETS,
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

function isIpv4(value: string): boolean {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value);
}

function isHostname(value: string): boolean {
  return /^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(value);
}

function hasSecretMarker(value: string): boolean {
  return value.includes('://') || value.includes('@');
}

function cleanAgentOrTool(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 128) return undefined;
  if (hasSecretMarker(trimmed) || trimmed.includes('/') || isIpv4(trimmed) || isHostname(trimmed)) return undefined;
  return trimmed;
}

function cleanToken(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 128 || /\s/.test(trimmed)) return undefined;
  if (hasSecretMarker(trimmed) || isIpv4(trimmed) || isHostname(trimmed)) return undefined;
  return trimmed;
}

function cleanErrorType(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 128 || /\s/.test(trimmed)) return undefined;
  if (hasSecretMarker(trimmed) || isIpv4(trimmed)) return undefined;
  return trimmed;
}

function cleanMethodName(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 128 || /\s/.test(trimmed)) return undefined;
  if (hasSecretMarker(trimmed) || isIpv4(trimmed)) return undefined;
  if (!trimmed.includes('/') && isHostname(trimmed)) return undefined;
  return trimmed;
}

function cleanModel(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 128 || /\s/.test(trimmed)) return undefined;
  if (trimmed.includes('://') || trimmed.includes('@') || trimmed.includes('/') || isIpv4(trimmed)) return undefined;
  return trimmed;
}

function cleanProvider(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 64 || /\s/.test(trimmed)) return undefined;
  const normalized = trimmed === 'mistral_ai' ? 'mistral' : trimmed;
  if (normalized.includes('://') || normalized.includes('@') || normalized.includes('/') || isIpv4(normalized)) {
    return undefined;
  }
  return normalized;
}

function knownTokenCount(value: number | null | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) return undefined;
  return value;
}

function histogramTokenCount(value: number | null | undefined): number {
  return knownTokenCount(value) ?? 0;
}

function durationOrUndefined(value: number | undefined): number | undefined {
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

function isControlFlow(value: unknown): value is (typeof GEN_AI_CONTROL_FLOWS)[number] {
  return typeof value === 'string' && (GEN_AI_CONTROL_FLOWS as readonly string[]).includes(value);
}

function isInferenceOperation(value: unknown): value is (typeof GEN_AI_INFERENCE_OPERATIONS)[number] {
  return typeof value === 'string' && (GEN_AI_INFERENCE_OPERATIONS as readonly string[]).includes(value);
}

function isMcpRole(value: unknown): value is (typeof MCP_ROLES)[number] {
  return typeof value === 'string' && (MCP_ROLES as readonly string[]).includes(value);
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
  if (!isControlFlow(observation.controlFlow)) {
    return emptyMapping(collectDroppedFields(observation), ['control_flow_rejected']);
  }
  const operation = invokeOperation(observation.controlFlow);
  const agentName = cleanAgentOrTool(observation.agentName);
  const conversationId = cleanToken(observation.conversationId);
  const errorType = cleanErrorType(observation.errorType);
  const inputTokens = observation.controlFlow === 'agent' ? knownTokenCount(observation.inputTokens) : undefined;
  const outputTokens = observation.controlFlow === 'agent' ? knownTokenCount(observation.outputTokens) : undefined;
  const spanAttributes = attributes([
    ['gen_ai.operation.name', operation],
    ['error.type', errorType],
    ['gen_ai.agent.name', agentName],
    ['gen_ai.conversation.id', conversationId],
    ['gen_ai.usage.input_tokens', inputTokens],
    ['gen_ai.usage.output_tokens', outputTokens],
  ]);
  const duration = durationOrUndefined(observation.durationSeconds);
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
    ...emptyMapping(collectDroppedFields(observation), agentName === undefined && observation.agentName ? ['agent_name_rejected'] : []),
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
  const toolName = cleanAgentOrTool(observation.toolName);
  const droppedFields = collectDroppedFields(observation);
  if (!toolName) {
    return emptyMapping(droppedFields, ['tool_name_required']);
  }
  const agentName = cleanAgentOrTool(observation.agentName);
  const toolCallId = cleanToken(observation.toolCallId);
  const errorType = cleanErrorType(observation.errorType);
  const spanAttributes = attributes([
    ['gen_ai.operation.name', 'execute_tool'],
    ['gen_ai.tool.name', toolName],
    ['gen_ai.tool.call.id', toolCallId],
    ['gen_ai.agent.name', agentName],
    ['error.type', errorType],
  ]);
  const duration = durationOrUndefined(observation.durationSeconds);
  const metrics: MappedMetric[] = [];
  if (duration !== undefined) {
    metrics.push(
      metric({
        name: 'gen_ai.execute_tool.duration',
        instrument: 'histogram',
        unit: 's',
        value: duration,
        attributes: attributes([
          ['gen_ai.operation.name', 'execute_tool'],
          ['gen_ai.tool.name', toolName],
          ['gen_ai.agent.name', agentName],
          ['error.type', errorType],
        ]),
      })
    );
  }

  return {
    ...emptyMapping(droppedFields),
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
  if (!isInferenceOperation(observation.operationName)) {
    return emptyMapping(droppedFields, ['inference_operation_rejected']);
  }
  const providerName = cleanProvider(observation.providerName);
  if (!providerName) {
    return emptyMapping(droppedFields, ['inference_provider_required']);
  }

  const requestModel = cleanModel(observation.requestModel);
  const responseModel = cleanModel(observation.responseModel);
  const errorType = cleanErrorType(observation.errorType);
  const inputTokens = knownTokenCount(observation.inputTokens);
  const outputTokens = knownTokenCount(observation.outputTokens);
  const cacheRead = knownTokenCount(observation.cacheReadInputTokens);
  const cacheWrite = knownTokenCount(observation.cacheWriteInputTokens);
  const reasoning = knownTokenCount(observation.reasoningOutputTokens);
  const shared = attributes([
    ['gen_ai.operation.name', observation.operationName],
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
      value: histogramTokenCount(observation.inputTokens),
      explicitBucketBoundaries: INFERENCE_OPERATION_TOKEN_BUCKETS,
      attributes: histogramAttributes,
    }),
    metric({
      name: 'gen_ai.client.inference.operation.output_tokens',
      instrument: 'histogram',
      unit: '{token}',
      value: histogramTokenCount(observation.outputTokens),
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

  const duration = durationOrUndefined(observation.durationSeconds);
  if (duration !== undefined) {
    metrics.push(
      metric({
        name: 'gen_ai.client.inference.duration',
        instrument: 'histogram',
        unit: 's',
        value: duration,
        attributes: histogramAttributes,
      })
    );
  }

  return {
    ...emptyMapping(droppedFields),
    spans: [
      span({
        name: requestModel ? `${observation.operationName} ${requestModel}` : observation.operationName,
        kind: 'CLIENT',
        registryType: 'gen_ai.client.inference',
        statusCode: errorType ? 'ERROR' : 'UNSET',
        attributes: attributes([
          ['gen_ai.operation.name', observation.operationName],
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

function jsonRpcCode(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value)) return undefined;
  return value;
}

function requestId(value: string | number | null | undefined): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 128 || hasSecretMarker(trimmed) || isIpv4(trimmed) || isHostname(trimmed)) {
    return undefined;
  }
  return trimmed;
}

function mcpFailure(role: 'client' | 'server', code: number | undefined, httpStatus: number | undefined, errorType: string | undefined): {
  statusCode: 'UNSET' | 'ERROR';
  errorType?: string;
  rpcStatusCode?: string;
} {
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
  if (!isMcpRole(observation.role)) {
    return emptyMapping(collectDroppedFields(observation), ['mcp_role_rejected']);
  }
  const methodName = cleanMethodName(observation.methodName);
  const droppedFields = collectDroppedFields(observation);
  if (!methodName) return emptyMapping(droppedFields, ['mcp_method_required']);

  const toolName = cleanAgentOrTool(observation.toolName);
  const promptName = toolName ? undefined : cleanAgentOrTool(observation.promptName);
  const target = toolName ?? promptName;
  const code = jsonRpcCode(observation.jsonRpcErrorCode);
  const failure = mcpFailure(observation.role, code, observation.httpStatus, cleanErrorType(observation.errorType));
  const isToolCall = methodName === 'tools/call';
  const spanAttributes = attributes([
    ['mcp.method.name', methodName],
    ['gen_ai.tool.name', toolName],
    ['gen_ai.prompt.name', promptName],
    ['gen_ai.operation.name', isToolCall ? 'execute_tool' : undefined],
    ['jsonrpc.request.id', requestId(observation.requestId)],
    ['rpc.status_code', failure.rpcStatusCode],
    ['error.type', failure.errorType],
  ]);
  const duration = durationOrUndefined(observation.durationSeconds);
  const metrics: MappedMetric[] = [];
  if (duration !== undefined) {
    metrics.push(
      metric({
        name: observation.role === 'client' ? 'mcp.client.operation.duration' : 'mcp.server.operation.duration',
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

  const kind = observation.role === 'client' ? 'CLIENT' : 'SERVER';
  const registryType = observation.role === 'client' ? 'mcp.client' : 'mcp.server';

  return {
    ...emptyMapping(droppedFields),
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

export function mapAssistantTeamObservation(observation: AssistantTeamObservation): AssistantTeamMapping {
  if (!observation || typeof observation !== 'object' || !isKnownSignal(observation.signal)) {
    const dropped =
      observation && typeof observation === 'object' ? collectDroppedFields(observation) : [];
    return emptyMapping(dropped, ['unknown_signal']);
  }

  switch (observation.signal) {
    case 'invoke_agent':
      return mapInvoke(observation);
    case 'execute_tool':
      return mapTool(observation);
    case 'inference':
      return mapInference(observation);
    case 'mcp':
      return mapMcp(observation);
    default: {
      const unreachable: never = observation;
      return emptyMapping(collectDroppedFields(unreachable), ['unknown_signal']);
    }
  }
}

export function mapLocalAiActivityEvent(event: LocalAiActivityLike): AssistantTeamMapping {
  const droppedFields: string[] = [];
  if (event.summary !== undefined) droppedFields.push('summary');
  if (event.detail !== undefined) droppedFields.push('detail');
  return emptyMapping(droppedFields, ['local_ai_activity_not_gen_ai']);
}
