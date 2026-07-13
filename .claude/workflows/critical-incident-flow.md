# Critical Incident Flow (P1)

Fluxo acelerado para incidentes P1 em produção. As políticas não são suspensas.

## Fases

### Fase 1 — Contenção (objetivo: 15 minutos)

1. Identifique o sintoma e o módulo afetado.
2. Verifique `.speckit/known-issues/known-issues.md` — já foi visto antes?
3. Decida: rollback imediato ou workaround temporário?
4. Comunique o status ao tech lead.

### Fase 2 — Fix Definitivo (bug-flow acelerado)

```
bug-investigator → ⚡ CP1 → builder-agent → test-validator → /open-pr
```

Fast-track de PR: aprovação única do tech lead.
Fast-track de release: deploy imediato após PR aprovado.

### Fase 3 — Post-Mortem

Após estabilização:
1. Acione `learning-agent`.
2. Gere post-mortem em `.speckit/incidents/P1-{ID}-{SIGLA}_{SIM|PSE}_{N}-postmortem.md`:
   - Timeline do incidente
   - Root cause
   - Ação imediata vs fix definitivo
   - O que o Speckit deveria ter dito e não disse
   - Ações preventivas

## Regras Inegociáveis (válidas mesmo em P1)

- Nunca acesse produção diretamente.
- Nunca pule RED→GREEN.
- Nunca faça deploy sem aprovação do tech lead.
- Learning-agent é obrigatório após estabilização.
