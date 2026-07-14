# /oai-kit-po-discovery

Conduz o processo de descoberta de produto — da ideia solta ao Epic + User Stories publicados no Azure DevOps.

**Uso:** `/oai-kit-po-discovery`

> **Quando usar este comando?**
> O PO tem uma ideia ou demanda que **ainda não é um card no Azure DevOps**.
> Se o item já existe no board (tem ID), use `/oai-kit-po-refine-card {ID}` em vez deste.

## Sequência de Execução

### PASSO 1 — Fase de Discovery (Product Brief)

O agente `oai-kit-po-discovery`:
- Faz perguntas de clarificação sobre a demanda (perfil, dor, sistema, escopo, métrica de sucesso)
- Consulta `.oai-kit/knowledge/po/project-context/` para usar contexto já documentado
- Redige o **Product Brief** com: Problema, Personas, Objetivo de negócio, Métrica de sucesso, Escopo IN/OUT, Restrições, Hipóteses em aberto

**CHECKPOINT 1** — PO aprova o Brief antes de avançar

### PASSO 2 — Fase de Decomposição (Epic + Stories)

Após aprovação do Brief:
- Decompõe em **Epic → User Stories** com critérios no formato "QUANDO/ENTÃO"
- Cada Story recebe: sizing P/M/G, tag MVP ⭐ ou backlog, dependências entre stories
- Verifica testabilidade de cada critério de aceite antes de fechar a lista
- Exibe a árvore: `EPIC → Story 1 [MVP ⭐] → Story 2 [backlog]`

**CHECKPOINT 2** — PO aprova a decomposição (pode cortar do MVP, reagrupar ou ajustar)

### PASSO 3 — Fase de Publicação (Azure DevOps)

Após aprovação da decomposição:
- Verifica duplicidade de título no Azure antes de criar
- Exibe prévia completa de tudo que será criado no board
- **CHECKPOINT 3** — PO autoriza a criação (ação irreversível)
- Cria Epic + Stories vinculadas via MCP; adiciona tag `criado-oai-kit`
- Confirma IDs reais criados ao PO

### PASSO 4 — Resultado

O board do Azure DevOps tem o Epic e as User Stories prontos para o próximo refinamento de sprint. Stories MVP ⭐ estão priorizadas; stories de backlog ficam catalogadas para roadmap futuro.

> O agente **não cria nada no Azure sem aprovação explícita** em 3 checkpoints progressivos.

> **Degradação graceful:** se a ferramenta MCP de criação não estiver disponível na sessão, o agente entrega o pacote completo formatado para criação manual — sem erro, sem silêncio.
