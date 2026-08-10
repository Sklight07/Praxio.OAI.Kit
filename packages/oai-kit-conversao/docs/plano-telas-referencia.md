# Plano — Catálogo de telas-referência (exemplos completos de construção)

> Documento de planejamento (2026-08-10). **Implementado por completo em 2026-08-10** (mesma sessão) — as 7 iniciativas abaixo estão todas marcadas `[x]`.

## Contexto e motivação

Hoje, cada arquétipo (`archetypes/*.md`) cita uma ou mais telas em "Confirmado em"/"Referência canônica" — mas sempre como **evidência pontual de uma regra específica** (ex.: "este componente vem de aqui", "esta variante de PK foi confirmada nesta tela"). Não existe um documento único que responda "qual tela eu abro pra ver, de ponta a ponta, como fazer uma conversão bem feita — componentes, comportamento, detalhes visuais, não só a estrutura do arquétipo?".

O dev identificou que **Parâmetros Alimentação** (`GlobusWeb.Folha/front-end/src/features/ParametrosAlimentacao/CadastroParametrosAlimentacao.tsx`, 1020 linhas) é hoje o melhor exemplo desse tipo no módulo Folha — não só do padrão `inline-grid`, mas de uso de componentes em geral (confirmado por leitura da spec: `EmpresaFilialCombobox`, PK composta de 3 partes, combobox estático de 14 opções, 14 regras condicionais Tipo 2, combobox de referência com campo persistido≠exibido, campos mascarados/`maxLength`, `DatePicker` nullable, `MoneyInput`, e uma variante própria do `inline-grid` — seleção por "lookup de cabeçalho" em vez de duplo clique no grid). Também apontou que nem todo padrão tem um exemplo assim ainda — ex.: não há tela do Folha com accordion/`TabSheet` — e que isso deveria ficar explícito, não silenciosamente assumido como coberto.

**Decisões já fechadas com o dev** (perguntadas via 4 questões, todas resolvidas com a opção recomendada):
- **Estrutura**: lista única ranqueada (não uma lista por arquétipo) — cada entrada marcada com tags dos padrões/componentes que exemplifica bem, permitindo tanto ler do topo (mais completo) quanto buscar por padrão específico.
- **Obrigatoriedade**: consulta **obrigatória** para `oai-kit-conversao-frontend` e `oai-kit-conversao-especificador` — não é só um recurso opcional.
- **Manutenção**: `oai-kit-conversao-aprendizado` propõe entradas/promoções novas ao final de cada conversão, mesmo espírito de como já propõe arquétipo/componente novo.
- **Lacunas**: seção própria, explícita, listando padrões/componentes sem exemplar forte ainda em **nenhum módulo** (não confundir com "sem exemplo local no Folha, mas outro módulo já cobre" — isso já é resolvido pelo mecanismo de precedente cross-repo existente, ver Iniciativa 4).

**Decisão de escopo assumida (não perguntada, sinalizada aqui para correção se estiver errada)**: o catálogo é **cross-módulo**, como o resto do Minerva — não fica restrito a telas do Folha. Restringir a um módulo só criaria um silo inconsistente com o resto da base (arquétipos, cheatsheets e catálogo de componentes já são todos compartilhados entre módulos).

## Iniciativa 1 — Criar `catalogo-reuso/telas-referencia.md` (Minerva)

**Alvo**: novo arquivo `catalogo-reuso/telas-referencia.md` no `GlobusEvo.Minerva`.

