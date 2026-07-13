# /oai-kit-qa-refine-card

Analisa uma task na cerimônia de refinamento sob perspectiva de QA e posta análise no Azure DevOps.

**Uso:** `/oai-kit-qa-refine-card {ID_AZURE_TASK}`

## Sequência de Execução

### PASSO 1 — Invocar oai-kit-qa-refiner

O agente `oai-kit-qa-refiner`:
- Busca a task e navega a hierarquia (parents + children)
- Verifica base de conhecimento QA em `.oai-kit/knowledge/qa/`
- Analisa critérios de aceite e identifica pontos de atenção
- Propõe cenários de teste preliminares (sem código — PR não existe ainda)
- Identifica suítes existentes que serão afetadas
- Estima esforço de QA

### PASSO 2 — Postar no Azure

Após aprovação do QA:
- Posta análise como comentário na task via MCP
- Adiciona tag `refinado-qa` na task
