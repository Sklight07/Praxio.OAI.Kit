# /oai-kit-po-refine-card

Analisa uma task na cerimônia de refinamento sob perspectiva de PO — verifica Definition of Ready e posta análise no Azure.

**Uso:** `/oai-kit-po-refine-card {ID_AZURE_TASK}`

## Sequência de Execução

### PASSO 1 — Invocar oai-kit-po-refine-card

O agente `oai-kit-po-refine-card`:
- Busca a task e navega a hierarquia
- Avalia Definition of Ready (DoR)
- Analisa clareza do negócio, critérios de aceite e escopo
- Propõe melhorias e clarificações

### PASSO 2 — Postar no Azure

Após aprovação do PO:
- Posta análise como comentário na task
- Atualiza descrição da US (se necessário e aprovado)
- Adiciona tag `refinado-po`
