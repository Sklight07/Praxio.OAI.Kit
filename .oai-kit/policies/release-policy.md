# Política: Release Policy

Verificada pelo `oai-kit-release-agent` em todo `/oai-kit-release-check`.

## Janelas de Release Padrão

| Dia | Janela | Observação |
|-----|--------|-----------|
| Segunda | 10h–16h | Evitar início do dia |
| Terça–Quinta | 09h–17h | Janela padrão |
| Sexta | 09h–12h | Apenas hotfix P1/P2 após 12h |
| Sábado–Domingo | ❌ | Sem deploy |

## Aprovações por Severidade

| Prioridade | Aprovação mínima | Fast-track |
|-----------|-----------------|-----------|
| P1 | Tech lead | Sim — fora de janela permitido |
| P2 | Dev + tech lead | Não |
| P3 | Dev | Não |
| P4 | Dev | Não |

## Quality Gates Obrigatórios

Todos devem estar verdes antes do deploy:
- [ ] PR aprovado no ADO
- [ ] Pipeline de CI passou
- [ ] Dentro da janela de release (ou fast-track autorizado)
- [ ] Aprovações necessárias obtidas

## Freeze Periods

Configurável em `.claude/.local-config.json`:
```json
"releasePolicy": {
  "freezePeriods": [
    { "start": "2026-12-20", "end": "2027-01-05", "reason": "Recesso" }
  ]
}
```

Durante freeze: apenas P1 com aprovação do tech lead.
