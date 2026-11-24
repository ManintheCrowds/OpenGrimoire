"""Stdio MCP server that publishes three OpenGrimoire docs as FastMCP 4.2 skills.

This module uses the 4.2 authoring API (`Skill`, `SkillCatalogProvider`).
The 4.1 providers in `fastmcp.server.providers.skills` and the helpers in
`fastmcp.utilities.skills` still import on 4.2, warn when called, and are
removed in 4.3. `Skill` is the class you author. The wire entry that used
that name in 4.1 is `MCPSkill`. Do not build on the 4.1 API.
"""

from __future__ import annotations

import sys
from dataclasses import dataclass
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path


def _require_fastmcp_4_2_5() -> None:
    """Refuse any FastMCP distribution other than 4.2.5 before importing it.

    Importing a different build first would run that build's import-time code.
    GHSA-78c8-3jhx-5mg7 is patched in 4.2.4; this trial stays on the exact pin.
    """
    if sys.version_info < (3, 11):
        raise RuntimeError("This trial requires Python 3.11 or newer.")
    try:
        installed = version("fastmcp")
    except PackageNotFoundError as exc:
        raise RuntimeError("This trial requires fastmcp==4.2.5.") from exc
    if installed != "4.2.5":
        raise RuntimeError(
            "This trial requires fastmcp==4.2.5 "
            "(GHSA-78c8-3jhx-5mg7 is patched in 4.2.4; never below 4.1.2). "
            f"Found {installed}."
        )


_require_fastmcp_4_2_5()

from fastmcp import FastMCP, Skill
from fastmcp.skills.provider import SkillCatalogProvider

# experiments/fastmcp-skills/server.py -> repository root.
REPO_ROOT = Path(__file__).resolve().parents[2]
TRANSPORT = "stdio"


@dataclass(frozen=True)
class CatalogEntry:
    """One existing markdown file published as a skill."""

    name: str
    description: str
    bundled_name: str
    repo_relative: str
    instructions: str


CATALOG: tuple[CatalogEntry, ...] = (
    CatalogEntry(
        name="integration-paths",
        description=(
            "Use this when choosing how an agent should call OpenGrimoire: "
            "HTTP and the thin CLI first, and any MCP tool only as a wrapper "
            "over those routes."
        ),
        bundled_name="INTEGRATION_PATHS.md",
        repo_relative="docs/agent/INTEGRATION_PATHS.md",
        instructions=(
            "Read INTEGRATION_PATHS.md in this skill and follow it. "
            "The bundled file is the OpenGrimoire document; this wrapper only publishes it.\n"
        ),
    ),
    CatalogEntry(
        name="idempotency-and-retry",
        description=(
            "Use this before retrying an OpenGrimoire HTTP call. It says which "
            "survey, alignment, and clarification operations are safe to repeat."
        ),
        bundled_name="ADR_IDEMPOTENCY_AND_RETRY.md",
        repo_relative="docs/agent/ADR_IDEMPOTENCY_AND_RETRY.md",
        instructions=(
            "Read ADR_IDEMPOTENCY_AND_RETRY.md in this skill before retrying a call. "
            "The bundled file is the OpenGrimoire ADR; this wrapper only publishes it.\n"
        ),
    ),
    CatalogEntry(
        name="harness-profile-alignment",
        description=(
            "Use this when a harness should follow the operator's selected Sync "
            "Session profile, including which fields are guidance rather than enforcement."
        ),
        bundled_name="HARNESS_PROFILE_ALIGNMENT.md",
        repo_relative="docs/agent/HARNESS_PROFILE_ALIGNMENT.md",
        instructions=(
            "Read HARNESS_PROFILE_ALIGNMENT.md in this skill and follow it. "
            "The bundled file is the OpenGrimoire document; this wrapper only publishes it.\n"
        ),
    ),
)


def source_path(entry: CatalogEntry) -> Path:
    return REPO_ROOT / entry.repo_relative


def load_skill(entry: CatalogEntry) -> Skill:
    """Snapshot one repository markdown file into an immutable skill."""
    payload = source_path(entry).read_bytes()
    return Skill(
        name=entry.name,
        description=entry.description,
        instructions=entry.instructions,
        files={entry.bundled_name: payload},
    )


def load_catalog() -> list[Skill]:
    return [load_skill(entry) for entry in CATALOG]


def build_server(provider: SkillCatalogProvider | None = None) -> FastMCP:
    """Build the trial server. Tests pass a provider; the process uses the real catalog."""
    mcp = FastMCP("OpenGrimoire skill catalog trial")
    mcp.add_provider(provider or SkillCatalogProvider(load_catalog()))

    @mcp.tool
    def catalog_ping() -> str:
        """Return a fixed acknowledgement that this trial server is running."""
        return "ok"

    return mcp


# Named `mcp` so `fastmcp list server.py` can import this file over stdio.
mcp = build_server()


def main() -> None:
    """Serve the catalog on stdio. This does not open a socket."""
    mcp.run(transport=TRANSPORT, show_banner=False)


if __name__ == "__main__":
    main()
