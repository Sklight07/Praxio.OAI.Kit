# /review-pr

Revisa um Pull Request de outro dev com base no código, padrões da Praxio e requisitos da task.

**Uso:** `/review-pr {numero_pr}` ou `/review-pr {url_pr}`

## Sequência de Execução

### PASSO 1 — Invocar pr-reviewer

O agente `pr-reviewer`:
- Busca dados do PR no Azure DevOps (via MCP ou CLI)
- Busca a task associada para entender o requisito
- Lê os arquivos alterados
- Revisa em 4 dimensões: funcional, qualidade, padrões Praxio, testes

### PASSO 2 — Resultado

O agente gera o relatório de review com veredicto e, se o dev quiser, posta como comentário no PR via MCP.
