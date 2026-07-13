# /oai-kit-refine-card

Analisa uma task do Azure DevOps durante o refinamento e posta contexto técnico como comentário.

**Uso:** `/oai-kit-refine-card {ID_AZURE_TASK}`

## Sequência de Execução

### PASSO 1 — Invocar oai-kit-azure-card-refiner

O agente `oai-kit-azure-card-refiner`:
- Busca a task e navega a hierarquia (parents + children)
- Identifica o tipo de trabalho (dev ou não-dev)
- Realiza análise técnica com base no código do repositório
- Apresenta análise para aprovação

### PASSO 2 — Postar no Azure

Após aprovação do dev:
- Posta como comentário na task via MCP (`mcp__azure-devops__wit_add_comment`)
- Adiciona tag `refinado-oai` na task
- Grava briefing local se configurado
