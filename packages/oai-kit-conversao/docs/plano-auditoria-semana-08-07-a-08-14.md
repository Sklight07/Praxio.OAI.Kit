# Plano — Correções da auditoria semanal (2026-08-07 a 2026-08-14)

> Documento de planejamento (2026-08-14). **Implementado quase por completo na mesma sessão** — só o item 3.3 (fix de código em GlobusWeb.Folha para o GAP-002) ficou pendente de decisão do dev. Gerado a partir de uma auditoria em 4 frentes (armadilhas #49-60, GAPs/Descartes, mudanças de arquétipo, métricas de `conversoes.jsonl`) pedida pelo dev para identificar otimizações/correções nas diretrizes e agentes com base numa semana de uso real (9 telas convertidas, módulo FLP). Cada item com checkbox é uma unidade de trabalho independente.

## Contexto e motivação

Um padrão sistêmico apareceu em 3 das 4 frentes de auditoria, de forma independente: **bugs reais descobertos em teste manual são catalogados como armadilha/GAP, às vezes propagados para o arquétipo, e param aí** — nunca viram um item de checklist que `oai-kit-conversao-paridade` de fato verifica. Isso significa que o mesmo bug pode reaparecer em conversões futuras sem nada automatizado pegando antes do teste manual do dev. O caso mais grave (armadilha #52, `placeholderData: keepPreviousData` ausente) já escapou de **14 telas** antes de ser pego numa varredura manual dedicada — confirmado tanto pela auditoria de armadilhas quanto pela de métricas, de forma independente.

Um segundo padrão real: um GAP já registrado (GAP-005, 2026-08-12) pedia uma mudança específica em `oai-kit-conversao-triagem` (evitar reprocessar tela já convertida) — a ação nunca foi aplicada, apesar de estar detalhada no próprio GAP.

## Iniciativa 1 — Enforcement da armadilha #52 (`placeholderData: keepPreviousData`) — P1

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-paridade.md`, `packages/oai-kit-conversao/policies/conversion-policy.md`.

- [x] **1.1** Novo item bloqueante em `oai-kit-conversao-paridade.md`, passo 1 (junto das checagens de `containerHeight`/`fitColumns` dos padrões Grid+Modal e Inline+Grid): hook de listagem (`useQuery` do grid principal/de seleção) sempre com `placeholderData: keepPreviousData` (`@tanstack/react-query`) — ausência é bloqueante (armadilha #52).
- [x] **1.2** Espelhar o mesmo item na lista "Verificações do `oai-kit-conversao-paridade`" ao final de `conversion-policy.md`.

**Critério de "pronto"**: uma tela nova sem `placeholderData: keepPreviousData` no hook de listagem é bloqueada por paridade, não só descoberta no teste manual do dev.

---

## Iniciativa 2 — GAP-005: triagem nunca reprocessa tela já convertida sem confirmar — P1

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-triagem.md`, `oai-kit-conversao-especificador.md`, `oai-kit-conversao-aprendizado.md`.

- [x] **2.1** `oai-kit-conversao-triagem.md`, passo 2 (verificar especificação prévia): se `minerva-index.json → especificacoes[tela].status === "convertida"`, parar e perguntar: *"Esta tela aparece como já convertida no Minerva (status: convertida). Deseja reprocessar mesmo assim? (sim/não)"* — antes de prosseguir com staleness/reaproveitamento. Não bloqueia automaticamente (pode ser revisão/fix legítimo), mas exige confirmação explícita.
- [x] **2.2** `oai-kit-conversao-especificador.md`, passo 7 (Output): ao gerar a entrada em `minerva-index.json → especificacoes`, escrever `status: "documentada"`.
- [x] **2.3** `oai-kit-conversao-aprendizado.md`, passo 1 (Atualizar `minerva-index.json`): ao concluir, atualizar a entrada correspondente para `status: "convertida"` — nunca deixar essa escrita implícita/manual (hoje só existe nos dados porque alguém preencheu à mão, não porque o processo instrui isso).

**Critério de "pronto"**: o campo `status` é escrito de forma consistente pelo processo (não manualmente) e a triagem sempre confirma antes de reprocessar uma tela marcada `convertida`.

---

## Iniciativa 3 — Cross-reference do transformer de timezone entre cheatsheets — P2 (Minerva)

**Alvo**: `cheatsheets/delphi-para-nestjs.md`, `agents/oai-kit-conversao-paridade.md` (Praxio.OAI.Kit).

Bug real recorrente: `LocalDateTimeTransformer` aplicado a coluna `DATE` hora-pura sem o cuidado de round-trip já documentado em `cheatsheets/convencoes-implementacao.md` (origem: Horários #617736, PTSTM-007, corrigido) — reapareceu em Indisponíveis (GAP-002, **ainda aberto**) porque `delphi-para-nestjs.md` (consultado por `oai-kit-conversao-backend`) dá a receita incompleta, sem a ressalva.

- [x] **3.1** Atualizar a linha "`DATE` (armazena hora)" em `cheatsheets/delphi-para-nestjs.md` (Minerva) com a ressalva de round-trip, ou link cruzado explícito para a convenção em `convencoes-implementacao.md`.
- [x] **3.2** Item grep-detectável novo em `oai-kit-conversao-paridade.md`: coluna hora-pura com `LocalDateTimeTransformer` sem evidência de leitura prévia via `from()` (mesmo padrão do round-trip) é bloqueante.
- [ ] **3.3** Resolver o GAP-002 (Indisponíveis) enquanto estiver na área — aplicar a mesma correção de `hrinicindisp` que já foi feita em Horários, ou confirmar que está fora do escopo desta rodada e deixar para conversão pontual futura (decisão do dev). **Pendente — aguardando decisão do dev, é código de produção em `GlobusWeb.Folha`, fora do escopo de documentação/policy.**

**Critério de "pronto"**: os dois cheatsheets nunca mais dão orientação incompleta/conflitante para o mesmo cenário.

---

## Iniciativa 4 — Corrigir precisão do campo `resultado` em `conversoes.jsonl` — P2 (Minerva + Kit)

**Alvo**: `agents/oai-kit-conversao-aprendizado.md`, `metrics/README.md` (Minerva).

Achado: 44% das telas marcadas `resultado: "convertido"` no período tinham `gapsAbertos > 0` — deveriam ser `convertido_com_gaps`. Também apareceu um valor novo, `retrabalhoPosPadraoAtualizado`, não documentado no schema.

- [x] **4.1** `oai-kit-conversao-aprendizado.md`, passo 5 (Registrar métrica): regra explícita — se `gapsAbertos > 0`, `resultado` é sempre `"convertido_com_gaps"`, nunca `"convertido"`. Nunca decidir esse campo "de memória"; derivar sempre da contagem real de GAPs desta conversão.
- [x] **4.2** `metrics/README.md`: documentar `retrabalhoPosPadraoAtualizado` como valor válido de `resultado` (já em uso real) — ou, se não fizer sentido como resultado de conversão normal, avaliar um campo booleano separado (`retrabalho: true`) em vez de sobrecarregar `resultado`. Decisão do dev sobre qual abordagem.

**Critério de "pronto"**: `resultado` reflete a realidade sem precisar cruzar com `gapsAbertos` pra saber se uma conversão "convertido" teve pendência; schema documentado bate com os valores reais em uso.

---

## Iniciativa 5 — Fechar o gap de enforcement das 11 armadilhas restantes (#49-51, #54-60) — P3

**Alvo**: `agents/oai-kit-conversao-paridade.md` (Praxio.OAI.Kit); `catalogo-reuso/hooks-e-utils.md`, `catalogo-reuso/componentes/DataGridSearchServer.md`, `archetypes/crud-simples-pk-usuario.md`, `archetypes/crud-simples-pk-gerada.md`, `archetypes/lookup-readonly.md`, `cheatsheets/delphi-para-react.md` (Minerva); `agents/oai-kit-conversao-frontend.md`, `agents/oai-kit-conversao-backend.md` (Praxio.OAI.Kit).

- [x] **5.1** **#49** (`useFuncionariosOptions` sem `paging` — Combobox trunca em 10): nova entrada em `catalogo-reuso/hooks-e-utils.md` citando a armadilha; bullet em `oai-kit-conversao-paridade.md` (padrões transversais) — toda query alimentando Combobox com `paging` tem `limit` explícito alto.
- [x] **5.2** **#50** (`getServiceName` resolve chave duplicada errada): nova Restrição Absoluta em `oai-kit-conversao-frontend.md` — `service.ts` REST nunca usa `getServiceName(sigla)` quando houver ambiguidade conhecida, sempre o literal do `name` real; bullet correspondente em `paridade.md`.
- [x] **5.3** **#51** (`@UseProximoCodigo()` estoura `ORA-01438` em `NUMBER(1)/(2)`): propagar a armadilha para dentro de `crud-simples-pk-usuario.md` (seção "Variante: PK opcional com geração automática") e `crud-simples-pk-gerada.md` — hoje só é citada em `crud-pai-filho.md`, longe de onde a receita de `@UseProximoCodigo` é ensinada. Bullet em `oai-kit-conversao-backend.md`, passo Implementar: checar precisão da coluna antes de usar o decorator.
- [x] **5.4** **#54** (`BrowserDePesquisa.fetchData` — paginação em `paginationModel`): bullet em `paridade.md` espelhando o já existente para `DataGridSearchServer`; referência cruzada em `archetypes/lookup-readonly.md`.
- [x] **5.5** **#55** (`CheckListBox.onChange` retorna objetos, não strings): bullet no grupo "Padrões de layout/componente transversais" de `paridade.md`.
- [x] **5.6** **#56** (`DataGridSearchServer` com dados locais — `rows` precisa ser subset da página): nota nova na tabela de props de `catalogo-reuso/componentes/DataGridSearchServer.md` (prop `data.rows`) — hoje ausente até desse catálogo, não só do kit; bullet em `paridade.md`.
- [x] **5.7** **#57** (Zod v4 — `invalid_type_error` removido, usar `error`): grep obrigatório em `oai-kit-conversao-paridade.md`, passo 1 — `invalid_type_error` não pode aparecer em `front-end/src/`; nota em `cheatsheets/delphi-para-react.md`.
- [x] **5.8** **#58** (`autoHeight` + Box `height:100% !important` conflitam): copiar o grep já pronto na própria entrada do cheatsheet direto para `paridade.md` (bloqueante); referência cruzada em `DataGridSearchServer.md`.
- [x] **5.9** **#59** (`helperText` inline quebra `alignItems="center"` com `IconButtonMaterial`): bullet em `paridade.md` (padrões transversais).
- [x] **5.10** **#60** (`keepPreviousData` + `enabled: false` retém cache após Limpar): bullet em `paridade.md` para telas pai-filho/master-detail com query `enabled` condicional; referência cruzada em `DataGridSearchServer.md` ao lado da entrada de #52.

**Nota de implementação**: a maioria dos itens acima (5.1, 5.2, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10) vira um bullet dentro do já existente parágrafo "Padrões de layout/componente transversais" de `oai-kit-conversao-paridade.md` — consolidar num único edit desse parágrafo em vez de 9 edits separados, mesmo padrão de manutenção já usado ali.

**Critério de "pronto"**: as 11 armadilhas restantes têm pelo menos um mecanismo de verificação ativa (checklist de paridade e/ou restrição em backend/frontend), não só uma entrada passiva no cheatsheet.

---

## Iniciativa 6 — Corrigir resumos condensados sobre a exceção de PK não-digitável — P3

**Alvo**: `agents/oai-kit-conversao-frontend.md`, `agents/oai-kit-conversao-paridade.md`.

O arquétipo completo (`padrao-frontend-crud-inline-grid.md`) já documenta corretamente a exceção (PK composta de campos não-digitáveis → só `onRowDoubleClick`, sem `onBlur`) — mas os resumos condensados nos dois agentes ainda tratam `onBlur` como universal do padrão Inline+Grid, criando risco de: (a) o frontend forçar `onBlur` indevido numa tela com PK não-digitável, ou (b) paridade marcar como bug uma implementação correta que não tem `onBlur`.

- [x] **6.1** `oai-kit-conversao-frontend.md` (linha que descreve `onBlur` do padrão Inline+Grid): adicionar ressalva "(exceto quando a PK é composta de campos não-digitáveis — só `onRowDoubleClick`, ver nota no arquétipo)".
- [x] **6.2** `oai-kit-conversao-paridade.md` (checklist Inline+Grid): mesma ressalva.

**Critério de "pronto"**: nenhum dos dois agentes trata `onBlur` como obrigatório de forma incondicional no padrão Inline+Grid.

---

## Fora de escopo desta rodada (confirmado, não implementar)

- **GAP-001, GAP-003, GAP-004, GAP-006, DESCARTE-001, DESCARTE-002**: fora do escopo do kit (débito técnico pontual da aplicação-alvo, limitação do UIKit a resolver por outro time, ou dependência de conversão futura) — já documentados corretamente, sem ação de processo necessária.
- **Tendência de bugs em `crud-pai-filho`** (1→4→6 entre 3 conversões): amostra pequena demais (N=3) para virar mudança de processo agora — monitorar nas próximas conversões desse arquétipo.
- **`duracaoMinutosAprox` quase sempre vazio**: não é um bug de processo, é o dev raramente informando — mencionar, não forçar.
- **Adoção zero do Cypress (`--com-cypress`)**: esperado, feature recente e opt-in.

## Ordem de execução sugerida

1. **Iniciativa 1** — maior impacto confirmado por 3 fontes independentes.
2. **Iniciativa 2** — GAP já pedia isso explicitamente, resolver a dívida.
3. **Iniciativa 3** — bug recorrente ativo (GAP-002 ainda aberto).
4. **Iniciativa 4** — correção de dado, barata.
5. **Iniciativa 5** — maior volume de edições, mas cada uma isolada; fazer em lote único no `oai-kit-conversao-paridade.md`.
6. **Iniciativa 6** — menor risco, mais rápida.

## Como retomar

Cada sub-item com checkbox é uma unidade de trabalho independente. Ao retomar, reler "Contexto e motivação" — o padrão sistêmico (documentado mas não enforced) é o fio condutor de quase todas as iniciativas, não itens desconexos.
