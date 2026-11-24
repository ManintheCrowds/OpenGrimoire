"""Offline checks for the FastMCP 4.2 skill catalog trial."""

from __future__ import annotations

import ast
import asyncio
import hashlib
import sys
import tomllib
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
    assert version("fastmcp") == "4.2.5"
    assert server.TRANSPORT == "stdio"


def _server_tree() -> ast.Module:
    return ast.parse(Path(server.__file__).read_text(encoding="utf-8"))


def _first_fastmcp_import(tree: ast.Module) -> ast.stmt:
    for stmt in tree.body:
        if isinstance(stmt, ast.ImportFrom) and stmt.module and stmt.module.startswith("fastmcp"):
            return stmt
        if isinstance(stmt, ast.Import) and any(
            alias.name.startswith("fastmcp") for alias in stmt.names
        ):
            return stmt
    raise AssertionError("server.py does not import fastmcp")


def _is_version_fastmcp_call(node: ast.expr) -> bool:
    return (
        isinstance(node, ast.Call)
        and isinstance(node.func, ast.Name)
        and node.func.id == "version"
        and len(node.args) == 1
        and isinstance(node.args[0], ast.Constant)
        and node.args[0].value == "fastmcp"
    )


def _name_assigned_from_version(func: ast.FunctionDef, name: str) -> bool:
    for node in ast.walk(func):
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if (
                    isinstance(target, ast.Name)
                    and target.id == name
                    and _is_version_fastmcp_call(node.value)
                ):
                    return True
        if (
            isinstance(node, ast.AnnAssign)
            and isinstance(node.target, ast.Name)
            and node.target.id == name
            and node.value is not None
            and _is_version_fastmcp_call(node.value)
        ):
            return True
    return False


def _guard_compares_installed_version(func: ast.FunctionDef) -> bool:
    for stmt in func.body:
        if not isinstance(stmt, ast.If) or not isinstance(stmt.test, ast.Compare):
            continue
        test = stmt.test
        exact = (
            len(test.ops) == 1
            and isinstance(test.ops[0], ast.NotEq)
            and len(test.comparators) == 1
            and isinstance(test.comparators[0], ast.Constant)
            and test.comparators[0].value == "4.2.5"
        )
        if not exact:
            continue
        left = test.left
        left_ok = _is_version_fastmcp_call(left) or (
            isinstance(left, ast.Name) and _name_assigned_from_version(func, left.id)
        )
        raises = any(isinstance(item, ast.Raise) for item in stmt.body)
        if left_ok and raises:
            return True
    return False


def test_version_guard_rejects_anything_but_4_2_5_before_import() -> None:
    """A no-op gate, or one that also accepts 4.2.0, fails this test."""
    tree = _server_tree()
    fastmcp_import = _first_fastmcp_import(tree)
    guard = next(
        stmt
        for stmt in tree.body
        if isinstance(stmt, ast.FunctionDef) and stmt.name == "_require_fastmcp_4_2_5"
    )
    assert guard.lineno < fastmcp_import.lineno
    assert _guard_compares_installed_version(guard)
    called = any(
        isinstance(stmt, ast.Expr)
        and isinstance(stmt.value, ast.Call)
        and isinstance(stmt.value.func, ast.Name)
        and stmt.value.func.id == "_require_fastmcp_4_2_5"
        and stmt.lineno < fastmcp_import.lineno
        for stmt in tree.body
    )
    assert called


def _requirement_names(text: str) -> dict[str, str]:
    logical: list[str] = []
    buffer = ""
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        if line.endswith("\\"):
            buffer = f"{buffer} {line[:-1]}".strip()
            continue
        buffer = f"{buffer} {line}".strip()
        logical.append(buffer)
        buffer = ""
    if buffer:
        logical.append(buffer)
    specs: dict[str, str] = {}
    for line in logical:
        token = line.split()[0]
        if token.startswith("--"):
            continue
        name = token
        for separator in "[<>=!~":
            name = name.split(separator, 1)[0]
        specs[name] = token
    return specs


_FASTMCP_WHEEL_SHA256 = (
    "733f6a59705c4141ad74b1aa889561fbccd2790a74e18c4c72d4b08611746107"
)


