#!/usr/bin/env bash
set -euo pipefail

# Simple helper to lowercase and check truthy values
truthy() {
  val="${1:-}"
  lower=$(printf "%s" "$val" | tr '[:upper:]' '[:lower:]')
  case "$lower" in
    true|1|yes|on|y) return 0 ;;
    *) return 1 ;;
  esac
}

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)

# Load local env if present
ENV_FILE="$SCRIPT_DIR/.env.local"
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  . "$ENV_FILE"
else
  echo "[run_servers] .env.local not found in scripts/. Using current environment."
fi

# Defaults
: "${ACTIONS_PORT:=5055}"
: "${RASA_PORT:=5005}"
: "${CORS:=*}"
: "${SUPABASE_ENABLED:=true}"

LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

# Basic checks
if [ ! -x "$ROOT_DIR/venv/bin/rasa" ]; then
  echo "ERROR: Rasa CLI not found at venv/bin/rasa. Ensure virtualenv is set up."
  exit 1
fi

echo "[run_servers] Starting action server on port $ACTIONS_PORT (Supabase enabled: $SUPABASE_ENABLED)"

# Start Action Server (background)
if truthy "$SUPABASE_ENABLED"; then
  if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_KEY:-}" ]; then
    echo "[run_servers] WARNING: SUPABASE_ENABLED=true but SUPABASE_URL/SUPABASE_SERVICE_KEY missing. Starting without Supabase insert."
  fi
fi

nohup env \
  SUPABASE_URL="${SUPABASE_URL:-}" \
  SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY:-}" \
  SUPABASE_ENABLED="${SUPABASE_ENABLED}" \
  RASA_TELEMETRY_ENABLED=false \
  "$ROOT_DIR/venv/bin/rasa" run actions --port "$ACTIONS_PORT" \
  > "$LOG_DIR/actions_server.log" 2>&1 &
ACTIONS_PID=$!

echo "[run_servers] Starting Rasa server on port $RASA_PORT with CORS '$CORS'"
nohup "$ROOT_DIR/venv/bin/rasa" run --enable-api --port "$RASA_PORT" --cors "$CORS" \
  > "$LOG_DIR/rasa_server.log" 2>&1 &
RASA_PID=$!

# Persist PIDs
PID_FILE="$SCRIPT_DIR/server_pids.json"
cat > "$PID_FILE" <<JSON
{
  "actions_pid": $ACTIONS_PID,
  "rasa_pid": $RASA_PID,
  "actions_port": $ACTIONS_PORT,
  "rasa_port": $RASA_PORT,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSON

echo "[run_servers] Action server PID: $ACTIONS_PID (logs: $LOG_DIR/actions_server.log)"
echo "[run_servers] Rasa server PID: $RASA_PID (logs: $LOG_DIR/rasa_server.log)"
echo "[run_servers] PID file: $PID_FILE"
echo "[run_servers] Done."