- [x] **1.1** Formato de cada entrada: `Tela | Módulo | Caminho do código real (frontend, +backend se relevante) | Padrão estrutural (AP-CONV-015) | Tier | Tags (padrões/componentes exemplificados) | Nota (por que é um bom exemplo)`. Tier em 3 níveis: **★★★** (exemplo abrangente, cobre múltiplos padrões/componentes de uma vez — poucas entradas, o topo da lista), **★★** (bom exemplo de uma variante/padrão específico), **★** (exemplo pontual de um único detalhe).
- [x] **1.2** Seed inicial da lista (consolidando o que já está espalhado pelos arquétipos como "Confirmado em"/"Referência canônica", mais o exemplo indicado pelo dev), em ordem:
  - **★★★ Parâmetros Alimentação** (FLP/Folha) — `CadastroParametrosAlimentacao.tsx`. Tags: `crud-pai-filho`, `inline-grid` (variante "lookup por cabeçalho", sem duplo clique), `EmpresaFilialCombobox`, PK composta 3 partes, combobox estático de opções fixas, combobox de referência (AP-CONV-017, persistido≠exibido), campos condicionais complexos (14 regras Tipo 2), `TextField`+`maxLength` condicional, `DatePicker` nullable, `MoneyInput`.
  - **★★★ CadastroDefeitos** (Manutencao) — referência-base do padrão Grid+Modal (já citada em `padrao-frontend-crud-grid-modal.md`). Tags: `grid-modal`, `FormModal` criar/editar/excluir, busca explícita, cabeçalho 2 linhas, `containerHeight` computado, coluna `acoes`.
  - **★★★ CadastroAcidente** (Acidentes) — referência-base do padrão Accordion+Índice (já citada em `accordion-secoes-indice-numerado.md`). Tags: `accordion-indice`, `CustomAccordionGroup` controlado, `AccordionSectionsNavRail`, `RepeatableForm`, `Table` read-only de outro domínio, 14 seções.
  - **★★ CadastroCondicaoPavimento`/`CondicaoPista** (Acidentes) — `inline-grid` clássico (cadastro simples 2 campos, duplo clique).
  - **★★ CadastroFormaPagamento** (Trafego) — `lookup-readonly` clássico, combobox de referência básico.
  - **★★ CadastroTipoAdmissao** (Folha) — variante de checkboxes interdependentes dentro de `crud-simples-pk-usuario`.
  - **★★ Indisponiveis** (Folha) — variante de PK composta "não digitável de cabeça" — seleção só por duplo clique, sem `onBlur`.
  - **★★ CadastroDetalheOcorrencia** (Folha) — variante `@UseProximoCodigo` + convenção de wrapper key de mutation (`cheatsheets/convencoes-implementacao.md`).
  - **★ TaxaTmr`/`IndiceTipoServico** (Trafego) — `crud-pai-filho` clássico, sem variante especial.
- [x] **1.3** Seção "Lacunas de cobertura" — padrões/componentes sem exemplar forte em **nenhum** módulo ainda (levantamento inicial, a revisar/completar durante a implementação):
  - Fluxo completo `N-ESPECIAL` (procedure Oracle + transação + feature flag) como *tela convertida de verdade* — hoje só existe descrito em prosa (`delivery-sequencing.md`/`parity-checklist.md`), nenhuma conversão real concluída ainda serve de exemplo ponta a ponta.
  - Tela real com campo LGPD (AP-CONV-016) mascarado/auditado em produção — a policy existe, nenhuma conversão até agora precisou aplicá-la de fato.
  - Fluxo cross-módulo via Federation concluído (AP-CONV-012, dependência que exigiu nova implementação em outro repositório) — nenhuma conversão real terminou esse caminho completo ainda.
  - Nota à parte (não é lacuna real, só ausência local): o Folha ainda não tem uma tela própria com `accordion-indice` — mas o padrão já tem exemplo forte cross-módulo (`CadastroAcidente`), então o mecanismo de precedente cross-repo (Iniciativa 4) já resolve isso quando a primeira tela desse tipo for convertida no Folha.
- [x] **1.4** Nota de manutenção no topo do arquivo: quem escreve é só `oai-kit-conversao-aprendizado` (Iniciativa 5) — nenhum outro agente edita esta lista diretamente.

**Critério de "pronto"**: existe um arquivo único, ranqueado, com tags por padrão/componente, e uma seção de lacunas real (só padrões sem exemplo em nenhum módulo, não confundido com ausência local).

---

## Iniciativa 2 — Consulta obrigatória em `oai-kit-conversao-frontend.md`

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-frontend.md`.

- [x] **2.1** Novo bullet no passo "1. Carregar a receita": depois de abrir o arquétipo, consultar `{knowledgeBasePath}/catalogo-reuso/telas-referencia.md` por uma entrada cujas tags batam com o padrão/componentes desta tela — abrir o código real da tela-modelo indicada como referência complementar (nuance visual, detalhe de comportamento que a receita em prosa do arquétipo não cobre tão bem quanto ver o código de verdade). Isso não substitui o arquétipo (que é a regra) — é o "veja um exemplo completo funcionando".
- [x] **2.2** Nova Restrição Absoluta: nunca ignorar `telas-referencia.md` quando existir entrada com tag aplicável ao padrão/componente desta tela.

**Critério de "pronto"**: o agente de frontend sempre confere o catálogo antes de implementar, não só o arquétipo.

---

## Iniciativa 3 — Consulta obrigatória em `oai-kit-conversao-especificador.md`

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-especificador.md`.

