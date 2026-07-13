# /analyze-bug

Inicia o fluxo de investigação de bug para a task informada.

**Uso:** `/analyze-bug {ID_AZURE_TASK}`

O `{ID_AZURE_TASK}` é o número da USER STORY ou FEATURE no Azure DevOps (ex: `54841`). Não é o número do SIM/PSE.

## Sequência de Execução

### PASSO 1 — Inicializar workspace
Crie `.oai-flow/analysis/{ID}-timeline.json` com evento `workspace_initialized`.

### PASSO 2 — Buscar contexto completo da task
Execute o protocolo `_shared/ticket-fetch.md`:
- Busca a task pelo ID Azure
- Navega para parents (FEATURE, EPIC) e children
- Extrai SIM/PSE da hierarquia
- Lê todos os comentários, documentos e anotações disponíveis (incluindo análise do refinamento, se houver)

### PASSO 3 — Invocar bug-investigator
O agente `bug-investigator`:
- Consulta Speckit
- Formula e investiga hipóteses
- Determina root cause com arquivo:linha

### PASSO 4 — Invocar impact-analyzer
O agente `impact-analyzer` mapeia o blast radius e classifica o risco.

### ⚡ CHECKPOINT 1 — PARE AQUI
Apresente ao dev:
- Root cause com evidência de código
- Blast radius e classificação de risco
- Janela de deploy recomendada

**Aguarde aprovação explícita antes de sugerir `/generate-fix {ID}`.**
