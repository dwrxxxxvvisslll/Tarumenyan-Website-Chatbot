#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
PID_FILE="$SCRIPT_DIR/server_pids.json"

if [ ! -f "$PID_FILE" ]; then
  echo "[stop_servers] PID file not found at $PID_FILE. Nothing to stop."
  exit 0
fi

actions_pid=$(grep -E '"actions_pid"' "$PID_FILE" | sed -E 's/[^0-9]*([0-9]+).*/\1/')
rasa_pid=$(grep -E '"rasa_pid"' "$PID_FILE" | sed -E 's/[^0-9]*([0-9]+).*/\1/')

stop_pid() {
  local pid=$1
  local name=$2
  if [ -z "$pid" ]; then
    echo "[stop_servers] $name PID is empty, skipping."
    return 0
  fi
  if kill -0 "$pid" >/dev/null 2>&1; then
    echo "[stop_servers] Stopping $name (PID $pid)"
    kill -TERM "$pid" || true
    # wait up to ~5s
    for i in 1 2 3 4 5; do
      if kill -0 "$pid" >/dev/null 2>&1; then
        sleep 1
      else
        break
      fi
    done
    if kill -0 "$pid" >/dev/null 2>&1; then
      echo "[stop_servers] $name still running. Forcing stop (SIGKILL)."
      kill -KILL "$pid" || true
    fi
  else
    echo "[stop_servers] $name (PID $pid) is not running."
  fi
}

stop_pid "$actions_pid" "Action server"
stop_pid "$rasa_pid" "Rasa server"

rm -f "$PID_FILE"
echo "[stop_servers] Done."

