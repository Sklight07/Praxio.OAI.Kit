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
1. Coleta sigla do módulo, tipo e número do SIM/PSE e IDs Azure
2. Propõe branch no padrão Praxio (`feature/` ou `hotfix/`)
3. **Exibe plano atômico e aguarda aprovação explícita antes de escrever código**
4. Ciclo RED → GREEN → VERIFY
5. **Exibe Gate Pré-Commit (lista de arquivos alterados + mensagem de commit) e aguarda aprovação explícita antes de commitar**
6. Gera `.oai-flow/delivery/{ID}-patch.md`

> O builder-agent tem dois gates obrigatórios com parada e pergunta explícita:
> (a) antes de escrever qualquer código e (b) antes de executar o commit.

### ⚡ CHECKPOINT 2 — PATCH APROVADO

Após o builder-agent concluir e o PatchBundle estar disponível, apresente o resumo ao dev.
**Só prossiga para `/oai-kit-run-regression {ID}` após aprovação explícita.**