- [x] **3.1** No passo de resolver o de/para de componente e o padrão de frontend (passo 3/3d), consultar `telas-referencia.md` e, quando houver entrada aplicável, registrar na especificação uma nota "ver tela-modelo `<Tela>` para exemplo real deste padrão" — enriquece a spec para quem for implementar depois (inclusive `oai-kit-conversao-e2e`, que também se beneficia de um exemplo real ao montar os testes).

**Critério de "pronto"**: specs novas já apontam para a tela-modelo mais relevante, quando existir.

---

## Iniciativa 4 — Unificar o passo 4e de `oai-kit-conversao-triagem.md` com o catálogo

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-triagem.md`.

- [x] **4.1** O passo 4e (checagem cross-repo de precedente estrutural, hoje restrito a Grid+Modal + repositório-alvo "esqueleto") passa a consultar **primeiro** `telas-referencia.md` (filtrando por padrão de frontend decidido) em vez de depender só do exemplo citado em prosa dentro do arquétipo — o catálogo é mais rico e cobre os 3 padrões, não só Grid+Modal. Se o catálogo não tiver entrada aplicável, cai no comportamento atual (perguntar ao dev).
- [x] **4.2** Regra explícita mantida: uma vez que o módulo-alvo já tenha telas do mesmo padrão convertidas, "o próprio repositório já é o precedente" — não muda, só passa a ser registrado também como candidato a entrada nova do catálogo (Iniciativa 5).

**Critério de "pronto"**: o mecanismo de precedente cross-repo e o catálogo de telas-referência deixam de ser dois sistemas paralelos — o catálogo passa a ser a fonte primária.

---

## Iniciativa 5 — `oai-kit-conversao-aprendizado.md` mantém o catálogo

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-aprendizado.md`.

- [x] **5.1** Novo passo (mesmo espírito do passo 3, que já avalia se um achado é candidato a arquétipo/componente novo): ao final de cada conversão, avaliar se a tela recém-convertida é candidata a entrar (ou promover uma entrada existente mais fraca) em `telas-referencia.md` — critério: cobre múltiplos padrões/componentes corretamente (não só um), e não teve bug de conversão encontrado no teste manual/paridade (`oai-kit-conversao-paridade`, categoria "Bug de conversão" — zero nesta conversão). Se aplicável, incluir a proposta no Gate Pré-Commit do Minerva, com a tag/tier sugeridos.
- [x] **5.2** Se a tela recém-convertida preenche uma lacuna documentada na seção "Lacunas de cobertura" (Iniciativa 1.3), remover ou atualizar essa entrada de lacuna no mesmo commit.

**Critério de "pronto"**: o catálogo cresce organicamente conforme mais telas forem convertidas, sem exigir que o dev peça manualmente.

---

## Iniciativa 6 — Indexação (decisão: não indexar)

**Decisão, não uma tarefa**: `telas-referencia.md` **não** entra em `minerva-index.json` — mesma convenção já usada para `cheatsheets/*.md` e `catalogo-reuso/hooks-e-utils.md` (satélite consultado por caminho direto, não por índice). Consultado sempre via `Read` direto do arquivo pelos agentes (Iniciativas 2-5) — arquivo pequeno o bastante para isso continuar barato.

---

## Iniciativa 7 — `README.md` do pacote (menção leve)

**Alvo**: `packages/oai-kit-conversao/README.md`.

- [x] **7.1** Bullet novo na seção "O que retroalimenta a base de conhecimento central": telas-modelo/catálogo de referência para construção (`telas-referencia.md`), ao lado dos itens já existentes (arquétipos, armadilhas, schema, GAPs, métricas).

**Critério de "pronto"**: o README não fica desatualizado assim que esta iniciativa for implementada.

---

## Ordem de execução sugerida

1. **Iniciativa 1** — o catálogo em si é a fonte de verdade que tudo mais referencia.
2. **Iniciativas 2 e 3** — consulta obrigatória em frontend/especificador.
3. **Iniciativa 4** — unificação com o passo 4e da triagem.
4. **Iniciativa 5** — manutenção via aprendizado.
5. **Iniciativa 7** — README, por último (cosmético).

## Como retomar

Cada sub-item com checkbox é uma unidade de trabalho independente. A "Decisão de escopo assumida" (catálogo cross-módulo, não só Folha) foi sinalizada mas não perguntada explicitamente — se o dev corrigir isso ao revisar o plano, reescrever a Iniciativa 1 antes de prosseguir.
