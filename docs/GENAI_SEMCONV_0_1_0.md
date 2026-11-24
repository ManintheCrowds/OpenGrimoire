# GenAI semantic conventions 0.1.0

OpenGrimoire does not emit OpenTelemetry spans or metrics today. This note pins an in-memory mapping from assistant-team observations onto [OpenTelemetry GenAI semantic conventions v0.1.0](https://github.com/open-telemetry/semantic-conventions-genai/releases/tag/v0.1.0) (published 2026-11-21, commit `d0e74ba6c48bcc4ded473b1828a8212f06b23753`, Apache-2.0, depends on semantic-conventions v1.45.0).

The internal label is `GEN_AI_SEMCONV_SCHEMA_VERSION` in `src/lib/observability/genai-semconv/schema.ts` (`gen_ai semconv 0.1.0`). That string is not an OTel schema URL. The v0.1.0 manifest URL is `GEN_AI_SEMCONV_SCHEMA_URL` (`https://opentelemetry.io/schemas/semconv-genai-dev/0.1.0-dev`). Bucket boundaries, closed sets, and the MCP server caller-fault codes live in that same file. Call `mapAssistantTeamObservation` in `src/lib/observability/genai-semconv/map-assistant-team.ts`. No package was added. The mapping does not import an OpenTelemetry SDK and does not export telemetry.

## What this repo records today

| Signal | Where | GenAI span? |
| --- | --- | --- |
| Local AI activity JSONL (`id`, `ts`, `kind`, `summary`, `detail`) | `data/local-ai-activity.jsonl`, `src/lib/local-ai/activity-log.ts` | No. Kinds are `bootstrap`, `health`, `workflow`, `verification`, `training`, `ux_assist`. |
| UX metrics | `GET /api/admin/cockpit/ux-metrics` counts `accept` / `dismiss` / `undo` from `ux_assist` detail | No. It reads the JSONL text, not OTel attribute names. |
| Operator probes | `/api/operator-probes/ingest`, `operator_observability_probes` | No. Network and path probes. |
| Access-denial logs | `src/lib/observability/access-denial-log.ts` | No. Gate and reason only. |
| `@opentelemetry/api` | Transitive entries in `package-lock.json` | Not imported by application code. |

`mapLocalAiActivityEvent` returns no spans and no metrics. A `workflow` JSONL row is a cockpit note, not an `invoke_workflow` span. `summary` and `detail` are dropped so prompt text in the log cannot land on a span. The JSONL field names stay as they are because the activity route and the UX metrics adapter read them. Nothing in this repo reads the retired OTel names below, so the mapper does not emit those names next to the v0.1.0 names.

## Breaking changes checked against the v0.1.0 spec

Checked on tag `v0.1.0`, not from the release summary alone.

**`invoke_workflow` uses the invoke-agent span.** `docs/gen-ai/gen-ai-agent-spans.md` defines one internal span, registry type `gen_ai.invoke_agent.internal`, for an in-process agent, workflow, or framework entrypoint. `gen_ai.operation.name` remains `invoke_workflow` when the application defines the control flow. The span name is `invoke_workflow {gen_ai.agent.name}` when a name is available, otherwise `invoke_workflow`. `gen_ai.workflow.name` does not appear on that span or in `docs/gen-ai/gen-ai-metrics.md`. Workflow duration is `gen_ai.invoke_agent.duration` (unit `s`), distinguished by `gen_ai.operation.name`. `gen_ai.provider.name` and `gen_ai.agent.id` are not attributes of the internal span.

**Token histograms moved.** `docs/gen-ai/gen-ai-token-metrics.md` has no `gen_ai.client.token.usage` metric and no `gen_ai.token.type` attribute. Inference token distribution is:

| Metric | Instrument | Unit | When |
| --- | --- | --- | --- |
| `gen_ai.client.inference.operation.input_tokens` | histogram | `{token}` | Every inference operation, including failures. Value is the provider count, or `0` when the response is missing or has no usage. |
| `gen_ai.client.inference.operation.output_tokens` | histogram | `{token}` | Same rule. |
| `gen_ai.client.inference.usage.input_tokens` | counter | `{token}` | Known, strictly positive counts only. |
| `gen_ai.client.inference.usage.output_tokens` | counter | `{token}` | Same. |
| `gen_ai.client.inference.usage.cache_read.input_tokens` | counter | `{token}` | Same. |
| `gen_ai.client.inference.usage.cache_write.input_tokens` | counter | `{token}` | Same. The span attribute `gen_ai.usage.cache_creation.input_tokens` was renamed to `gen_ai.usage.cache_write.input_tokens`. |
| `gen_ai.client.inference.usage.reasoning.output_tokens` | counter | `{token}` | Positive reasoning counts. This metric's attribute table does not include `gen_ai.token.modality`. |

Histogram attributes require `gen_ai.operation.name` and `gen_ai.provider.name`. `error.type` is set when the operation failed. Usage counters other than the reasoning counter require `gen_ai.token.modality`. This mapping sets that attribute to `unknown` because OpenGrimoire does not receive a modality split. The well-known provider value `mistral_ai` is stored as `mistral`. The old value is not emitted.

**MCP errors use `rpc.status_code`.** `docs/gen-ai/mcp.md` records the JSON-RPC error code on `rpc.status_code` (string, for example `-32602`). `rpc.response.status_code` is not on the client span, server span, or operation-duration metrics. Client telemetry treats every JSON-RPC error code as a failure and sets `error.type` to that same string. Server telemetry still sets `rpc.status_code`, but codes `-32700`, `-32600`, `-32601`, `-32602`, and `-32002` are caller faults and do not set `error.type` or span status `ERROR`. Any other server code does. An HTTP failure with no JSON-RPC code sets `error.type` to the status string and leaves `rpc.status_code` unset. The spec says a span status description should match `JSONRPCError.message` when that message exists. This mapping omits the message.

## Attribute mapping

| Observation | Span name | Registry type | Kind | Attributes this mapping sets | Metric |
| --- | --- | --- | --- | --- | --- |
| `invoke_agent` / `agent` | `invoke_agent` or `invoke_agent {gen_ai.agent.name}` | `gen_ai.invoke_agent.internal` | `INTERNAL` | `gen_ai.operation.name=invoke_agent`. `gen_ai.agent.name` and `gen_ai.conversation.id` only when the caller supplied a usable value. Usage token attributes only for this operation, and only for a known integer count. | `gen_ai.invoke_agent.duration` when `durationSeconds` is set |
| `invoke_agent` / `workflow` | `invoke_workflow` or `invoke_workflow {gen_ai.agent.name}` | `gen_ai.invoke_agent.internal` | `INTERNAL` | `gen_ai.operation.name=invoke_workflow`. No `gen_ai.workflow.name`. No usage attributes (those are recommended on this span only when the operation is `invoke_agent`). | `gen_ai.invoke_agent.duration` |
| `execute_tool` | `execute_tool {gen_ai.tool.name}` | `gen_ai.execute_tool` | `INTERNAL` | Span: `gen_ai.operation.name`, `gen_ai.tool.name`. `gen_ai.tool.call.id` only when the id matches the id charset. `gen_ai.agent.name` when it passes the name rules. | `gen_ai.execute_tool.duration` when duration is set. The histogram attributes are `gen_ai.tool.name`, `gen_ai.agent.name` when present, and `error.type` on failure. `gen_ai.operation.name` is not a v0.1.0 attribute of this metric. |
| `inference` | `{gen_ai.operation.name} {gen_ai.request.model}` | `gen_ai.client.inference` | `CLIENT` | `gen_ai.operation.name`, `gen_ai.provider.name`. Request and response model when usable. `error.type` on failure. Usage attributes for known counts. | The token histograms and positive counters above. `gen_ai.client.inference.duration` when duration is set |
| `mcp` client | `{mcp.method.name}` or `{mcp.method.name} {target}` | `mcp.client` | `CLIENT` | `mcp.method.name`. `gen_ai.tool.name` or `gen_ai.prompt.name` for the target. `gen_ai.operation.name=execute_tool` only for `tools/call`. `jsonrpc.request.id` when the id is a safe integer or an accepted id shape. `rpc.status_code` / `error.type` as above. | `mcp.client.operation.duration` when duration is set |
| `mcp` server | same name rule | `mcp.server` | `SERVER` | Same attribute rules, with the server failure split above. | `mcp.server.operation.duration` when duration is set |

`target` is the tool name or, if there is no tool name, the prompt name. Resource URIs are not used as span names.

An empty `providerName` produces no inference span and no token metric (`inference_provider_required`). A non-empty provider outside `GEN_AI_PROVIDER_NAMES` is stored as `_OTHER`. `mistral_ai` is stored as `mistral`.

## What the mapper validates

`GEN_AI_CONTENT_CAPTURE_MODE` is the constant `NO_CONTENT`. The other spec modes are not implemented. These own fields are never copied into attributes or span names; only the field name is listed in `droppedFields`: `inputMessages`, `outputMessages`, `systemInstructions`, `toolArguments`, `toolResult`, `secret`, `apiToken`, `clientName`, `clientAddress`, `hostname`, `serverAddress`, `jsonRpcMessage`. `server.address`, `server.port`, `client.address`, `client.port`, and `mcp.resource.uri` are not set. JSON-RPC error messages are not copied.

Closed sets, rejected at runtime with an omission and no span when the value is outside the set:

| Field | Accepted values |
| --- | --- |
| `signal` | `invoke_agent`, `execute_tool`, `inference`, `mcp` |
| `controlFlow` | `agent`, `workflow` |
| inference `operationName` | `chat`, `generate_content`, `text_completion` |
| `role` | `client`, `server` |
| `mcp.method.name` | the v0.1.0 `MCP_METHOD_NAMES` list |

Other fields:

| Field | Rule |
| --- | --- |
| `gen_ai.provider.name` | `GEN_AI_PROVIDER_NAMES`, or `_OTHER` when the string is non-empty and not in that list |
| `error.type` | `GEN_AI_ERROR_TYPES`, or a pure integer of at most 5 digits. Every other string is `_OTHER` |
| agent names | Exact `ASSISTANT_TEAM_AGENT_NAMES` (`Scout`, `recipe_runner`). Anything else is omitted. |
| tool and prompt names | Exact `ASSISTANT_TEAM_TOOL_NAMES` (`read_file`). Anything else is omitted. |
| model names | Exact `GEN_AI_MODEL_NAMES` only. Any other non-empty string, including a listed id plus a suffix, is `_OTHER` on the span name, `gen_ai.request.model`, `gen_ai.response.model`, and inference metrics. |
| model ids | Closed set: exact `GEN_AI_MODEL_NAMES` only. Every other non-empty string is `_OTHER`. |
| `gen_ai.conversation.id`, `gen_ai.tool.call.id`, `jsonrpc.request.id` | Closed set. UUID version nibble 1–8 and variant 8, 9, a, or b. ULID: 26 Crockford characters, first character 0–7. Provider ids: `call_` plus 24 letters and digits, `chatcmpl-` plus 29, or `resp_` plus 48, and the body must contain a letter and a digit. `hmac_` plus 64 lowercase hex is accepted only when `hmacLocalId` produced it with `OPENGRIMOIRE_GENAI_ID_HMAC_KEY`. That variable is a per-install secret. It is never committed, and this repository has no default. When it is unset, an `hmac_` id is dropped (`hmac_key_missing`). An HMAC id is only a pseudonym while that key stays private. Free text, including values prefixed `req-`, `call_`, or `conv_`, is dropped. A token prefix (`sk-`, `sk-proj-`, `sk-ant-`, `shpat_`, `ghr_`, `sk_test_`, `rk_test_`, `pypi-`, `xai-`, `gsk_`, `pplx-`, `ya29.`, `lin_api_`, `xapp-`, `glsa_`, `r8_`, `xoxr-`, `dop_v1_`, and `bearer` with or without a separator) is rejected before the shape check. UUID, ULID, and HMAC hex can still carry encoded text; the shape check does not try to detect that. |
| JSON-RPC and HTTP codes | A finite integer whose absolute value is at most 99999, or a trimmed string of only an optional minus and digits in that range. Exponent text such as `1e21` is rejected. Mixed text is an error of type `_OTHER` and is not copied. HTTP 100–399 does not fail the span. HTTP 400–599 is an error. Other HTTP statuses are `_OTHER`. |

A safe integer JSON-RPC request id, including a digit string such as `7`, is kept as a string. A non-integer or non-safe number is dropped (`request_id_rejected`). Other non-string identifier fields are ignored. The cleaners do not call methods on those values. `signal` and the other observation fields are read only when they are own properties. A throwing getter or proxy returns an empty mapping (`observation_unreadable`) and the thrown message is not copied. Model ids and the conversation, tool-call, and request ids are closed sets.

## Left out on purpose

- A2A, embeddings, realtime sessions, memory, retrieval, plan, and fetch-response operations.
- The `gen_ai.main_agent` resource, exception events, and `gen_ai.client.inference.operation.details`.
- Per-modality token splits other than `unknown`.
- MCP session-duration metrics, `network.transport`, and protocol version attributes.
- Any exporter. A later exporter has to stay off unless configured, and it may target only the local console or a loopback receiver. This module does not open a socket.

## Churn

GenAI attributes in v0.1.0 are still marked Development. The release is the break from semantic-conventions v1.41.0: workflow spans merged into `gen_ai.invoke_agent.internal`, registry span types renamed (`gen_ai.inference.client` to `gen_ai.client.inference`, `gen_ai.execute_tool.internal` to `gen_ai.execute_tool`), and inference, embeddings, invoke-agent, and execute-tool durations moved off `gen_ai.client.operation.duration`. The next release can rename those again.

Because no route writes these names yet, a later revision stays inside `src/lib/observability/genai-semconv/` and `docs/GENAI_SEMCONV_0_1_0.md`. Change `GEN_AI_SEMCONV_SCHEMA_VERSION` and `GEN_AI_SEMCONV_SCHEMA_URL` in the same edit as the attribute and metric names.
