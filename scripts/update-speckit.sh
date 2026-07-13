#!/usr/bin/env bash
# update-speckit.sh — atualiza o Speckit com mudanças recentes do repositório
# Uso: ./scripts/update-speckit.sh [--since YYYY-MM-DD]

set -euo pipefail

REPO_ROOT="${REPO_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
SPECKIT_DIR="$REPO_ROOT/.speckit"
SINCE="${2:-$(date -d '30 days ago' +%Y-%m-%d 2>/dev/null || date -v-30d +%Y-%m-%d)}"
TODAY=$(date +%Y-%m-%d)

echo "🔄 OAI Kit — Update Speckit (desde $SINCE)"
echo ""

# Novos hotspots
echo "📊 Novos hotspots desde $SINCE..."
NEW_HOTSPOTS=$(git -C "$REPO_ROOT" log --pretty=format: --name-only \
  --since="$SINCE" 2>/dev/null \
  | grep -v "^$" \
  | grep -E "\.(cs|ts|tsx|js)$" \
  | sort | uniq -c | sort -rn \
  | head -10)

if [ -n "$NEW_HOTSPOTS" ]; then
  echo "   Arquivos mais alterados no período:"
  echo "$NEW_HOTSPOTS" | while read -r line; do echo "     $line"; done
fi

# Novos TODOs adicionados
echo ""
echo "🔎 Novos TODOs/FIXMEs adicionados..."
NEW_TODOS=$(git -C "$REPO_ROOT" log --since="$SINCE" -p 2>/dev/null \
  | grep "^+" | grep -iE "TODO|FIXME|HACK" \
  | grep -v "^+++" | head -10)

# Mudanças em configs
echo ""
echo "⚙️  Mudanças em configurações..."
CONFIG_CHANGES=$(git -C "$REPO_ROOT" log --since="$SINCE" --name-only \
  --pretty=format: 2>/dev/null \
  | grep -E "\.(json|xml|config|env|yml|yaml)$" \
  | grep -v node_modules | sort -u | head -10)

# Atualizar speckit-updates.md
UPDATES_FILE="$SPECKIT_DIR/incidents/speckit-updates.md"
{
  echo ""
  echo "## $TODAY — /update-speckit"
  if [ -n "$NEW_HOTSPOTS" ]; then
    echo "- risk-map: novos hotspots detectados (ver abaixo)"
  fi
  if [ -n "$NEW_TODOS" ]; then
    echo "- known-issues: novos TODOs detectados"
  fi
  if [ -n "$CONFIG_CHANGES" ]; then
    echo "- architecture-overview: mudanças em configs: $CONFIG_CHANGES"
  fi
} >> "$UPDATES_FILE"

echo ""
echo "✅ Speckit atualizado!"
echo ""
echo "Revise manualmente:"
echo "  - .speckit/architecture/risk-map.md (novos hotspots)"
echo "  - .speckit/known-issues/known-issues.md (novos padrões)"
echo ""
echo "💡 Sugestão: execute /update-speckit semanalmente ou após cada sprint."
