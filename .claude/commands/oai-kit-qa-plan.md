# /oai-kit-qa-plan

Cria ou atualiza um plano de testes no Azure DevOps para uma User Story.

**Uso:** `/oai-kit-qa-plan {ID_AZURE_TASK}`

O `{ID_AZURE_TASK}` é o ID da USER STORY no Azure DevOps.

## Sequência de Execução

### PASSO 1 — Invocar oai-kit-qa-planner

O agente `oai-kit-qa-planner`:
1. Pergunta se é **Refinamento** (sem PR) ou **Execução** (com PR)
2. Pergunta se é **novo plano** ou **atualização** de plano existente
3. Coleta dados necessários (US, PR, responsável QA, área, sprint)
4. Executa a **validação de consistência OAI Kit** — cruza critérios de aceite vs cobertura
5. Gera o plano de testes estruturado com CTs numerados

### PASSO 2 — Salvar no Azure (quando confirmado)

Após o QA aprovar o plano:
- Cria cada CT como Test Case individual via MCP
- Preenche Steps em XML (`Microsoft.VSTS.TCM.Steps`)
- Exibe links dos Test Cases criados

> **Nota:** Se o MCP não suportar criação de Test Cases, o agente exibe o plano completo para criação manual no Azure DevOps Test Plans.
