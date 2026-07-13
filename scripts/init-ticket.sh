#!/usr/bin/env bash
# init-ticket.sh — inicializa o workspace de um ticket
# Uso: ./scripts/init-ticket.sh ADO-NNN

set -euo pipefail

TICKET_ID="${1:-}"
if [ -z "$TICKET_ID" ]; then
  echo "Uso: init-ticket.sh ADO-NNN"
  exit 1
fi

REPO_ROOT="${REPO_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
FLOW_DIR="$REPO_ROOT/.oai-flow"

mkdir -p "$FLOW_DIR/analysis" "$FLOW_DIR/design" "$FLOW_DIR/delivery" "$FLOW_DIR/discovery"

TIMELINE="$FLOW_DIR/analysis/${TICKET_ID}-timeline.json"
if [ ! -f "$TIMELINE" ]; then
  cat > "$TIMELINE" <<EOF
{
  "ticket_id": "$TICKET_ID",
  "events": [
    {"event": "workspace_initialized", "at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
  ]
}
EOF
  echo "✓ Workspace inicializado para $TICKET_ID"
else
  echo "✓ Workspace já existe para $TICKET_ID"
fi
