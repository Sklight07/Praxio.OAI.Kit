# /oai-kit-generate-fix

Gera o patch mínimo para o bug investigado, com branch e commit no padrão Praxio.

**Uso:** `/oai-kit-generate-fix {ID_AZURE_TASK}`

## Pré-condições

- BugReport e ImpactReport aprovados (Checkpoint 1 concluído).
- `.oai-flow/analysis/{ID}-bugreport.md` e `{ID}-impact.md` existem.

## Sequência de Execução

### PASSO 1 — Verificar necessidade de validação arquitetural

Acione `oai-kit-architecture-agent` se qualquer condição for verdadeira:
- O arquivo alterado está no risk-map como ALTO.
- O fix afeta múltiplos módulos.
- O fix altera uma interface pública (endpoint, event schema, contrato de API).
- O fix contradiz algum ADR em `.speckit/decisions/`.

O agente lê `.oai-kit/policies/coding-principles.md` e `security-policy.md`.

Se o veredicto for BLOQUEADO → pare e informe o dev.

### PASSO 2 — Invocar oai-kit-builder-agent

O agente `oai-kit-builder-agent`:
- Coleta sigla do módulo, tipo e número do SIM/PSE e IDs Azure
- Propõe branch no padrão Praxio (`feature/` ou `hotfix/`)
- Declara plano atômico e aguarda confirmação do dev
- Ciclo RED → GREEN → VERIFY
- Commit no formato Praxio
- Gera `.oai-flow/delivery/{ID}-patch.md`

### ⚡ CHECKPOINT 2 — PATCH GERADO

Apresente o PatchBundle ao dev.
**Só prossiga para `/oai-kit-run-regression {ID}` após aprovação explícita.**
