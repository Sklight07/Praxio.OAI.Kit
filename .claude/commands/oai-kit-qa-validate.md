# /oai-kit-qa-validate

Valida se os critérios de aceite de uma US foram implementados no PR associado.

**Uso:** `/oai-kit-qa-validate {ID_AZURE_TASK}`

## Sequência de Execução

### PASSO 1 — Invocar oai-kit-acceptance-validator

O agente `oai-kit-acceptance-validator`:
- Busca critérios de aceite da US no Azure DevOps
- Lê os arquivos alterados no PR associado
- Cruza cada critério com as evidências de código
- Classifica: ✅ Implementado / ⚠️ Parcial / ❌ Ausente / ❓ Não verificável

### PASSO 2 — Resultado

O QA recebe relatório detalhado indicando onde focar os testes, especialmente nos critérios ausentes ou parciais.
