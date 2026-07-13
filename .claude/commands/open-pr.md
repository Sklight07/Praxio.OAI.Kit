# /open-pr

Gera e cria o Pull Request no Azure DevOps, e preenche a task de fechamento de desenvolvimento.

**Uso:** `/open-pr {ID_AZURE_TASK}`

## Sequência de Execução

### PASSO 1 — Verificar pré-condições
- ValidationReport = APROVADO?
- Gate check verde?
- Contexto completo disponível (sigla do módulo, SIM/PSE, IDs Azure)?

### PASSO 2 — Invocar pr-generator
O agente `pr-generator`:
- Gera título: `{tipo}: SIGLA_SIM_NUMERO #{ID_US}`
- Gera descrição com conteúdo completo do commit
- Cria PR no Azure DevOps (via MCP ou az CLI)
- Linka PR às tasks (USER STORY + FEATURE)
- Localiza e preenche a task de fechamento de desenvolvimento
- Gera rollback plan em `.oai-flow/delivery/{ID}-rollback-plan.md`

### ⚡ CHECKPOINT 3 — PR CRIADO
Aguarde aprovação do PR no Azure DevOps.
**Só prossiga para `/release-check {ID}` após PR aprovado.**
