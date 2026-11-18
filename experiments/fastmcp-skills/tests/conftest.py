"""Keep catalog tests from opening a connection."""

from __future__ import annotations

import socket

import pytest


@pytest.fixture(autouse=True)
def refuse_network(monkeypatch: pytest.MonkeyPatch) -> None:
    """Fail the test if client code tries to open a socket."""

    def refuse(*_args: object, **_kwargs: object) -> None:
        raise AssertionError("offline test attempted a socket connection")

    monkeypatch.setattr(socket, "create_connection", refuse)
    monkeypatch.setattr(socket.socket, "connect", refuse)
    monkeypatch.setattr(socket.socket, "connect_ex", refuse)
