# /oai-kit-qa-regression

Analisa o impacto de um PR e gera um plano de regressão indicando quais suítes executar.

**Uso:** `/oai-kit-qa-regression {NUMERO_PR}` ou `/oai-kit-qa-regression {ID_AZURE_TASK}`

## Sequência de Execução

### PASSO 1 — Invocar oai-kit-regression-planner

O agente `oai-kit-regression-planner`:
- Busca os arquivos alterados no PR via MCP
- Consulta base de conhecimento em `.oai-kit/knowledge/qa/test-suites/` e `processes/`
- Mapeia quais funcionalidades foram tocadas pelo PR
- Classifica risco de regressão por área (CRÍTICO / ALTO / MÉDIO / BAIXO)
- Gera plano de regressão com suítes recomendadas e estimativa de esforço

### PASSO 2 — Resultado

O QA recebe o plano de regressão priorizado para executar antes da aprovação do PR.