def _hashed_requirements(text: str) -> dict[str, tuple[str, set[str]]]:
    logical: list[str] = []
    buffer = ""
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        if line.endswith("\\"):
            buffer = f"{buffer} {line[:-1]}".strip()
            continue
        buffer = f"{buffer} {line}".strip()
        logical.append(buffer)
        buffer = ""
    pinned: dict[str, tuple[str, set[str]]] = {}
    for line in logical:
        token = line.split()[0]
        if token.startswith("--"):
            continue
        name = token
        for separator in "[<>=!~":
            name = name.split(separator, 1)[0]
        hashes = {
            item.removeprefix("--hash=sha256:")
            for item in line.split()
            if item.startswith("--hash=sha256:")
        }
        pinned[name] = (token, hashes)
    return pinned


def test_requirements_hash_pin_fastmcp_and_dependencies() -> None:
    root = Path(server.__file__).resolve().parent
    pinned = _hashed_requirements((root / "requirements.txt").read_text(encoding="utf-8"))
    spec, hashes = pinned["fastmcp"]
    assert spec == "fastmcp==4.2.5"
    assert _FASTMCP_WHEEL_SHA256 in hashes
    slim_spec, slim_hashes = pinned["fastmcp-slim"]
    assert slim_spec.split("==", 1)[1] == "4.2.5"
    assert slim_hashes
    missing = [name for name, (_spec, digests) in pinned.items() if not digests]
    assert missing == []


def test_declared_fastmcp_pin_is_exactly_4_2_5() -> None:
    root = Path(server.__file__).resolve().parent
    pyproject = tomllib.loads((root / "pyproject.toml").read_text(encoding="utf-8"))
    direct = [
        spec
        for spec in pyproject["project"]["dependencies"]
        if spec.split("[", 1)[0].split("=", 1)[0].split("<", 1)[0].split(">", 1)[0].split("!", 1)[0].split("~", 1)[0]
        == "fastmcp"
    ]
    assert direct == ["fastmcp==4.2.5"]
    locked = _requirement_names((root / "requirements.txt").read_text(encoding="utf-8"))
    assert locked["fastmcp"] == "fastmcp==4.2.5"


_NETWORK_TRANSPORTS = frozenset({"http", "sse", "streamable-http"})
_NETWORK_RUNNERS = frozenset(
    {
        "run_http",
        "run_http_async",
        "run_sse_async",
        "run_streamable_http_async",
        "http_app",
    }
)


def _module_constants(tree: ast.Module) -> dict[str, object]:
    values: dict[str, object] = {}
    for stmt in tree.body:
        if (
            isinstance(stmt, ast.Assign)
            and len(stmt.targets) == 1
            and isinstance(stmt.targets[0], ast.Name)
            and isinstance(stmt.value, ast.Constant)
        ):
            values[stmt.targets[0].id] = stmt.value.value
    return values


def _stdio_transport(expr: ast.expr, constants: dict[str, object]) -> str:
    if isinstance(expr, ast.Constant) and isinstance(expr.value, str):
        return expr.value
    if isinstance(expr, ast.Name) and isinstance(constants.get(expr.id), str):
        return str(constants[expr.id])
    raise AssertionError("main() transport is not the stdio constant")


def test_main_stays_on_stdio_without_oauth_proxy() -> None:
    """main() must pass stdio to mcp.run. HTTP, SSE, and OAuthProxy fail this test."""
    text = Path(server.__file__).read_text(encoding="utf-8")
    tree = _server_tree()
    assert not any(isinstance(node, ast.Name) and node.id == "OAuthProxy" for node in ast.walk(tree))
    assert "oauth_proxy" not in text
    constants = _module_constants(tree)
    main = next(
        stmt for stmt in tree.body if isinstance(stmt, ast.FunctionDef) and stmt.name == "main"
    )
    run_calls = [
        node
        for node in ast.walk(main)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr == "run"
    ]
    assert len(run_calls) == 1
    call = run_calls[0]
    assert call.func.attr not in _NETWORK_RUNNERS
    transport_kw = next((kw.value for kw in call.keywords if kw.arg == "transport"), None)
    transport_expr = transport_kw if transport_kw is not None else (call.args[0] if call.args else None)
    assert transport_expr is not None
    assert _stdio_transport(transport_expr, constants) == "stdio"
    assert _stdio_transport(transport_expr, constants) not in _NETWORK_TRANSPORTS
    assert not any(kw.arg in {"host", "port"} for kw in call.keywords)
    assert not any(
        isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and node.func.attr in _NETWORK_RUNNERS
        for node in ast.walk(tree)
    )


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
