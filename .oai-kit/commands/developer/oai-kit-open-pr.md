# /oai-kit-open-pr

Gera e cria o Pull Request no Azure DevOps, e preenche a task de fechamento de desenvolvimento.

**Uso:** `/oai-kit-open-pr {ID_AZURE_TASK}`

## Sequência de Execução

### PASSO 1 — Verificar pré-condições
- ValidationReport = APROVADO?
- Gate check verde?
- Contexto completo disponível (sigla do módulo, SIM/PSE, IDs Azure)?

### PASSO 2 — Invocar oai-kit-pr-generator

O agente `oai-kit-pr-generator`:
1. Gera título: `{tipo}: SIGLA_SIM_NUMERO #{ID_US}`
2. Gera descrição com conteúdo completo do commit
3. **Exibe a prévia completa do PR (título + descrição + branches) e aguarda aprovação explícita do dev antes de criar no Azure**
4. Após aprovação: cria PR no Azure DevOps (via MCP ou az CLI)
5. Linka PR às tasks (USER STORY + FEATURE)
6. Localiza e preenche a task de fechamento de desenvolvimento
7. Gera rollback plan em `.oai-flow/delivery/{ID}-rollback-plan.md`

> O agente **não cria o PR automaticamente** — exibe a prévia e pergunta "Posso criar no Azure?" antes de qualquer ação.

### ⚡ CHECKPOINT 3 — PR CRIADO
Aguarde aprovação do PR no Azure DevOps.
**Só prossiga para `/oai-kit-release-check {ID}` após PR aprovado.**
