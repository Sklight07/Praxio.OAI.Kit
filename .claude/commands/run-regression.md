# /run-regression

Valida a suíte de testes após o patch.

**Uso:** `/run-regression {ID_AZURE_TASK}`

## Sequência de Execução

### PASSO 1 — Verificar pré-condições
- `.oai-flow/delivery/{ID}-patch.md` existe?
- Checkpoint 2 aprovado?

### PASSO 2 — Invocar test-validator
O agente `test-validator`:
- Confirma RED→GREEN executado pelo builder-agent
- Executa gate check completo do projeto
- Escreve testes complementares (edge cases, cenários do ImpactReport)
- Verifica qualidade das assertions

### PASSO 3 — Resultado
Se ValidationReport = APROVADO → sugira `/open-pr {ID}`.
Se REPROVADO → retorne ao builder-agent com o relatório de falhas.
