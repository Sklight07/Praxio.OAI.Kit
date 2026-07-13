# /update-speckit

Atualiza o Speckit com mudanças recentes do repositório.

**Uso:** `/update-speckit [--since YYYY-MM-DD]`

## Sequência de Execução

### PASSO 1 — Executar script
`scripts/update-speckit.sh [--since DATA]`

O script coleta:
- Novos hotspots do git desde a data.
- Novos TODOs/FIXMEs adicionados.
- Work items fechados no ADO (via az CLI).
- Mudanças em configs/integrações.

### PASSO 2 — Analisar e atualizar
Com base nos dados coletados, atualize:
- `.speckit/known-issues/known-issues.md` (novos padrões de bug detectados)
- `.speckit/architecture/risk-map.md` (hotspots alterados)
- `.speckit/incidents/speckit-updates.md` (changelog)

### PASSO 3 — Relatório
Informe o que foi atualizado e o que ainda está marcado como `[DRAFT]`.
