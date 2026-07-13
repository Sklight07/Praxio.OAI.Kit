# /oai-kit-po-prototype

Gera um protótipo HTML interativo de uma tela ou fluxo.

**Uso:** `/oai-kit-po-prototype {ID_AZURE_TASK}` ou `/oai-kit-po-prototype` (interativo)

## Sequência de Execução

### PASSO 1 — Invocar oai-kit-po-prototype

O agente `oai-kit-po-prototype`:
- Coleta escopo do protótipo (telas, estados, interações)
- Consulta padrões visuais em `.oai-kit/knowledge/po/visual-patterns/`
- Gera o HTML internamente e exibe resumo das telas e interações incluídas
- **Aguarda aprovação explícita do PO antes de salvar o arquivo**
- Após aprovação: salva em `.oai-flow/discovery/{ID}-prototype.html`

### PASSO 2 — Resultado

O PO abre o arquivo no navegador para revisão. O protótipo pode ser compartilhado com o time como artefato de discovery.

> O agente **não salva o arquivo automaticamente** — exibe o que foi gerado e pergunta "Posso salvar?" antes de gravar.

> **Dica:** Para protótipos mais fiéis ao sistema, execute primeiro `/oai-kit-po-scan-visual` para documentar os padrões visuais.
