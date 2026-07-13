# Small Improvement Flow

Fluxo simplificado para melhorias P3/P4 sem risco significativo.

## Critérios de Elegibilidade

Use este fluxo apenas se TODOS forem verdadeiros:
- Prioridade P3 ou P4.
- 1 arquivo alterado (ou no máximo 2 muito relacionados).
- Sem mudança de banco ou integração externa.
- Sem impacto em módulo classificado como ALTO no risk-map.

Se qualquer critério falhar → use o bug-flow ou feature-development.

## Fluxo

```
/analyze-bug {ID} (versão simplificada)
  └── ticket-fetch
  └── bug-investigator (hipóteses + root cause)
  └── ⚡ CHECKPOINT 1

/generate-fix {ID}
  └── builder-agent (sem architecture-agent)
  └── test-validator (validação básica)
  └── /open-pr → /release-check
```

## Diferenças do Bug Flow Completo

- Sem impact-analyzer (impacto é trivial por definição).
- Sem architecture-agent.
- Rollback plan simplificado (revert do commit).
- Aprovação de deploy: apenas o dev.

## Escalada Automática

Se durante a investigação surgir qualquer um:
- Root cause mais profunda que o esperado
- Impacto em banco ou integração
- Necessidade de alterar arquivo ALTO no risk-map

→ Pare, informe o dev e escale para o bug-flow completo.
