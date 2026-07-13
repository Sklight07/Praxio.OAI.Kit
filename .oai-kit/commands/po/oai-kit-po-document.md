# /oai-kit-po-document

Documenta uma demanda de negócio como User Story no Azure DevOps.

**Uso:** `/oai-kit-po-document {ID_SIM_PSE}` ou `/oai-kit-po-document` (interativo)

## Sequência de Execução

### PASSO 1 — Invocar oai-kit-po-demand

O agente `oai-kit-po-demand`:
- Coleta informações da demanda (texto livre, SIM/PSE, contexto)
- Consulta base de conhecimento em `.oai-kit/knowledge/po/`
- Gera User Story com critérios de aceite claros e testáveis
- Apresenta para aprovação do PO antes de criar no Azure

### PASSO 2 — Criar no Azure DevOps

Após aprovação:
- Cria User Story via MCP com título, descrição e critérios de aceite
- Linka à FEATURE pai informada pelo PO
- Exibe link da US criada
