# Bug Flow — Praxio

Fluxo completo para correção de bugs com 4 checkpoints humanos.

## Identificadores

- `{ID}` = ID numérico da USER STORY ou FEATURE no Azure DevOps
- `{SIGLA}` = sigla do módulo (ex: FLP, CGS) — sempre confirmada com o dev
- `{SIM|PSE}_{N}` = tipo e número da solicitação SAC

## Fluxo

```
/analyze-bug {ID}
  └── ticket-fetch: busca task + hierarquia (EPIC → FEATURE → USER STORY) + SIM/PSE
  └── bug-investigator  → .oai-flow/analysis/{ID}-bugreport.md
  └── impact-analyzer   → .oai-flow/analysis/{ID}-impact.md
  └── ⚡ CHECKPOINT 1 (dev aprova root cause + estratégia)

/generate-fix {ID}
  └── [architecture-agent]  → .oai-flow/design/{ID}-arch-guidance.md (condicional)
  └── builder-agent:
      - confirma sigla do módulo com o dev
      - propõe branch: feature/{SIGLA}_{SIM|PSE}_{N} ou hotfix/{SIGLA}_{SIM|PSE}_{N}
      - RED → GREEN → VERIFY
      - commit: fix: {SIGLA}_{SIM|PSE}_{N} #{ID_US}\ndesc\nUS: #{ID_FEATURE}
      → .oai-flow/delivery/{ID}-patch.md
  └── ⚡ CHECKPOINT 2 (dev revisa o patch)

/run-regression {ID}
  └── test-validator    → .oai-flow/delivery/{ID}-validation.md

/open-pr {ID}
  └── pr-generator:
      - título: fix: {SIGLA}_{SIM|PSE}_{N} #{ID_US}
      - descrição: conteúdo completo do commit
      - cria PR no Azure DevOps
      - linka PR às tasks (USER STORY + FEATURE)
      - preenche task de fechamento de desenvolvimento
      → .oai-flow/delivery/{ID}-rollback-plan.md
  └── ⚡ CHECKPOINT 3 (aprovação do PR no Azure)

/release-check {ID}
  └── release-agent     → .oai-flow/delivery/{ID}-release.md
  └── ⚡ CHECKPOINT 4 (dev confirma deploy)
  └── learning-agent    → Speckit atualizado
  └── task fechada no Azure (state = Done)
```

## Regras do Fluxo

- Nenhum passo pode ser pulado.
- Checkpoint não aprovado = fluxo para.
- Gate check non-zero = fluxo para.
- Sigla do módulo: sempre perguntada ao dev, nunca assumida.
- Discoveries fora do escopo = Deferred no state file, nunca implementadas no ticket atual.
