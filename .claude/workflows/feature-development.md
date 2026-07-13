# Feature Development Flow — Praxio

Fluxo para desenvolvimento de features originadas de tasks do Azure DevOps (USER STORY ou FEATURE com SIM/PSE associado).

## Sizing

| Tamanho | Critério |
|---------|---------|
| S | < 4h, 1 módulo, sem banco |
| M | 4–16h, até 3 módulos |
| L | > 16h ou múltiplos módulos com dependências |

## Fluxo Small/Medium

```
/feature {ID}
  └── ticket-fetch: task + hierarquia + comentários de refinamento (se houver)
  └── Especificação: entendimento do SIM/PSE + escopo + sizing
  └── ⚡ CHECKPOINT 1 (dev aprova escopo)
  └── builder-agent:
      - confirma sigla do módulo (uma vez, usada em todos os commits)
      - propõe branch: feature/{SIGLA}_{SIM|PSE}_{N}
      - RED → GREEN por task
      - commits: feat: {SIGLA}_{SIM|PSE}_{N} #{ID_US}\ndesc\nUS: #{ID_FEATURE}
  └── test-validator
  └── /open-pr {ID} → /release-check {ID}
```

## Fluxo Large

```
/feature {ID}
  └── ticket-fetch + Especificação
  └── ⚡ CHECKPOINT 1 (dev aprova escopo)
  └── Decomposição em tasks atômicas com dependências
  └── ⚡ CHECKPOINT 2 (dev aprova plano)
  └── [Para cada task: builder-agent RED→GREEN + commit no formato Praxio]
  └── test-validator (cobertura integrada)
  └── /open-pr {ID} → /release-check {ID}
```

## Aproveitamento do Refinamento

Se a task já foi analisada pelo `/refine-card` na cerimônia de refinamento, os comentários postados no Azure estarão disponíveis via ticket-fetch. O agente lê esses comentários e usa como base para a especificação — evitando análise duplicada.

## Regras

- Sempre consulte `.speckit/` antes de propor escopo.
- Sigla do módulo: perguntada ao dev uma única vez e reutilizada em todos os commits e no branch.
- Discoveries fora do escopo: sempre Deferred, nunca implementadas no ticket atual.
- Task de fechamento de desenvolvimento: preenchida pelo `pr-generator` ao criar o PR.
