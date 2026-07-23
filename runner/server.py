#!/usr/bin/env python3
"""Lokal script-runner til Drone Fotos.

Binder kun til 127.0.0.1. Kører foruddefinerede scripts — ikke vilkårlig kode.
Start med: ./start-runner.sh
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

HOST = "127.0.0.1"
PORT = 8787
ROOT = Path(__file__).resolve().parent
SCRIPTS_DIR = ROOT.parent / "scripts"
PROJECT_ROOT = ROOT.parent
COPY_DOWNLOADS_SH = (
    PROJECT_ROOT.parent / "CopyDownloadsToKingston" / "copy-downloads.sh"
)

# Kun disse ID'er kan køres
SCRIPTS = {
    "gem-link": {
        "title": "Gem Chrome-link i Noter",
        "type": "applescript",
        "path": SCRIPTS_DIR / "gem-link.applescript",
    },
    "copy-downloads": {
        "title": "Copy Downloads to Backup",
        "type": "shell",
        "path": COPY_DOWNLOADS_SH,
    },
    "nas-backup": {
        "title": "NAS Backup (én gang)",
        "type": "applescript",
        "path": SCRIPTS_DIR / "nas-backup-once.applescript",
    },
}

ALLOWED_ORIGINS = {
    "http://127.0.0.1:8766",
    "http://localhost:8766",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://jezzdk1982.github.io",
}


def cors_origin(origin: str | None) -> str | None:
    if not origin:
        return None
    if origin in ALLOWED_ORIGINS:
        return origin
    if origin.startswith("http://127.0.0.1:") or origin.startswith("http://localhost:"):
        return origin
    if origin.startswith("https://jezzdk1982.github.io"):
        return origin
    return None


def run_script(script_id: str) -> tuple[int, str]:
    spec = SCRIPTS.get(script_id)
    if not spec:
        return 404, f"Ukendt script: {script_id}"

    path = Path(spec["path"])
    if not path.exists():
        return 404, f"Fil mangler: {path}"

    try:
        if spec["type"] == "applescript":
            result = subprocess.run(
                ["osascript", str(path)],
                capture_output=True,
                text=True,
                timeout=120,
            )
        elif spec["type"] == "shell":
            result = subprocess.run(
                ["/bin/bash", str(path)],
                capture_output=True,
                text=True,
                timeout=300,
            )
        else:
            return 500, "Ukendt script-type"
    except subprocess.TimeoutExpired:
        return 504, "Scriptet tog for lang tid"
    except Exception as exc:  # noqa: BLE001
        return 500, str(exc)

    if result.returncode != 0:
        err = (result.stderr or result.stdout or "Ukendt fejl").strip()
        return 500, err

    out = (result.stdout or "").strip()
    return 200, out or f"{spec['title']} er kørt."


class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, payload: dict, origin: str | None = None) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        allowed = cors_origin(origin)
        if allowed:
            self.send_header("Access-Control-Allow-Origin", allowed)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:  # noqa: N802
        origin = self.headers.get("Origin")
        self.send_response(204)
        allowed = cors_origin(origin)
        if allowed:
            self.send_header("Access-Control-Allow-Origin", allowed)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        origin = self.headers.get("Origin")
        path = urlparse(self.path).path
        if path in ("/", "/health"):
            self._send(
                200,
                {
                    "ok": True,
                    "service": "drone-fotos-script-runner",
                    "scripts": list(SCRIPTS.keys()),
                },
                origin,
            )
            return
        self._send(404, {"ok": False, "error": "Not found"}, origin)

    def do_POST(self) -> None:  # noqa: N802
        origin = self.headers.get("Origin")
        path = urlparse(self.path).path
        if not path.startswith("/run/"):
            self._send(404, {"ok": False, "error": "Not found"}, origin)
            return

        script_id = path.removeprefix("/run/").strip("/")
        code, message = run_script(script_id)
        self._send(
            code,
            {
                "ok": code == 200,
                "script": script_id,
                "message": message,
            },
            origin,
        )

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("[runner] " + (fmt % args) + "\n")


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Script-runner kører på http://{HOST}:{PORT}")
    print("Tilgængelige scripts:", ", ".join(SCRIPTS.keys()))
    print("Stop med Ctrl+C")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStoppet.")


if __name__ == "__main__":
    main()
