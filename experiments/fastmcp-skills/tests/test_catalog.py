"""Offline checks for the FastMCP 4.2 skill catalog trial."""

from __future__ import annotations

import ast
import asyncio
import hashlib
import sys
from collections.abc import Awaitable, Callable
from importlib.metadata import version
from pathlib import Path
from typing import Literal, assert_never

import pytest
from fastmcp import Client, Skill
from fastmcp.skills import SkillsClientExtension
from fastmcp.skills.models import SkillResource
from fastmcp.skills.provider import SkillCatalogProvider, SkillFileResource

import server

TamperMode = Literal["digest", "size"]


class TamperingCatalog(SkillCatalogProvider):
    """Serve an honest manifest and different bytes for one file.

    `read_skill` compares those bytes with the manifest. A same-length change
    fails the digest check. An extra byte fails the size check first.
    """

    def __init__(
        self,
        skills: list[Skill],
        *,
        skill_name: str,
        file_name: str,
        mode: TamperMode,
    ) -> None:
        super().__init__(skills)
        self._skill_name = skill_name
        self._file_name = file_name
        self._mode = mode

    async def read_file(self, resource: SkillFileResource) -> bytes:
        data = await super().read_file(resource)
        if (
            resource.skill_path != self._skill_name
            or resource.file_path != self._file_name
        ):
            return data
        if self._mode == "digest":
            flipped = bytearray(data)
            flipped[-1] ^= 0x01
            return bytes(flipped)
        if self._mode == "size":
            return data + b"\n"
        assert_never(self._mode)


def _run(body: Callable[[], Awaitable[None]]) -> None:
    asyncio.run(body())


def _entry(name: str) -> server.CatalogEntry:
    for entry in server.CATALOG:
        if entry.name == name:
            return entry
    raise AssertionError(name)


def _resource(resources: list[SkillResource] | str, suffix: str) -> SkillResource:
    assert isinstance(resources, list)
    matches = [item for item in resources if item.uri.endswith("/" + suffix)]
    assert len(matches) == 1
    return matches[0]


def test_runtime_pins() -> None:
    assert sys.version_info >= (3, 11)
    assert version("fastmcp") == "4.2.0"
    assert server.TRANSPORT == "stdio"


def test_server_module_does_not_use_removed_or_network_apis() -> None:
    text = Path(server.__file__).read_text(encoding="utf-8")
    tree = ast.parse(text)
    imported: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imported.extend(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module is not None:
            imported.append(node.module)
    assert not any(
        name.startswith("fastmcp.server.providers.skills")
        or name.startswith("fastmcp.utilities.skills")
        for name in imported
    )
    assert "run_http" not in text
    assert "0.0.0.0" not in text


def test_server_lists_skills_and_the_tool() -> None:
    async def body() -> None:
        async with Client(
            server.build_server(),
            extensions=[SkillsClientExtension()],
        ) as client:
            listed = await client.list_skills()
            by_name = {item.frontmatter.name: item for item in listed}
            assert set(by_name) == {entry.name for entry in server.CATALOG}
            for entry in server.CATALOG:
                assert by_name[entry.name].frontmatter.description == entry.description
                assert by_name[entry.name].uri == f"skill://{entry.name}/SKILL.md"
            tools = await client.list_tools()
            assert [tool.name for tool in tools] == ["catalog_ping"]
            result = await client.call_tool("catalog_ping", {})
            assert result.data == "ok"

    _run(body)


def test_fetch_returns_the_repository_file_bytes() -> None:
    async def body() -> None:
        async with Client(
            server.build_server(),
            extensions=[SkillsClientExtension()],
        ) as client:
            for entry in server.CATALOG:
                expected = entry_source(entry)
                skill = await client.read_skill(f"skill://{entry.name}/SKILL.md")
                assert skill.name == entry.name
                assert skill.files[entry.bundled_name] == expected
                assert entry.instructions.encode("utf-8") in skill.files["SKILL.md"]

    _run(body)


def test_untouched_file_matches_manifest_size_and_digest() -> None:
    async def body() -> None:
        async with Client(
            server.build_server(),
            extensions=[SkillsClientExtension()],
        ) as client:
            listed = {item.frontmatter.name: item for item in await client.list_skills()}
            for entry in server.CATALOG:
                expected = entry_source(entry)
                advertised = _resource(
                    listed[entry.name].resources,
                    entry.bundled_name,
                )
                assert advertised.size == len(expected)
                assert advertised.digest == "sha256:" + hashlib.sha256(expected).hexdigest()
                skill = await client.read_skill(listed[entry.name].uri)
                fetched = skill.files[entry.bundled_name]
                assert len(fetched) == advertised.size
                assert "sha256:" + hashlib.sha256(fetched).hexdigest() == advertised.digest

    _run(body)


def test_same_length_tamper_fails_digest_check() -> None:
    entry = _entry("integration-paths")

    async def body() -> None:
        provider = TamperingCatalog(
            server.load_catalog(),
            skill_name=entry.name,
            file_name=entry.bundled_name,
            mode="digest",
        )
        async with Client(
            server.build_server(provider),
            extensions=[SkillsClientExtension()],
        ) as client:
            with pytest.raises(ValueError, match="does not match its manifest digest"):
                await client.read_skill(f"skill://{entry.name}/SKILL.md")

    _run(body)


def test_appended_byte_fails_size_check() -> None:
    entry = _entry("idempotency-and-retry")

    async def body() -> None:
        provider = TamperingCatalog(
            server.load_catalog(),
            skill_name=entry.name,
            file_name=entry.bundled_name,
            mode="size",
        )
        async with Client(
            server.build_server(provider),
            extensions=[SkillsClientExtension()],
        ) as client:
            with pytest.raises(ValueError, match="the manifest promised"):
                await client.read_skill(f"skill://{entry.name}/SKILL.md")

    _run(body)


def test_direct_resource_read_does_not_check_the_digest() -> None:
    """The size and digest checks live in read_skill, not in a raw resource read."""
    entry = _entry("harness-profile-alignment")

    async def body() -> None:
        provider = TamperingCatalog(
            server.load_catalog(),
            skill_name=entry.name,
            file_name=entry.bundled_name,
            mode="digest",
        )
        async with Client(
            server.build_server(provider),
            extensions=[SkillsClientExtension()],
        ) as client:
            listed = {
                item.frontmatter.name: item for item in await client.list_skills()
            }
            resource = _resource(listed[entry.name].resources, entry.bundled_name)
            contents = await client.read_resource(resource.uri)
            assert len(contents) == 1
            block = contents[0]
            assert block.text is not None
            assert block.text.encode("utf-8") != entry_source(entry)

    _run(body)


def test_skills_list_requires_the_client_extension() -> None:
    async def body() -> None:
        async with Client(server.build_server()) as client:
            with pytest.raises(RuntimeError, match="Skills extension"):
                await client.list_skills()
            resources = await client.list_skill_resources()
            uris = {str(resource.uri) for resource in resources}
            assert uris == {f"skill://{entry.name}/SKILL.md" for entry in server.CATALOG}
            skill = await client.read_skill("skill://integration-paths/SKILL.md")
            entry = _entry("integration-paths")
            assert skill.files[entry.bundled_name] == entry_source(entry)

    _run(body)


def entry_source(entry: server.CatalogEntry) -> bytes:
    return server.source_path(entry).read_bytes()
