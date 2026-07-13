# /oai-kit-po-scan-visual

Escaneia telas existentes do sistema para extrair padrões visuais e popular a base de conhecimento PO.

**Uso:** `/oai-kit-po-scan-visual [NOME_DO_SISTEMA]`

## Sequência de Execução

### PASSO 1 — Invocar oai-kit-po-scan-visual

O agente `oai-kit-po-scan-visual`:
- Coleta screenshots ou referências das telas do sistema
- Extrai: paleta de cores, tipografia, componentes, layout
- Exibe todos os padrões extraídos e pontos que precisam de confirmação
- **Aguarda aprovação explícita do PO antes de salvar**
- Após aprovação: grava em `.oai-kit/knowledge/po/visual-patterns/{sistema}-tokens.md`

### PASSO 2 — Resultado

A base de conhecimento fica enriquecida para que o `oai-kit-po-prototype` gere protótipos fiéis ao visual do sistema nas próximas solicitações.

> O agente **não salva automaticamente** — exibe o que extraiu, sinaliza valores incertos e pergunta "Posso salvar?" antes de gravar qualquer arquivo.
