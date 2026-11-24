import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  hmacLocalId,
  mapAssistantTeamObservation,
  mapLocalAiActivityEvent,
} from './map-assistant-team';
import {
  GEN_AI_CONTENT_CAPTURE_MODE,
  GEN_AI_SEMCONV_SCHEMA_URL,
  GEN_AI_SEMCONV_SCHEMA_VERSION,
  GEN_AI_SHORT_DURATION_BUCKETS,
  INFERENCE_OPERATION_TOKEN_BUCKETS,
  INVOKE_AGENT_DURATION_BUCKETS,
  RETIRED_GEN_AI_SIGNAL_NAMES,
} from './schema';

const SECRET_PROMPT = 'canary-prompt-do-not-emit-9f3a';
const SECRET_TOKEN = 'canary-bearer-token-do-not-emit';
const CLIENT_NAME = 'canary-client-hostname.example';

function attributeKeys(mapping: ReturnType<typeof mapAssistantTeamObservation>): string[] {
  return [
    ...mapping.spans.flatMap((span) => Object.keys(span.attributes)),
    ...mapping.metrics.flatMap((metric) => Object.keys(metric.attributes)),
  ];
}

function metricNames(mapping: ReturnType<typeof mapAssistantTeamObservation>): string[] {
  return mapping.metrics.map((metric) => metric.name);
}

