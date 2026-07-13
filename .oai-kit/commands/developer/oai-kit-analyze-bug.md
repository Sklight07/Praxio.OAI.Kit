# /oai-kit-analyze-bug

Investiga o root cause de um bug com evidências de código e mapeia o blast radius.

**Uso:** `/oai-kit-analyze-bug {ID_AZURE_TASK}`

## Sequência de Execução

### PASSO 1 — Buscar contexto da task

Execute o protocolo `_shared/oai-kit-ticket-fetch.md` para obter o contexto completo da task e hierarquia.

### PASSO 2 — Invocar oai-kit-bug-investigator

O agente `oai-kit-bug-investigator`:
- Consulta o Speckit (known-issues, diagnostic-guide, naming-guide, risk-map, system-overview)
- Formula hipóteses antes de buscar código
- Determina root cause com arquivo:linha obrigatório
- Gera `.oai-flow/analysis/{ID}-bugreport.md`

### PASSO 3 — Invocar oai-kit-impact-analyzer

O agente `oai-kit-impact-analyzer`:
- Lê o BugReport gerado
- Mapeia impacto direto, indireto, banco, integrações e outros repos
- Classifica risco (CRÍTICO / ALTO / MÉDIO / BAIXO)
- Gera `.oai-flow/analysis/{ID}-impact.md`

### ⚡ CHECKPOINT 1 — PARE AQUI

Apresente o BugReport + ImpactReport ao dev.
**Só prossiga para `/oai-kit-generate-fix {ID}` após aprovação explícita.**
