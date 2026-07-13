# /feature

Fluxo de desenvolvimento de feature. Auto-dimensionado por complexidade.

**Uso:** `/feature {ID_AZURE_TASK}`

O `{ID_AZURE_TASK}` é o ID da USER STORY ou FEATURE no Azure DevOps.

## Sizing

| Tamanho | Critério | Fluxo |
|---------|---------|-------|
| Small (S) | < 4h, 1 módulo, sem banco | CP1 + Execute direto |
| Medium (M) | 4–16h, até 3 módulos | CP1 → Execute |
| Large (L) | > 16h ou múltiplos módulos com dependências | CP1 → Plano → CP2 → Execute |

## Sequência de Execução

### PASSO 1 — Buscar contexto completo
Execute `_shared/ticket-fetch.md`:
- Busca a task e navega a hierarquia (parents e children)
- Lê comentários, documentos e análise de refinamento (se disponível)
- Extrai SIM/PSE e contexto de negócio

### PASSO 2 — Especificação e sizing
Consulte `.speckit/` para contexto relevante e proponha:
- Entendimento da solicitação
- Escopo: arquivos a criar/alterar
- Sizing (S/M/L) com justificativa
- Riscos e dependências

### ⚡ CHECKPOINT 1 — ESCOPO APROVADO
Aguarde aprovação antes de qualquer código.

### PASSO 3 — Plano de tasks (apenas L)
Se Large: decomponha em tasks atômicas com dependências. Apresente ao dev.

### ⚡ CHECKPOINT 2 — PLANO APROVADO (apenas L)

### PASSO 4 — Execute
O `builder-agent` para cada task:
1. Coleta sigla do módulo e dados para commit (se não informados ainda, pergunta ao dev uma vez)
2. Propõe branch no padrão Praxio
3. RED → GREEN → VERIFY
4. Commit no formato: `feat: SIGLA_SIM_NUMERO #{ID_US}\n\ndesc\n\nUS: #{ID_FEATURE}`
5. Discoveries fora do escopo → Deferred

### PASSO 5 — PR e fechamento de dev
`/run-regression {ID}` → `/open-pr {ID}`

O `pr-generator` cria o PR com título e descrição no padrão Praxio e preenche a task de fechamento de desenvolvimento no Azure.

### PASSO 6 — Release
`/release-check {ID}` → learning-agent → task fechada no Azure.
