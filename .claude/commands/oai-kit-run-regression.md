# /oai-kit-run-regression

Valida a suíte de testes após o patch.

**Uso:** `/oai-kit-run-regression {ID_AZURE_TASK}`

## Sequência de Execução

### PASSO 1 — Verificar pré-condições
- `.oai-flow/delivery/{ID}-patch.md` existe?
- Checkpoint 2 aprovado?

### PASSO 2 — Invocar oai-kit-test-validator

O agente `oai-kit-test-validator`:
- Confirma RED→GREEN executado pelo oai-kit-builder-agent
- Executa gate check completo do projeto
- Escreve testes complementares (edge cases, cenários do ImpactReport)
- Verifica qualidade das assertions

### PASSO 3 — Resultado

Se ValidationReport = APROVADO → sugira `/oai-kit-open-pr {ID}`.
Se REPROVADO → retorne ao oai-kit-builder-agent com o relatório de falhas.
