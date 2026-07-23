#!/bin/bash
# Start lokal script-runner til Kør-knapperne på Drone Fotos
cd "$(dirname "$0")"
exec python3 server.py
