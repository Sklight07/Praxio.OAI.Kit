# /release-check

Verifica quality gates e autoriza o deploy.

**Uso:** `/release-check {ID_AZURE_TASK}`

## Sequência de Execução

### PASSO 1 — Invocar release-agent
O agente `release-agent`:
- Verifica PR aprovado e pipeline de CI verde no Azure DevOps
- Verifica janela e freeze periods da release-policy
- Verifica aprovações necessárias por severidade
- Gera release package em `.oai-flow/delivery/{ID}-release.md`

### ⚡ CHECKPOINT 4 — AGUARDE CONFIRMAÇÃO DE DEPLOY
Apresente o release package. **Não feche a task até o dev confirmar o deploy.**

### PASSO 2 — Pós-Deploy
Após confirmação explícita do deploy:
1. Acione `learning-agent` → Speckit atualizado.
2. Feche a USER STORY no Azure via MCP (state = Done).
3. Informe ao dev que o ciclo está encerrado.