describe('gen_ai semconv 0.1.0 assistant-team mapping', () => {
  it('pins the schema version and keeps content capture off', () => {
    expect(GEN_AI_SEMCONV_SCHEMA_VERSION).toBe('gen_ai semconv 0.1.0');
    expect(GEN_AI_SEMCONV_SCHEMA_URL).toBe('https://opentelemetry.io/schemas/semconv-genai-dev/0.1.0-dev');
    expect(GEN_AI_CONTENT_CAPTURE_MODE).toBe('NO_CONTENT');

    const mapping = mapAssistantTeamObservation({
      signal: 'invoke_agent',
      controlFlow: 'agent',
      agentName: 'Scout',
    });

    expect(mapping.schemaVersion).toBe(GEN_AI_SEMCONV_SCHEMA_VERSION);
    expect(mapping.schemaUrl).toBe(GEN_AI_SEMCONV_SCHEMA_URL);
    expect(mapping.contentCapture).toBe('NO_CONTENT');
    expect(mapping.spans.every((span) => span.schemaVersion === GEN_AI_SEMCONV_SCHEMA_VERSION)).toBe(true);
    expect(mapping.metrics.every((metric) => metric.schemaVersion === GEN_AI_SEMCONV_SCHEMA_VERSION)).toBe(true);
  });

  it('names an in-process agent span invoke_agent and requires the operation name', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'invoke_agent',
      controlFlow: 'agent',
      agentName: 'Scout',
      durationSeconds: 1.25,
      conversationId: '11111111-2222-4333-8444-555555555555',
    });

    expect(mapping.spans).toEqual([
      expect.objectContaining({
        name: 'invoke_agent Scout',
        kind: 'INTERNAL',
        registryType: 'gen_ai.invoke_agent.internal',
        statusCode: 'UNSET',
        attributes: {
          'gen_ai.operation.name': 'invoke_agent',
          'gen_ai.agent.name': 'Scout',
          'gen_ai.conversation.id': '11111111-2222-4333-8444-555555555555',
        },
      }),
    ]);
    expect(mapping.metrics).toEqual([
      expect.objectContaining({
        name: 'gen_ai.invoke_agent.duration',
        instrument: 'histogram',
        unit: 's',
        value: 1.25,
        explicitBucketBoundaries: INVOKE_AGENT_DURATION_BUCKETS,
        attributes: {
          'gen_ai.operation.name': 'invoke_agent',
          'gen_ai.agent.name': 'Scout',
        },
      }),
    ]);
    expect(mapping.spans[0]?.attributes).not.toHaveProperty('gen_ai.provider.name');
    expect(mapping.spans[0]?.attributes).not.toHaveProperty('gen_ai.agent.id');
  });

  it('folds invoke_workflow into the invoke_agent span and duration metric', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'invoke_agent',
      controlFlow: 'workflow',
      agentName: 'recipe_runner',
      durationSeconds: 3,
    });

    expect(mapping.spans[0]).toEqual(
      expect.objectContaining({
        name: 'invoke_workflow recipe_runner',
        registryType: 'gen_ai.invoke_agent.internal',
        kind: 'INTERNAL',
        attributes: {
          'gen_ai.operation.name': 'invoke_workflow',
          'gen_ai.agent.name': 'recipe_runner',
        },
      })
    );
    expect(metricNames(mapping)).toEqual(['gen_ai.invoke_agent.duration']);
    expect(mapping.metrics[0]?.attributes['gen_ai.operation.name']).toBe('invoke_workflow');
    expect(attributeKeys(mapping)).not.toContain('gen_ai.workflow.name');
  });

  it('keeps prompts, tool results, and server addresses off every operation', () => {
    const prompt = 'PROMPT-CANARY-inference-messages';
    const result = 'TOOL-RESULT-CANARY-mcp';
    const address = '10.1.2.80';

    const inference = mapAssistantTeamObservation({
      signal: 'inference',
      operationName: 'chat',
      providerName: 'openai',
      requestModel: 'gpt-4',
      inputMessages: [{ role: 'user', content: prompt }],
      serverAddress: address,
    });
    expect(inference.spans[0]?.attributes).not.toHaveProperty('gen_ai.input.messages');
    expect(inference.spans[0]?.attributes).not.toHaveProperty('server.address');
    expect(JSON.stringify(inference)).not.toContain(prompt);
    expect(JSON.stringify(inference)).not.toContain(address);

    const tool = mapAssistantTeamObservation({
      signal: 'execute_tool',
      toolName: 'read_file',
      toolResult: { body: result },
      serverAddress: address,
    });
    expect(tool.spans[0]?.attributes).not.toHaveProperty('gen_ai.tool.call.result');
    expect(tool.spans[0]?.attributes).not.toHaveProperty('server.address');
    expect(JSON.stringify(tool)).not.toContain(result);

    for (const role of ['client', 'server'] as const) {
      const mcp = mapAssistantTeamObservation({
        signal: 'mcp',
        role,
        methodName: 'tools/call',
        toolName: 'read_file',
        toolResult: { body: result },
        inputMessages: [{ content: prompt }],
        serverAddress: address,
      });
      expect(mcp.spans[0]?.attributes).not.toHaveProperty('gen_ai.tool.call.result');
      expect(mcp.spans[0]?.attributes).not.toHaveProperty('gen_ai.input.messages');
      expect(mcp.spans[0]?.attributes).not.toHaveProperty('server.address');
      expect(JSON.stringify(mcp)).not.toContain(result);
      expect(JSON.stringify(mcp)).not.toContain(prompt);
      expect(JSON.stringify(mcp)).not.toContain(address);
    }
  });

  it('rejects extra token prefixes, desktop hosts, and joined client names', () => {
    const prefixes = [
      'sk_live_',
      'rk_live_',
      'glpat-',
      'npm_',
      'AIza',
      'hf_',
      'xoxe-',
      'xoxs-',
      'ghs_',
      'ghu_',
      'bearer-',
      'GITHUB_PAT_',
    ];
    const desktop = 'DESKTOP-ZZ9YY8X';
    const joined = 'Harbor-Office1';
    const samples = [
      ...prefixes.map((prefix) =>
        prefix.endsWith('-') || prefix.endsWith('_') ? `${prefix}sample1` : `${prefix}_sample1`
      ),
      desktop,
      joined,
    ];

    for (const sample of samples) {
      const agent = mapAssistantTeamObservation({
        signal: 'invoke_agent',
        controlFlow: 'agent',
        agentName: sample,
        conversationId: sample,
      });
      const tool = mapAssistantTeamObservation({
        signal: 'execute_tool',
        toolName: 'read_file',
        toolCallId: sample,
        agentName: 'Scout',
      });
      const mcp = mapAssistantTeamObservation({
        signal: 'mcp',
        role: 'client',
        methodName: 'tools/call',
        requestId: sample,
      });
      for (const mapping of [agent, tool, mcp]) {
        expect(JSON.stringify(mapping)).not.toContain(sample);
      }
      expect(agent.spans[0]?.attributes).not.toHaveProperty('gen_ai.agent.name');
      expect(agent.spans[0]?.attributes).not.toHaveProperty('gen_ai.conversation.id');
      expect(tool.spans[0]?.attributes).not.toHaveProperty('gen_ai.tool.call.id');
      expect(mcp.spans[0]?.attributes).not.toHaveProperty('jsonrpc.request.id');
    }

    const longCode = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'tools/call',
      jsonRpcErrorCode: 123456789012,
    } as never);
    expect(JSON.stringify(longCode)).not.toContain('123456789012');
    expect(longCode.spans[0]?.attributes).not.toHaveProperty('rpc.status_code');
  });

  it('rejects exponent-form numeric codes', () => {
    for (const jsonRpcErrorCode of [1e21, '1e+21'] as const) {
      const mapping = mapAssistantTeamObservation({
        signal: 'mcp',
        role: 'client',
        methodName: 'initialize',
        jsonRpcErrorCode,
      } as never);
      expect(mapping.spans[0]?.statusCode).toBe('ERROR');
      expect(mapping.spans[0]?.attributes['error.type']).toBe('_OTHER');
      expect(mapping.spans[0]?.attributes).not.toHaveProperty('rpc.status_code');
      expect(JSON.stringify(mapping)).not.toContain('1e+21');
      expect(JSON.stringify(mapping)).not.toContain('1e21');
    }
  });

  it('rejects bearer with no separator', () => {
    for (const sample of ['BearerToken_1', 'BearerX']) {
      const mapping = mapAssistantTeamObservation({
        signal: 'invoke_agent',
        controlFlow: 'agent',
        agentName: 'Scout',
        conversationId: sample,
      });
      expect(mapping.omissions).toContain('secret_id_rejected');
      expect(JSON.stringify(mapping)).not.toContain(sample);
    }
  });

  it('rejects bearer with any separator regardless of case', () => {
    for (const sample of ['Bearer_x', 'bearer-x', 'BEARER x', 'Bearer_x1', 'bearer-x1']) {
      const mapping = mapAssistantTeamObservation({
        signal: 'invoke_agent',
        controlFlow: 'agent',
        agentName: 'Scout',
        conversationId: sample,
      });
      expect(JSON.stringify(mapping)).not.toContain(sample);
      expect(mapping.spans[0]?.attributes).not.toHaveProperty('gen_ai.conversation.id');
    }
  });

  it.each(['sk-', 'sk-proj-', 'sk-ant-'])('rejects %s on ids, models, and names', (prefix) => {
    const sample = `${prefix}sample1`;
    const conversation = mapAssistantTeamObservation({
      signal: 'invoke_agent',
      controlFlow: 'agent',
      agentName: sample,
      conversationId: sample,
    });
    const tool = mapAssistantTeamObservation({
      signal: 'execute_tool',
      toolName: sample,
      toolCallId: sample,
    });
    const request = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'tools/call',
      toolName: 'read_file',
      requestId: sample,
    });
    const model = mapAssistantTeamObservation({
      signal: 'inference',
      operationName: 'chat',
      providerName: 'openai',
      requestModel: sample,
    });
    for (const mapping of [conversation, tool, request, model]) {
      expect(JSON.stringify(mapping)).not.toContain(sample);
    }
    expect(conversation.spans[0]?.attributes).not.toHaveProperty('gen_ai.conversation.id');
    expect(conversation.spans[0]?.attributes).not.toHaveProperty('gen_ai.agent.name');
    expect(tool.spans).toEqual([]);
    expect(request.spans[0]?.attributes).not.toHaveProperty('jsonrpc.request.id');
    expect(model.spans[0]?.attributes['gen_ai.request.model']).toBe('_OTHER');
  });

  it('accepts only uuid, ulid, provider, and hmac ids', () => {
    const uuid = '11111111-2222-4333-8444-555555555555';
    const ulid = '01HZXK4Q2N8Y7C6B5A4D3E2F1G';
    const provider = 'chatcmpl-Abcd1234Wxyz5678';
    const hmac = hmacLocalId('maple-unit-4');
    const kept = mapAssistantTeamObservation({
      signal: 'invoke_agent',
      controlFlow: 'agent',
      agentName: 'Scout',
      conversationId: uuid,
    });
    expect(kept.spans[0]?.attributes['gen_ai.conversation.id']).toBe(uuid);

    const tool = mapAssistantTeamObservation({
      signal: 'execute_tool',
      toolName: 'read_file',
      toolCallId: provider,
    });
    expect(tool.spans[0]?.attributes['gen_ai.tool.call.id']).toBe(provider);

    const request = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'initialize',
      requestId: hmac,
    });
    expect(request.spans[0]?.attributes['jsonrpc.request.id']).toBe(hmac);
    expect(JSON.stringify(request)).not.toContain('maple-unit-4');

    const ulidSpan = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'initialize',
      requestId: ulid,
    });
    expect(ulidSpan.spans[0]?.attributes['jsonrpc.request.id']).toBe(ulid);

    for (const sample of ['req-maple-1', 'call_short', 'conv_text_3', 'session-token']) {
      const dropped = mapAssistantTeamObservation({
        signal: 'invoke_agent',
        controlFlow: 'agent',
        agentName: 'Scout',
        conversationId: sample,
      });
      expect(dropped.spans[0]?.attributes).not.toHaveProperty('gen_ai.conversation.id');
      expect(JSON.stringify(dropped)).not.toContain(sample);
    }
  });

  it('replaces unlisted model ids with _OTHER', () => {
    const listed = ['gpt-4o-mini', 'claude-sonnet-4-5', 'Qwen2.5-7B-Instruct', 'Mistral-Large-2', 'nomic-embed-text:latest'];
    for (const requestModel of listed) {
      const mapping = mapAssistantTeamObservation({
        signal: 'inference',
        operationName: 'chat',
        providerName: 'openai',
        requestModel,
        inputTokens: 2,
        outputTokens: 1,
      });
      expect(mapping.spans[0]?.attributes['gen_ai.request.model']).toBe(requestModel);
      expect(mapping.spans[0]?.name).toBe(`chat ${requestModel}`);
      expect(mapping.metrics[0]?.attributes['gen_ai.request.model']).toBe(requestModel);
    }

    const blocked = [
      'sk-proj-syntheticunit01',
      'TWluaUJhc2U2NFNhbXBsZTE',
      '1020304050607080',
      'CACHEBOX02',
      'PineconeDesk7',
      'gpt-4-extra9',
    ];
    for (const requestModel of blocked) {
      const mapping = mapAssistantTeamObservation({
        signal: 'inference',
        operationName: 'chat',
        providerName: 'openai',
        requestModel,
        responseModel: requestModel,
        inputTokens: 2,
        outputTokens: 1,
        durationSeconds: 0.2,
      });
      expect(mapping.spans[0]?.name).toBe('chat _OTHER');
      expect(mapping.spans[0]?.attributes['gen_ai.request.model']).toBe('_OTHER');
      expect(mapping.spans[0]?.attributes['gen_ai.response.model']).toBe('_OTHER');
      for (const metric of mapping.metrics) {
        if ('gen_ai.request.model' in metric.attributes) {
          expect(metric.attributes['gen_ai.request.model']).toBe('_OTHER');
        }
        if ('gen_ai.response.model' in metric.attributes) {
          expect(metric.attributes['gen_ai.response.model']).toBe('_OTHER');
        }
      }
      expect(JSON.stringify(mapping)).not.toContain(requestModel);
    }
  });

  it('allowlists agent, tool, and model names', () => {
    const models = mapAssistantTeamObservation({
      signal: 'inference',
      operationName: 'chat',
      providerName: 'openai',
      requestModel: 'Qwen2.5-7B-Instruct',
      responseModel: 'Mistral-Large-2',
    });
    expect(models.spans[0]?.name).toBe('chat Qwen2.5-7B-Instruct');
    expect(models.spans[0]?.attributes['gen_ai.request.model']).toBe('Qwen2.5-7B-Instruct');
    expect(models.spans[0]?.attributes['gen_ai.response.model']).toBe('Mistral-Large-2');

    const blocked = ['shelf-04', 'notebook-q', 'maple-grove', 'ghr_sample1', 'sk_test_sample1', 'ya29.sample1'];
    for (const sample of blocked) {
      const agent = mapAssistantTeamObservation({
        signal: 'invoke_agent',
        controlFlow: 'agent',
        agentName: sample,
        conversationId: sample,
      });
      const inference = mapAssistantTeamObservation({
        signal: 'inference',
        operationName: 'chat',
        providerName: 'openai',
        requestModel: sample,
      });
      expect(JSON.stringify(agent)).not.toContain(sample);
      expect(JSON.stringify(inference)).not.toContain(sample);
      expect(agent.spans[0]?.attributes).not.toHaveProperty('gen_ai.agent.name');
    }
  });

  it('drops ipv4 addresses and hostnames used as agent or tool names', () => {
    const ipv4 = mapAssistantTeamObservation({
      signal: 'invoke_agent',
      controlFlow: 'agent',
      agentName: '192.0.2.44',
    });
    expect(ipv4.spans[0]?.name).toBe('invoke_agent');
    expect(ipv4.spans[0]?.attributes).not.toHaveProperty('gen_ai.agent.name');
    expect(JSON.stringify(ipv4)).not.toContain('192.0.2.44');

    const host = mapAssistantTeamObservation({
      signal: 'execute_tool',
      toolName: 'canary.example.com',
    });
    expect(host.spans).toEqual([]);
    expect(host.omissions).toContain('tool_name_required');
    expect(JSON.stringify(host)).not.toContain('canary.example.com');

    const spaced = mapAssistantTeamObservation({
      signal: 'invoke_agent',
      controlFlow: 'agent',
      agentName: 'Northwind Practice',
    });
    expect(spaced.spans[0]?.attributes).not.toHaveProperty('gen_ai.agent.name');
    expect(JSON.stringify(spaced)).not.toContain('Northwind Practice');
  });

  it('omits the agent name from the span name when none is available', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'invoke_agent',
      controlFlow: 'agent',
    });

    expect(mapping.spans[0]?.name).toBe('invoke_agent');
    expect(mapping.spans[0]?.attributes).toEqual({
      'gen_ai.operation.name': 'invoke_agent',
    });
  });

  it('names execute_tool spans with the tool name and required attributes', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'execute_tool',
      toolName: 'read_file',
      toolCallId: 'call_Abcd1234Wxyz5678',
      agentName: 'Scout',
      durationSeconds: 0.4,
      toolArguments: { path: SECRET_PROMPT },
      toolResult: { body: SECRET_PROMPT },
    });

    expect(mapping.spans[0]).toEqual(
      expect.objectContaining({
        name: 'execute_tool read_file',
        kind: 'INTERNAL',
        registryType: 'gen_ai.execute_tool',
        statusCode: 'UNSET',
        attributes: {
          'gen_ai.operation.name': 'execute_tool',
          'gen_ai.tool.name': 'read_file',
          'gen_ai.tool.call.id': 'call_Abcd1234Wxyz5678',
          'gen_ai.agent.name': 'Scout',
        },
      })
    );
    expect(mapping.metrics[0]).toEqual(
      expect.objectContaining({
        name: 'gen_ai.execute_tool.duration',
        instrument: 'histogram',
        unit: 's',
        value: 0.4,
        attributes: {
          'gen_ai.tool.name': 'read_file',
          'gen_ai.agent.name': 'Scout',
        },
      })
    );
    expect(mapping.metrics[0]?.attributes).not.toHaveProperty('gen_ai.operation.name');
    expect(JSON.stringify(mapping)).not.toContain(SECRET_PROMPT);
    expect(mapping.droppedFields).toEqual(expect.arrayContaining(['toolArguments', 'toolResult']));
    expect(attributeKeys(mapping)).not.toContain('gen_ai.tool.call.arguments');
    expect(attributeKeys(mapping)).not.toContain('gen_ai.tool.call.result');
  });

  it('records failing tool duration with error.type and the spec buckets', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'execute_tool',
      toolName: 'read_file',
      durationSeconds: 1.5,
      errorType: 'timeout',
    });
    expect(mapping.metrics[0]).toEqual(
      expect.objectContaining({
        name: 'gen_ai.execute_tool.duration',
        explicitBucketBoundaries: GEN_AI_SHORT_DURATION_BUCKETS,
        attributes: {
          'gen_ai.tool.name': 'read_file',
          'error.type': 'timeout',
        },
      })
    );

    const inference = mapAssistantTeamObservation({
      signal: 'inference',
      operationName: 'chat',
      providerName: 'openai',
      requestModel: 'gpt-4',
      durationSeconds: 0.5,
      inputTokens: 1,
      outputTokens: 1,
    });
    const duration = inference.metrics.find((metric) => metric.name === 'gen_ai.client.inference.duration');
    expect(duration?.explicitBucketBoundaries).toEqual(GEN_AI_SHORT_DURATION_BUCKETS);
  });

  it('omits gen_ai.tool.call.id when the provider did not supply one', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'execute_tool',
      toolName: 'read_file',
    });

    expect(mapping.spans[0]?.attributes).not.toHaveProperty('gen_ai.tool.call.id');
  });

  it('records inference token histograms, including zero when usage is missing', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'inference',
      operationName: 'chat',
      providerName: 'ollama',
      requestModel: 'llama3.2:3b',
      responseModel: 'llama3.2:3b',
      inputTokens: null,
      outputTokens: 12,
      errorType: 'timeout',
      cacheWriteInputTokens: 4,
    });

    const histograms = mapping.metrics.filter((metric) => metric.instrument === 'histogram');
    expect(histograms.map((metric) => [metric.name, metric.value])).toEqual([
      ['gen_ai.client.inference.operation.input_tokens', 0],
      ['gen_ai.client.inference.operation.output_tokens', 12],
    ]);
    for (const histogram of histograms) {
      expect(histogram.unit).toBe('{token}');
      expect(histogram.explicitBucketBoundaries).toEqual(INFERENCE_OPERATION_TOKEN_BUCKETS);
      expect(histogram.attributes).toMatchObject({
        'gen_ai.operation.name': 'chat',
        'gen_ai.provider.name': 'ollama',
        'gen_ai.request.model': 'llama3.2:3b',
        'gen_ai.response.model': 'llama3.2:3b',
        'error.type': 'timeout',
      });
      expect(histogram.attributes).not.toHaveProperty('gen_ai.token.type');
      expect(histogram.attributes).not.toHaveProperty('server.address');
    }

    expect(metricNames(mapping)).not.toContain('gen_ai.client.token.usage');
    expect(mapping.metrics.filter((metric) => metric.instrument === 'counter').map((metric) => metric.name)).toEqual([
      'gen_ai.client.inference.usage.output_tokens',
      'gen_ai.client.inference.usage.cache_write.input_tokens',
    ]);
    const outputCounter = mapping.metrics.find(
      (metric) => metric.name === 'gen_ai.client.inference.usage.output_tokens'
    );
    expect(outputCounter).toEqual(
      expect.objectContaining({
        instrument: 'counter',
        unit: '{token}',
        value: 12,
        attributes: expect.objectContaining({
          'gen_ai.token.modality': 'unknown',
          'gen_ai.provider.name': 'ollama',
          'gen_ai.operation.name': 'chat',
        }),
      })
    );
    expect(outputCounter?.attributes).not.toHaveProperty('gen_ai.token.type');

    expect(mapping.spans[0]).toEqual(
      expect.objectContaining({
        name: 'chat llama3.2:3b',
        kind: 'CLIENT',
        registryType: 'gen_ai.client.inference',
        statusCode: 'ERROR',
        attributes: expect.objectContaining({
          'gen_ai.operation.name': 'chat',
          'gen_ai.provider.name': 'ollama',
          'gen_ai.request.model': 'llama3.2:3b',
          'error.type': 'timeout',
          'gen_ai.usage.output_tokens': 12,
        }),
      })
    );
    expect(mapping.spans[0]?.attributes).not.toHaveProperty('gen_ai.usage.input_tokens');
  });

  it('counts positive reasoning tokens without gen_ai.token.modality', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'inference',
      operationName: 'chat',
      providerName: 'openai',
      requestModel: 'gpt-4',
      inputTokens: 5,
      outputTokens: 7,
      reasoningOutputTokens: 3,
    });

    const reasoning = mapping.metrics.find(
      (metric) => metric.name === 'gen_ai.client.inference.usage.reasoning.output_tokens'
    );
    expect(reasoning).toEqual(
      expect.objectContaining({
        instrument: 'counter',
        unit: '{token}',
        value: 3,
      })
    );
    expect(reasoning?.attributes).not.toHaveProperty('gen_ai.token.modality');
    expect(reasoning?.attributes['gen_ai.operation.name']).toBe('chat');
    expect(reasoning?.attributes['gen_ai.provider.name']).toBe('openai');
  });

  it('renames the retired mistral_ai provider value and does not emit it', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'inference',
      operationName: 'chat',
      providerName: 'mistral_ai',
      requestModel: 'mistral-small',
      inputTokens: 3,
      outputTokens: 1,
    });

    expect(mapping.spans[0]?.attributes['gen_ai.provider.name']).toBe('mistral');
    expect(JSON.stringify(mapping)).not.toContain('mistral_ai');
  });

  it('does not invent a provider when the inference observation has none', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'inference',
      operationName: 'chat',
      providerName: '',
      inputTokens: 8,
      outputTokens: 2,
    });

    expect(mapping.spans).toEqual([]);
    expect(mapping.metrics).toEqual([]);
    expect(mapping.omissions).toContain('inference_provider_required');
  });

  it('records a client MCP JSON-RPC error on rpc.status_code', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'tools/call',
      toolName: 'read_file',
      requestId: '01HZXK4Q2N8Y7C6B5A4D3E2F1G',
      jsonRpcErrorCode: -32602,
      jsonRpcMessage: SECRET_PROMPT,
    });

    expect(mapping.spans[0]).toEqual(
      expect.objectContaining({
        name: 'tools/call read_file',
        kind: 'CLIENT',
        registryType: 'mcp.client',
        statusCode: 'ERROR',
        attributes: {
          'mcp.method.name': 'tools/call',
          'gen_ai.tool.name': 'read_file',
          'gen_ai.operation.name': 'execute_tool',
          'jsonrpc.request.id': '01HZXK4Q2N8Y7C6B5A4D3E2F1G',
          'rpc.status_code': '-32602',
          'error.type': '-32602',
        },
      })
    );
    expect(attributeKeys(mapping)).not.toContain('rpc.response.status_code');
    expect(JSON.stringify(mapping)).not.toContain(SECRET_PROMPT);
    expect(mapping.droppedFields).toContain('jsonRpcMessage');
  });

  it.each([-32700, -32600, -32601, -32602, -32002])(
    'records server caller fault %s without failing the span',
    (code) => {
      const server = mapAssistantTeamObservation({
        signal: 'mcp',
        role: 'server',
        methodName: 'tools/call',
        toolName: 'read_file',
        jsonRpcErrorCode: code,
      });
      expect(server.spans[0]?.statusCode).toBe('UNSET');
      expect(server.spans[0]?.attributes['rpc.status_code']).toBe(String(code));
      expect(server.spans[0]?.attributes).not.toHaveProperty('error.type');

      const client = mapAssistantTeamObservation({
        signal: 'mcp',
        role: 'client',
        methodName: 'tools/call',
        toolName: 'read_file',
        jsonRpcErrorCode: code,
      });
      expect(client.spans[0]?.statusCode).toBe('ERROR');
      expect(client.spans[0]?.attributes['error.type']).toBe(String(code));
    }
  );

  it('keeps server-side caller faults on rpc.status_code without marking the span failed', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'server',
      methodName: 'tools/call',
      toolName: 'read_file',
      jsonRpcErrorCode: -32602,
    });

    expect(mapping.spans[0]).toEqual(
      expect.objectContaining({
        kind: 'SERVER',
        registryType: 'mcp.server',
        statusCode: 'UNSET',
        attributes: expect.objectContaining({
          'mcp.method.name': 'tools/call',
          'rpc.status_code': '-32602',
        }),
      })
    );
    expect(mapping.spans[0]?.attributes).not.toHaveProperty('error.type');
  });

  it('marks other server JSON-RPC codes as errors and still uses rpc.status_code', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'server',
      methodName: 'tools/call',
      jsonRpcErrorCode: -32603,
    });

    expect(mapping.spans[0]?.statusCode).toBe('ERROR');
    expect(mapping.spans[0]?.attributes['rpc.status_code']).toBe('-32603');
    expect(mapping.spans[0]?.attributes['error.type']).toBe('-32603');
    expect(mapping.spans[0]?.name).toBe('tools/call');
  });

  it('trims numeric codes and fails closed on mixed code text', () => {
    const trimmed = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'tools/call',
      jsonRpcErrorCode: ' -32000',
    } as never);
    expect(trimmed.spans[0]?.statusCode).toBe('ERROR');
    expect(trimmed.spans[0]?.attributes['rpc.status_code']).toBe('-32000');
    expect(trimmed.spans[0]?.attributes['error.type']).toBe('-32000');

    const mixed = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'initialize',
      httpStatus: '500 note',
    } as never);
    expect(mixed.spans[0]?.statusCode).toBe('ERROR');
    expect(mixed.spans[0]?.attributes['error.type']).toBe('_OTHER');
    expect(mixed.spans[0]?.attributes).not.toHaveProperty('rpc.status_code');
    expect(JSON.stringify(mixed)).not.toContain('500 note');
  });

  it('keeps HTTP 100-399 as success, including numeric strings', () => {
    for (const httpStatus of [200, 204, 302, 399, '200'] as const) {
      const mapping = mapAssistantTeamObservation({
        signal: 'mcp',
        role: 'client',
        methodName: 'initialize',
        httpStatus,
      } as never);
      expect(mapping.spans[0]?.statusCode).toBe('UNSET');
      expect(mapping.spans[0]?.attributes).not.toHaveProperty('error.type');
    }

    const callerFault = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'server',
      methodName: 'tools/call',
      toolName: 'read_file',
      jsonRpcErrorCode: -32602,
      httpStatus: 200,
    });
    expect(callerFault.spans[0]?.statusCode).toBe('UNSET');
    expect(callerFault.spans[0]?.attributes['rpc.status_code']).toBe('-32602');
    expect(callerFault.spans[0]?.attributes).not.toHaveProperty('error.type');
  });

  it('records out-of-range numeric codes as _OTHER', () => {
    const rpc = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'initialize',
      jsonRpcErrorCode: 123456789012,
    } as never);
    expect(rpc.spans[0]?.statusCode).toBe('ERROR');
    expect(rpc.spans[0]?.attributes['error.type']).toBe('_OTHER');
    expect(rpc.spans[0]?.attributes).not.toHaveProperty('rpc.status_code');
    expect(JSON.stringify(rpc)).not.toContain('123456789012');

    const http = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'initialize',
      httpStatus: 600,
    });
    expect(http.spans[0]?.statusCode).toBe('ERROR');
    expect(http.spans[0]?.attributes['error.type']).toBe('_OTHER');
    expect(JSON.stringify(http)).not.toContain('600');
  });

  it('coerces pure integer strings into mcp error codes', () => {
    const client = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'tools/call',
      jsonRpcErrorCode: '-32000',
    } as never);
    expect(client.spans[0]?.statusCode).toBe('ERROR');
    expect(client.spans[0]?.attributes['rpc.status_code']).toBe('-32000');
    expect(client.spans[0]?.attributes['error.type']).toBe('-32000');

    const http = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'initialize',
      httpStatus: '500',
    } as never);
    expect(http.spans[0]?.statusCode).toBe('ERROR');
    expect(http.spans[0]?.attributes['error.type']).toBe('500');
    expect(http.spans[0]?.attributes).not.toHaveProperty('rpc.status_code');

    const dirty = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'tools/call',
      jsonRpcErrorCode: '-32000 body=MSG-CANARY',
      httpStatus: '500 body',
    } as never);
    expect(dirty.spans[0]?.attributes).not.toHaveProperty('rpc.status_code');
    expect(dirty.spans[0]?.attributes['error.type']).not.toBe('500 body');
    expect(JSON.stringify(dirty)).not.toContain('MSG-CANARY');
  });

  it('records an HTTP failure without a JSON-RPC code on error.type only', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'initialize',
      httpStatus: 502,
      serverAddress: '10.1.2.80',
      hostname: CLIENT_NAME,
    });

    expect(mapping.spans[0]?.statusCode).toBe('ERROR');
    expect(mapping.spans[0]?.attributes['error.type']).toBe('502');
    expect(mapping.spans[0]?.attributes).not.toHaveProperty('rpc.status_code');
    expect(attributeKeys(mapping)).not.toContain('server.address');
    expect(attributeKeys(mapping)).not.toContain('client.address');
    expect(JSON.stringify(mapping)).not.toContain('10.1.2.80');
    expect(JSON.stringify(mapping)).not.toContain(CLIENT_NAME);
  });

  it('drops prompts, secrets, client names, and host data even when supplied', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'invoke_agent',
      controlFlow: 'agent',
      agentName: 'Scout',
      inputMessages: [{ role: 'user', content: SECRET_PROMPT }],
      outputMessages: [{ role: 'assistant', content: SECRET_PROMPT }],
      systemInstructions: SECRET_PROMPT,
      secret: SECRET_TOKEN,
      apiToken: SECRET_TOKEN,
      clientName: CLIENT_NAME,
      clientAddress: '203.0.113.10',
      hostname: 'workstation.local',
      serverAddress: 'https://llm.internal',
    });

    const serialized = JSON.stringify(mapping);
    expect(serialized).not.toContain(SECRET_PROMPT);
    expect(serialized).not.toContain(SECRET_TOKEN);
    expect(serialized).not.toContain(CLIENT_NAME);
    expect(serialized).not.toContain('203.0.113.10');
    expect(serialized).not.toContain('workstation.local');
    expect(serialized).not.toContain('llm.internal');
    expect(mapping.droppedFields).toEqual(
      expect.arrayContaining([
        'inputMessages',
        'outputMessages',
        'systemInstructions',
        'secret',
        'apiToken',
        'clientName',
        'clientAddress',
        'hostname',
        'serverAddress',
      ])
    );
    expect(mapping.contentCapture).toBe('NO_CONTENT');
  });

  it('does not emit retired v0.1.0 signal names', () => {
    const mapping = mapAssistantTeamObservation({
      signal: 'inference',
      operationName: 'chat',
      providerName: 'openai',
      requestModel: 'gpt-4',
      inputTokens: 10,
      outputTokens: 2,
      cacheWriteInputTokens: 1,
    });

    const names = [...attributeKeys(mapping), ...metricNames(mapping)];
    for (const retired of RETIRED_GEN_AI_SIGNAL_NAMES) {
      expect(names).not.toContain(retired);
    }
  });

  it('locks jwt names, lowercase desktop hosts, and string status caps', () => {
    const jwtName = 'eyJhbGciOiJIUzI1NiJ9_x01';
    const jwt = mapAssistantTeamObservation({
      signal: 'invoke_agent',
      controlFlow: 'agent',
      agentName: 'Scout',
      conversationId: jwtName,
    });
    const jwtModel = mapAssistantTeamObservation({
      signal: 'inference',
      operationName: 'chat',
      providerName: 'openai',
      requestModel: jwtName,
    });
    expect(JSON.stringify(jwt)).not.toContain(jwtName);
    expect(JSON.stringify(jwtModel)).not.toContain(jwtName);
    expect(jwt.spans[0]?.attributes).not.toHaveProperty('gen_ai.conversation.id');

    const desktop = 'desktop-k7m2q';
    const host = mapAssistantTeamObservation({
      signal: 'invoke_agent',
      controlFlow: 'agent',
      agentName: 'Scout',
      conversationId: desktop,
    });
    expect(JSON.stringify(host)).not.toContain(desktop);

    const longCode = '4111111111111111';
    const capped = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'initialize',
      jsonRpcErrorCode: longCode,
    } as never);
    expect(capped.spans[0]?.attributes['error.type']).toBe('_OTHER');
    expect(capped.spans[0]?.attributes).not.toHaveProperty('rpc.status_code');
    expect(JSON.stringify(capped)).not.toContain(longCode);

    const sixDigits = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'initialize',
      jsonRpcErrorCode: '100000',
    } as never);
    expect(sixDigits.spans[0]?.attributes['error.type']).toBe('_OTHER');
    expect(JSON.stringify(sixDigits)).not.toContain('100000');

    for (const httpStatus of ['600', '99']) {
      const status = mapAssistantTeamObservation({
        signal: 'mcp',
        role: 'client',
        methodName: 'initialize',
        httpStatus,
      } as never);
      expect(status.spans[0]?.statusCode).toBe('ERROR');
      expect(status.spans[0]?.attributes['error.type']).toBe('_OTHER');
      expect(JSON.stringify(status)).not.toContain(httpStatus);
    }

    const sentinel = 'CATCH-SENTINEL-2d';
    const hostile = { signal: 'invoke_agent' as const, controlFlow: 'agent' as const, message: sentinel };
    Object.defineProperty(hostile, 'agentName', {
      enumerable: true,
      get() {
        throw new Error('thrown-separately');
      },
    });
    const caught = mapAssistantTeamObservation(hostile as never);
    expect(caught.omissions).toEqual(['observation_unreadable']);
    expect(caught.droppedFields).toEqual([]);
    expect(JSON.stringify(caught)).not.toContain(sentinel);
    expect(JSON.stringify(caught)).not.toContain('thrown-separately');
  });

  it('hides a throwing local activity summary', () => {
    const leaked = 'ACTIVITY-SENTINEL-8b';
    const event = { id: 'evt-9', ts: '2026-11-24T00:00:00.000Z', kind: 'workflow' } as {
      id: string;
      ts: string;
      kind: 'workflow';
      summary?: string;
    };
    Object.defineProperty(event, 'summary', {
      enumerable: true,
      get() {
        throw new Error(leaked);
      },
    });
    const mapping = mapLocalAiActivityEvent(event);
    expect(mapping.spans).toEqual([]);
    expect(mapping.omissions).toContain('observation_unreadable');
    expect(JSON.stringify(mapping)).not.toContain(leaked);
  });

  it('leaves the local AI activity log unmapped and does not copy its text', () => {
    const mapping = mapLocalAiActivityEvent({
      id: 'evt-1',
      ts: '2026-11-23T17:00:00.000Z',
      kind: 'workflow',
      summary: SECRET_PROMPT,
      detail: 'action=accept; note=workstation.local',
    });

    expect(mapping.spans).toEqual([]);
    expect(mapping.metrics).toEqual([]);
    expect(mapping.schemaVersion).toBe(GEN_AI_SEMCONV_SCHEMA_VERSION);
    expect(mapping.omissions).toContain('local_ai_activity_not_gen_ai');
    expect(mapping.droppedFields).toEqual(expect.arrayContaining(['summary', 'detail']));
    expect(JSON.stringify(mapping)).not.toContain(SECRET_PROMPT);
    expect(JSON.stringify(mapping)).not.toContain('workstation.local');
  });

  it('locks the remaining redaction and http status checks', () => {
    const longError = '4111111111111111';
    const errorType = mapAssistantTeamObservation({
      signal: 'execute_tool',
      toolName: 'read_file',
      errorType: longError,
    });
    expect(errorType.spans[0]?.attributes['error.type']).toBe('_OTHER');
    expect(JSON.stringify(errorType)).not.toContain(longError);

    const accessKey = 'AKIAEXAMPLE_x01';
    const agent = mapAssistantTeamObservation({
      signal: 'invoke_agent',
      controlFlow: 'agent',
      agentName: accessKey,
    });
    expect(JSON.stringify(agent)).not.toContain(accessKey);

    const id = mapAssistantTeamObservation({
      signal: 'invoke_agent',
      controlFlow: 'agent',
      agentName: 'Scout',
      conversationId: 'a-b',
    });
    expect(id.spans[0]?.attributes).not.toHaveProperty('gen_ai.conversation.id');

    const model = mapAssistantTeamObservation({
      signal: 'inference',
      operationName: 'chat',
      providerName: 'openai',
      requestModel: 'model:extra:name',
    });
    expect(model.spans[0]?.attributes['gen_ai.request.model']).toBe('_OTHER');
    expect(model.spans[0]?.name).toBe('chat _OTHER');
    expect(JSON.stringify(model)).not.toContain('model:extra:name');

    const missing = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'initialize',
      httpStatus: 404,
    });
    expect(missing.spans[0]?.statusCode).toBe('ERROR');
    expect(missing.spans[0]?.attributes['error.type']).toBe('404');

    const dotted = mapAssistantTeamObservation({
      signal: 'invoke_agent',
      controlFlow: 'agent',
      agentName: 'build01.',
    });
    expect(dotted.spans[0]?.attributes).not.toHaveProperty('gen_ai.agent.name');
    expect(JSON.stringify(dotted)).not.toContain('build01.');
  });

  it('redacts a string jsonrpc request id', () => {
    const bad = 'session-token';
    const dropped = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'tools/call',
      toolName: 'read_file',
      requestId: bad,
    });
    expect(dropped.spans[0]?.name).toBe('tools/call read_file');
    expect(dropped.spans[0]?.attributes).not.toHaveProperty('jsonrpc.request.id');
    expect(JSON.stringify(dropped)).not.toContain(bad);

    const kept = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'client',
      methodName: 'tools/call',
      requestId: '01HZXK4Q2N8Y7C6B5A4D3E2F1G',
    });
    expect(kept.spans[0]?.attributes['jsonrpc.request.id']).toBe('01HZXK4Q2N8Y7C6B5A4D3E2F1G');
  });

  it('does not map an inherited signal', () => {
    const inherited = Object.create({ signal: 'execute_tool' }) as { toolName: string };
    inherited.toolName = 'read_file';
    const mapping = mapAssistantTeamObservation(inherited as never);
    expect(mapping.spans).toEqual([]);
    expect(mapping.metrics).toEqual([]);
    expect(mapping.omissions).toContain('unknown_signal');
  });

  it('hides messages thrown by getters and proxies', () => {
    const leaked = 'THROW-CANARY-9f3a';
    const hostile: { signal: 'invoke_agent'; controlFlow: 'agent' } = {
      signal: 'invoke_agent',
      controlFlow: 'agent',
    };
    Object.defineProperty(hostile, 'agentName', {
      enumerable: true,
      get() {
        throw new Error(leaked);
      },
    });
    const fromGetter = mapAssistantTeamObservation(hostile);
    expect(fromGetter.spans).toEqual([]);
    expect(fromGetter.omissions).toContain('observation_unreadable');
    expect(JSON.stringify(fromGetter)).not.toContain(leaked);

    const proxy = new Proxy(
      { signal: 'execute_tool' as const, toolName: 'read_file' },
      {
        getOwnPropertyDescriptor() {
          throw new Error(leaked);
        },
      }
    );
    const fromProxy = mapAssistantTeamObservation(proxy as never);
    expect(fromProxy.omissions).toContain('observation_unreadable');
    expect(JSON.stringify(fromProxy)).not.toContain(leaked);
  });

  it('does not throw when identifier fields are not strings', () => {
    const hostile = {
      get trim() {
        throw new Error('getter CANARY-TOKEN');
      },
    };
    const nonStrings = [42, { a: 1 }, null, ['a'], hostile, Symbol('s')];
    for (const toolName of nonStrings) {
      expect(() => mapAssistantTeamObservation({ signal: 'execute_tool', toolName } as never)).not.toThrow();
      const mapping = mapAssistantTeamObservation({ signal: 'execute_tool', toolName } as never);
      expect(mapping.omissions).toContain('tool_name_required');
      expect(JSON.stringify(mapping)).not.toContain('CANARY-TOKEN');
      expect(JSON.stringify(mapping)).not.toContain('LEAK');
    }

    expect(() =>
      mapAssistantTeamObservation({ signal: 'inference', operationName: 'chat', providerName: undefined } as never)
    ).not.toThrow();

    const inherited = Object.create({ errorType: `ghp_${'B'.repeat(20)}` }) as { signal: 'execute_tool'; toolName: string };
    inherited.signal = 'execute_tool';
    inherited.toolName = 'read_file';
    const polluted = mapAssistantTeamObservation(inherited as never);
    expect(polluted.spans[0]?.attributes).not.toHaveProperty('error.type');
    expect(JSON.stringify(polluted)).not.toContain('ghp_');
  });

  it('replaces free-text error.type with _OTHER', () => {
    const samples = [
      `ghp_${'A'.repeat(20)}`,
      'db.canary.internal',
      'fe80::1',
      'localhost',
      '10.0.0.5:5432',
      'Error:NorthwindPractice_private_note',
    ];
    for (const errorType of samples) {
      const mapping = mapAssistantTeamObservation({
        signal: 'execute_tool',
        toolName: 'read_file',
        durationSeconds: 0.2,
        errorType,
      });
      expect(mapping.spans[0]?.statusCode).toBe('ERROR');
      expect(mapping.spans[0]?.attributes['error.type']).toBe('_OTHER');
      expect(mapping.metrics[0]?.attributes['error.type']).toBe('_OTHER');
      expect(JSON.stringify(mapping)).not.toContain(errorType);
    }

    const allowed = mapAssistantTeamObservation({
      signal: 'execute_tool',
      toolName: 'read_file',
      errorType: 'timeout',
    });
    expect(allowed.spans[0]?.attributes['error.type']).toBe('timeout');
  });

  it('drops control flow, inference operation, and mcp role values outside the closed sets', () => {
    const prompt = 'PROMPT-CANARY-enum-please-summarise';
    const flow = mapAssistantTeamObservation({
      signal: 'invoke_agent',
      controlFlow: `please summarise client notes ${prompt}`,
    } as never);
    expect(flow.spans).toEqual([]);
    expect(flow.metrics).toEqual([]);
    expect(flow.omissions).toContain('control_flow_rejected');
    expect(JSON.stringify(flow)).not.toContain(prompt);

    const operation = mapAssistantTeamObservation({
      signal: 'inference',
      operationName: `chat ${prompt}${'x'.repeat(200)}`,
      providerName: 'openai',
    } as never);
    expect(operation.spans).toEqual([]);
    expect(operation.metrics).toEqual([]);
    expect(operation.omissions).toContain('inference_operation_rejected');
    expect(JSON.stringify(operation)).not.toContain(prompt);

    const role = mapAssistantTeamObservation({
      signal: 'mcp',
      role: 'CANARYROLE',
      methodName: 'tools/call',
      jsonRpcErrorCode: -32602,
    } as never);
    expect(role.spans).toEqual([]);
    expect(role.omissions).toContain('mcp_role_rejected');
    expect(JSON.stringify(role)).not.toContain('CANARYROLE');
  });

  it('does not return the raw input for an unknown signal', () => {
    const canary = 'PROMPT-CANARY-unknown-signal';
    const token = `ghp_${'A'.repeat(36)}`;
    const mapping = mapAssistantTeamObservation({
      signal: 'invoke_agent ',
      inputMessages: [{ content: canary }],
      apiToken: token,
    } as never);

    expect(mapping.schemaVersion).toBe(GEN_AI_SEMCONV_SCHEMA_VERSION);
    expect(mapping.contentCapture).toBe('NO_CONTENT');
    expect(mapping.spans).toEqual([]);
    expect(mapping.metrics).toEqual([]);
    expect(mapping.omissions).toContain('unknown_signal');
    expect(mapping.droppedFields).toEqual(expect.arrayContaining(['inputMessages', 'apiToken']));
    expect(JSON.stringify(mapping)).not.toContain(canary);
    expect(JSON.stringify(mapping)).not.toContain(token);
  });

  it('documents the privacy boundary as closed sets, not a blanket drop', () => {
    const note = fs.readFileSync(path.join(__dirname, '../../../../docs/GENAI_SEMCONV_0_1_0.md'), 'utf8');
    expect(note).toContain('https://opentelemetry.io/schemas/semconv-genai-dev/0.1.0-dev');
    expect(note).toContain('GEN_AI_SEMCONV_SCHEMA_VERSION');
    expect(note).toContain('`_OTHER`');
    expect(note).toContain('ASSISTANT_TEAM_AGENT_NAMES');
    expect(note).toContain('GEN_AI_MODEL_NAMES');
    expect(note).toContain('Mixed text is an error of type `_OTHER`');
    expect(note).not.toContain('Mixed text is ignored');
    expect(note).not.toContain('Secrets, API tokens, client names, IP addresses, and hostnames.');
    expect(note).not.toContain('Agent or tool names that are an IP address or a hostname.');
  });

  it('keeps synthetic canaries out of every emitted string field', () => {
    const canaries = [
      `ghp_${'A'.repeat(36)}`,
      `sk-${'B'.repeat(20)}`,
      `sk-live-${'C'.repeat(16)}`,
      `AKIA${'EXAMPLE0000TEST'}`,
      `eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.${'c'.repeat(20)}`,
      '192.0.2.44',
      '192.0.2.44:8080',
      '10.0.0.5:22',
      'fe80::1',
      '2001:db8::17',
      'canary.example.com',
      'canary.example.',
      'canary_host.corp',
      'canary.corp:443',
      'model.canary.internal',
      'labhost07',
      'buildbox01',
      'localhost',
      '/home/devuser/clients/northwind',
      'resources/read/canary.internal',
      'tools/call?token=FAKECANARY',
      'C:\\Users\\devuser',
      'https://llm.internal/secret',
      'devuser@sample.test',
      'Northwind Practice',
      'Scout\nNorthwind Practice',
      'ft:gpt-4o:canaryclient::abc',
      'ECONNREFUSED_192.0.2.9:5432',
      'X'.repeat(10000),
    ];

    const stringsIn = (value: unknown, found: string[] = []): string[] => {
      if (typeof value === 'string') found.push(value);
      else if (Array.isArray(value)) for (const item of value) stringsIn(item, found);
      else if (value && typeof value === 'object') for (const item of Object.values(value)) stringsIn(item, found);
      return found;
    };

    for (const canary of canaries) {
      const mappings = [
        mapAssistantTeamObservation({
          signal: 'invoke_agent',
          controlFlow: 'agent',
          agentName: canary,
          conversationId: canary,
          errorType: canary,
        } as never),
        mapAssistantTeamObservation({
          signal: 'invoke_agent',
          controlFlow: canary,
          agentName: 'Scout',
        } as never),
        mapAssistantTeamObservation({
          signal: 'execute_tool',
          toolName: canary,
          toolCallId: canary,
          agentName: canary,
          errorType: canary,
        } as never),
        mapAssistantTeamObservation({
          signal: 'inference',
          operationName: 'chat',
          providerName: canary,
          requestModel: canary,
          responseModel: canary,
          errorType: canary,
        } as never),
        mapAssistantTeamObservation({
          signal: 'inference',
          operationName: canary,
          providerName: 'openai',
        } as never),
        mapAssistantTeamObservation({
          signal: 'mcp',
          role: 'client',
          methodName: canary,
          toolName: canary,
          promptName: canary,
          requestId: canary,
          errorType: canary,
        } as never),
        mapAssistantTeamObservation({
          signal: 'mcp',
          role: 'client',
          methodName: 'tools/call',
          toolName: canary,
          promptName: canary,
          requestId: canary,
          errorType: canary,
        } as never),
        mapAssistantTeamObservation({
          signal: 'mcp',
          role: canary,
          methodName: 'initialize',
        } as never),
      ];
      for (const mapping of mappings) {
        expect(stringsIn(mapping).some((text) => text.includes(canary))).toBe(false);
      }
    }

    for (const toolName of [42, null, { trim: () => 'LEAK' }, ['a']]) {
      expect(() => mapAssistantTeamObservation({ signal: 'execute_tool', toolName } as never)).not.toThrow();
    }
  });

  it('stays offline: the mapping module does not export or dial a network endpoint', () => {
    const source = fs.readFileSync(path.join(__dirname, 'map-assistant-team.ts'), 'utf8');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.ts'), 'utf8');
    const combined = `${source}\n${schema}`;
    expect(combined).not.toMatch(/from ['"]node:(https|http|net|dgram)['"]/);
    expect(combined).not.toMatch(/\bfetch\s*\(/);
    expect(combined).not.toMatch(/OTLP|otlp|localhost:\d+/);
  });
});
