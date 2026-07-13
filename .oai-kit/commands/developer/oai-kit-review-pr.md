# /oai-kit-review-pr

Revisa um Pull Request de outro dev com base no código, padrões da Praxio e requisitos da task.

**Uso:** `/oai-kit-review-pr {numero_pr}` ou `/oai-kit-review-pr {url_pr}`

## Sequência de Execução

### PASSO 1 — Invocar oai-kit-pr-reviewer

O agente `oai-kit-pr-reviewer`:
- Busca dados do PR no Azure DevOps (via MCP ou CLI)
- Busca a task associada para entender o requisito
- Lê os arquivos alterados
- Revisa em 4 dimensões: funcional, qualidade, padrões Praxio, testes

### PASSO 2 — Resultado

O agente gera o relatório de review com veredicto e, se o dev quiser, posta como comentário no PR via MCP.
