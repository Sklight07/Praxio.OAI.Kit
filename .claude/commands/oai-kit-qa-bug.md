# /oai-kit-qa-bug

Estrutura um defeito encontrado durante os testes e cria task de ajuste no Azure DevOps.

**Uso:** `/oai-kit-qa-bug`

## Sequência de Execução

### PASSO 1 — Invocar oai-kit-bug-analyzer

O agente `oai-kit-bug-analyzer`:
- Coleta informações do defeito (CT de origem, comportamento, passos, evidências)
- Consulta base de conhecimento para verificar se é comportamento esperado
- Formula hipóteses sob perspectiva QA (sem análise de código)
- Classifica severity (🔴 Bloqueante / 🟠 Crítico / 🟡 Moderado / 🟢 Baixo)
- Gera relatório de defeito estruturado

### PASSO 2 — Criar Task de Ajuste (opcional)

Se confirmado pelo QA, cria Task no Azure DevOps:
- Título: `[AJUSTE] CTxx.xx — <descrição curta>`
- Linkada à US correspondente
- Descrição completa com todos os detalhes do defeito
