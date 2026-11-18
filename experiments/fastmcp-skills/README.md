# FastMCP 4.2 skills trial

Small, stdio-only prototype. One MCP server publishes three existing OpenGrimoire markdown files as [FastMCP 4.2.0](https://github.com/PrefectHQ/fastmcp/releases/tag/v4.2.0) skills and one trivial tool (`catalog_ping`).

This directory does not change the app. OpenGrimoire still has no first-party MCP server; see [docs/agent/INTEGRATION_PATHS.md](../../docs/agent/INTEGRATION_PATHS.md).

## Requirements

- Python **3.11 or newer**. FastMCP 4.2.0 declares `Requires-Python: >=3.11`, and `server.py` refuses to import on older interpreters.
- `fastmcp==4.2.0` exactly. Do not install any release below **4.1.2**. That floor closes the October 2026 advisory batch. [GHSA-gpgx-58w2-xwwf](https://github.com/PrefectHQ/fastmcp/security/advisories/GHSA-gpgx-58w2-xwwf) (client code execution when parsing a server-supplied tool output schema) is fixed in 4.0.11; 4.1.2 is the 4.x line that also picks up the rest of that batch. The pin is exact so a resolver cannot float below 4.1.2 or onto 4.3 while this trial is the reference.

## Which skills API this uses

4.2 renamed the authoring type to `Skill` and moved the wire entry to `MCPSkill`. This server builds skills with `Skill` and serves them with `SkillCatalogProvider` from `fastmcp.skills.provider`.

The 4.1 providers in `fastmcp.server.providers.skills` and the helpers in `fastmcp.utilities.skills` still import on 4.2, warn when called, and are **removed in 4.3**. Do not build on them. A 4.3 upgrade of this trial should stay on `Skill` / `SkillCatalogProvider` / `Client.read_skill`. It should not keep the old imports around "just in case."

## What it serves

Each skill is a short `SKILL.md` plus one existing repository file, read as bytes when the process builds the catalog:

| Skill | Bundled file |
| --- | --- |
| `integration-paths` | `docs/agent/INTEGRATION_PATHS.md` |
| `idempotency-and-retry` | `docs/agent/ADR_IDEMPOTENCY_AND_RETRY.md` |
| `harness-profile-alignment` | `docs/agent/HARNESS_PROFILE_ALIGNMENT.md` |

The bundled bytes are the repository file. The `SKILL.md` body is only a pointer, because those docs are not Agent Skills (no `name` / `description` frontmatter, and the filenames are not skill names). Skill names are lowercase slugs, which is what 4.2 requires.

`build_server()` snapshots the files. Editing a doc on disk does not change a process that has already imported `server.py`. Restart to publish the new bytes. The new bytes get a new digest.

## How to run

From this directory, with Python 3.11+:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/pytest
.venv/bin/python server.py
```

`python server.py` calls `mcp.run(transport="stdio")`. It does not open a socket. Leave the process attached to an MCP client over stdin/stdout.

With the virtualenv on `PATH` (`fastmcp` must resolve; the CLI re-invokes itself):

```bash
fastmcp list server.py --skills
```

That starts the same server with transport `stdio`, lists `catalog_ping`, and lists the three skills. Do not pass `--transport http`, and do not bind all interfaces. This trial has no HTTP entrypoint.

Tests use an in-process client (`Client(server)`). They refuse `socket.create_connection`, `connect`, and `connect_ex`, so a test that opens a connection fails. No listener is started.

GitHub Actions on this account is billing-blocked and will not run. This prototype is not wired into `.github/workflows/ci.yml`. Run pytest locally.

## What worked

Verified with FastMCP 4.2.0 on Python 3.12, in-process, and once via `fastmcp list server.py --skills` (stdio):

- One server listed the three skills through `skills/list` when the client passed `SkillsClientExtension()`, and listed `catalog_ping` beside them. The tool call returned `ok`.
- `read_skill("skill://<name>/SKILL.md")` returned the repository file bytes unchanged for all three docs.
- For each untouched file, the skill entry's `size` and `sha256:` digest matched the file, and `read_skill` accepted the download.
- A same-length byte flip of `INTEGRATION_PATHS.md` made `read_skill` raise `ValueError` (`does not match its manifest digest`). An extra byte on `ADR_IDEMPOTENCY_AND_RETRY.md` raised `ValueError` (`the manifest promised <size>`). The client did not return a `Skill` in either case.
- Without the client extension, `list_skills()` raises, but `list_skill_resources()` still finds the three `skill://.../SKILL.md` URIs and `read_skill` still checks size and digest via the `_manifest` resource.
- `fastmcp list` reported `transport 'stdio'` and the three skills with the file sizes above (3195, 3331, and 2904 bytes for the bundled docs).

## What did not

- `skills/list` is not available unless the client opts into the Skills extension (`io.modelcontextprotocol/skills`). A client that only speaks ordinary MCP resources does not see a skill catalog. It can still read `skill://` resources if it knows the URIs.
- `read_resource` on a tampered file returned the tampered text and did not fail. The size and digest checks run inside `read_skill` only.
- The CLI schema line for `catalog_ping` prints `-> dict` because FastMCP wraps the tool result. The in-process client unwraps that wrapper; `result.data` is the string `ok`.
- `fastmcp list server.py` failed until this module exposed an object named `mcp`. It also failed with `No such file or directory: 'fastmcp'` when that executable was not on `PATH`.
- There is no auth. Anyone who can speak to the process can read the three docs. FastMCP can hide a skill from `skills/list` when the caller cannot read every file; this trial does not turn that on.
- No non-FastMCP host was attached. The release notes say few hosts implement the extension, and nothing here shows an agent picking the skill up without a FastMCP client.
- `directoryRead` is not implemented in 4.2. A proxied skill whose manifest is `"dynamic"` is left out of discovery. Neither path is used here.
- The 4.1 API was not exercised. It is still present and is the wrong thing to copy.

## Size and digest: what they guarantee

`Client.read_skill` loads the manifest (`skills/get` when the extension was negotiated, otherwise the `_manifest` resource). For every file it then:

1. Rejects the skill up front if it would exceed 512 files or 16 MiB.
2. Reads the file bytes.
3. Requires `len(bytes) == manifest.size`. A mismatch raises `ValueError` and stops.
4. Requires `sha256:` plus the hex SHA-256 of those bytes to equal `manifest.digest`. A mismatch raises `ValueError` and stops.
5. When an extension entry was used, requires the parsed `SKILL.md` frontmatter to match the entry.

The digest is of the bytes the client actually received. For these UTF-8 markdown files the server may decode the resource as text and the client encodes it again as UTF-8; that round-trip matched the original file bytes. A non-UTF-8 file is a different path (raw bytes). Do not let a transport or editor rewrite newlines between the snapshot and the client: 4.2 hashes the exact bytes, so a CRLF change is a different file and will fail the check. That is what we want.

Limits, in order:

- The server computes the digest. A server that is wrong, compromised, or malicious can advertise a digest that matches whatever bytes it sends. The check catches a file that diverges from its manifest (a bad read path, a proxy that altered a body, a test double that flips a byte). It is not a signature, not a key pin, and not a review of the content.
- Only `read_skill` (or another client that repeats these steps) is protected. `read_resource` and a host that copies files some other way are not.
- The manifest describes the snapshot this process built. It says nothing about whether that snapshot is the git blob a reviewer approved, unless the operator compares the digest to a digest they computed from git.
- Restarting the server to pick up an edit produces a new honest manifest. Old clients are not told. There is no revocation list.
- Verification does not authenticate the peer. On stdio the peer is the child process. On any future transport, TLS or an equivalent would be a separate problem this trial does not solve.

## Recommendation

Do not make this the team's shared skill catalog.

Git is already the catalog: the three files are reviewed, diffed, and present in every checkout. FastMCP 4.2 can serve a snapshot of them next to a tool, and `read_skill` fails closed when the bytes and the manifest disagree. That is a useful check for a sync job. It is not a reason to put the skills behind a server the agents do not read.

The agents this repo targets still load skills from local folders. The Skills extension is experimental, `skills/list` requires an explicit client opt-in, and this trial never showed a host installing a skill on its own. OpenGrimoire's integration note still says any MCP surface should be a thin wrapper over HTTP, not a second copy of the docs. A shared server would also need an auth story this prototype does not have, and the digest would still trust that server's manifest.

Use 4.2's `read_skill` later if a stdio sync step (`read_skill`, then `Skill.to_directory`) is actually how a machine should install a skill, and pin `fastmcp==4.2.0` or a newer release that is still at least 4.1.2 and still on the `Skill` / `SkillCatalogProvider` API. Until then, leave the skill files in git.
