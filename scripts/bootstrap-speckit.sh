#!/usr/bin/env bash
# bootstrap-speckit.sh — análise estática do repositório para popular o Speckit inicial
# Uso: ./scripts/bootstrap-speckit.sh [--stack dotnet|node|react]

set -euo pipefail

REPO_ROOT="${REPO_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
SPECKIT_DIR="$REPO_ROOT/.speckit"
STACK="${2:-auto}"
DRAFT_COUNT=0

echo "🔍 OAI Kit — Bootstrap Speckit"
echo "   Repositório: $REPO_ROOT"
echo ""

# ── Fase 1: Análise Estrutural ──────────────────────────────────────────────

echo "📁 Fase 1: Estrutura do repositório..."

# Estrutura de pastas (3 níveis)
STRUCTURE=$(find "$REPO_ROOT" -maxdepth 3 \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/.speckit/*" \
  -not -path "*/.oai-flow/*" \
  -not -path "*/bin/*" \
  -not -path "*/obj/*" \
  -not -path "*/dist/*" \
  -type d 2>/dev/null | head -50)

# Detecção de stack
if [ "$STACK" = "auto" ]; then
  if find "$REPO_ROOT" -name "*.csproj" -maxdepth 4 | grep -q .; then
    STACK="dotnet"
  elif find "$REPO_ROOT" -name "package.json" -not -path "*/node_modules/*" -maxdepth 3 | grep -q .; then
    if find "$REPO_ROOT" -name "angular.json" -maxdepth 3 | grep -q .; then
      STACK="angular"
    else
      STACK="node"
    fi
  fi
fi

echo "   Stack detectada: $STACK"

# Hotspots do git
echo ""
echo "📊 Fase 2: Análise de histórico git..."

HOTSPOTS=""
if git -C "$REPO_ROOT" log --oneline -1 &>/dev/null; then
  HOTSPOTS=$(git -C "$REPO_ROOT" log --pretty=format: --name-only \
    --since="6 months ago" 2>/dev/null \
    | grep -v "^$" \
    | sort | uniq -c | sort -rn \
    | head -20)
fi

# TODOs e HACKs
echo ""
echo "🔎 Fase 3: Análise de código..."

TODOS=$(grep -rn "TODO\|FIXME\|HACK\|XXX" "$REPO_ROOT" \
  --include="*.cs" --include="*.ts" --include="*.tsx" --include="*.js" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=bin --exclude-dir=obj \
  2>/dev/null | head -30)

# SQL concatenado (aviso AP-002)
SQL_CONCAT=$(grep -rn '".*SELECT\|".*INSERT\|".*UPDATE\|".*DELETE' "$REPO_ROOT" \
  --include="*.cs" --include="*.ts" --include="*.js" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=bin --exclude-dir=obj \
  2>/dev/null | grep -v "//\|param\|@\|\?" | head -10)

# Catches vazios
EMPTY_CATCH=$(grep -rn "catch.*{}" "$REPO_ROOT" \
  --include="*.cs" --include="*.ts" \
  --exclude-dir=node_modules --exclude-dir=.git \
  2>/dev/null | head -10)

# ── Fase 4: Geração do Speckit ───────────────────────────────────────────────

echo ""
echo "📝 Fase 4: Gerando Speckit..."

mkdir -p "$SPECKIT_DIR/domain" "$SPECKIT_DIR/architecture" \
         "$SPECKIT_DIR/known-issues" "$SPECKIT_DIR/decisions" \
         "$SPECKIT_DIR/business-rules" "$SPECKIT_DIR/incidents"

# system-overview.md — só cria se não existir
if [ ! -f "$SPECKIT_DIR/domain/system-overview.md" ]; then
  cp "$(dirname "$0")/../.speckit/domain/system-overview.md" \
     "$SPECKIT_DIR/domain/system-overview.md" 2>/dev/null || true
  echo "   ✓ system-overview.md criado (preencha os [DRAFT]s)"
  DRAFT_COUNT=$((DRAFT_COUNT + 8))
fi

# diagnostic-guide.md
if [ ! -f "$SPECKIT_DIR/domain/diagnostic-guide.md" ]; then
  cp "$(dirname "$0")/../.speckit/domain/diagnostic-guide.md" \
     "$SPECKIT_DIR/domain/diagnostic-guide.md" 2>/dev/null || true
  echo "   ✓ diagnostic-guide.md criado"
fi

# architecture-overview.md
if [ ! -f "$SPECKIT_DIR/architecture/architecture-overview.md" ]; then
  cp "$(dirname "$0")/../.speckit/architecture/architecture-overview.md" \
     "$SPECKIT_DIR/architecture/architecture-overview.md" 2>/dev/null || true
  echo "   ✓ architecture-overview.md criado (preencha os [DRAFT]s)"
  DRAFT_COUNT=$((DRAFT_COUNT + 5))
fi

# risk-map.md
if [ ! -f "$SPECKIT_DIR/architecture/risk-map.md" ]; then
  cp "$(dirname "$0")/../.speckit/architecture/risk-map.md" \
     "$SPECKIT_DIR/architecture/risk-map.md" 2>/dev/null || true
  if [ -n "$HOTSPOTS" ]; then
    echo "" >> "$SPECKIT_DIR/architecture/risk-map.md"
    echo "## Hotspots Detectados (últimos 6 meses)" >> "$SPECKIT_DIR/architecture/risk-map.md"
    echo '```' >> "$SPECKIT_DIR/architecture/risk-map.md"
    echo "$HOTSPOTS" >> "$SPECKIT_DIR/architecture/risk-map.md"
    echo '```' >> "$SPECKIT_DIR/architecture/risk-map.md"
    echo "   ✓ risk-map.md criado com $( echo "$HOTSPOTS" | wc -l | tr -d ' ') hotspots detectados"
  else
    echo "   ✓ risk-map.md criado"
    DRAFT_COUNT=$((DRAFT_COUNT + 3))
  fi
fi

# anti-patterns.md (inclui AP detectados)
if [ ! -f "$SPECKIT_DIR/known-issues/anti-patterns.md" ]; then
  cp "$(dirname "$0")/../.speckit/known-issues/anti-patterns.md" \
     "$SPECKIT_DIR/known-issues/anti-patterns.md" 2>/dev/null || true
fi

if [ -n "$SQL_CONCAT" ]; then
  echo "" >> "$SPECKIT_DIR/known-issues/anti-patterns.md"
  echo "## ⚠️  SQL Concatenado Detectado (AP-002)" >> "$SPECKIT_DIR/known-issues/anti-patterns.md"
  echo "" >> "$SPECKIT_DIR/known-issues/anti-patterns.md"
  echo "Os seguintes locais podem ter SQL construído por concatenação — verificar:" >> "$SPECKIT_DIR/known-issues/anti-patterns.md"
  echo '```' >> "$SPECKIT_DIR/known-issues/anti-patterns.md"
  echo "$SQL_CONCAT" >> "$SPECKIT_DIR/known-issues/anti-patterns.md"
  echo '```' >> "$SPECKIT_DIR/known-issues/anti-patterns.md"
  echo "   ⚠️  SQL concatenado suspeito detectado — verifique anti-patterns.md"
fi

# Demais arquivos
for f in known-issues.md gray-zones.md; do
  if [ ! -f "$SPECKIT_DIR/known-issues/$f" ]; then
    cp "$(dirname "$0")/../.speckit/known-issues/$f" \
       "$SPECKIT_DIR/known-issues/$f" 2>/dev/null || true
    DRAFT_COUNT=$((DRAFT_COUNT + 1))
  fi
done

[ ! -f "$SPECKIT_DIR/decisions/adr-registry.md" ] && \
  cp "$(dirname "$0")/../.speckit/decisions/adr-registry.md" \
     "$SPECKIT_DIR/decisions/adr-registry.md" 2>/dev/null || true

[ ! -f "$SPECKIT_DIR/business-rules/business-rules.md" ] && \
  cp "$(dirname "$0")/../.speckit/business-rules/business-rules.md" \
     "$SPECKIT_DIR/business-rules/business-rules.md" 2>/dev/null || true

[ ! -f "$SPECKIT_DIR/incidents/metrics-feed.jsonl" ] && \
  touch "$SPECKIT_DIR/incidents/metrics-feed.jsonl"

[ ! -f "$SPECKIT_DIR/incidents/speckit-updates.md" ] && \
  cp "$(dirname "$0")/../.speckit/incidents/speckit-updates.md" \
     "$SPECKIT_DIR/incidents/speckit-updates.md" 2>/dev/null || true

# ── Relatório Final ──────────────────────────────────────────────────────────

echo ""
echo "✅ Bootstrap concluído!"
echo ""

if [ $DRAFT_COUNT -ge 10 ]; then
  echo "⚠️  $DRAFT_COUNT campos [DRAFT] detectados."
  echo "   Recomendação: sessão de 30min com o dev sênior do projeto"
  echo "   para preencher os campos críticos do Speckit."
else
  echo "   $DRAFT_COUNT campos [DRAFT] restantes para preenchimento manual."
fi

echo ""
echo "Próximos passos:"
echo "  1. Preencha os [DRAFT]s em .speckit/domain/system-overview.md"
echo "  2. Revise os hotspots em .speckit/architecture/risk-map.md"
echo "  3. /refine-card ADO-NNN  →  refine seu primeiro card"
