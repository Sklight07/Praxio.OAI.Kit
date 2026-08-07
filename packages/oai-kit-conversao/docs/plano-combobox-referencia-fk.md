# Plano — Combobox de referência para campos FK dentro de outros arquétipos

> Documento de planejamento (2026-08-07). **Todas as 6 iniciativas implementadas e aprovadas na mesma sessão em que foi escrito.** Na implementação, 1.1+6.1 viraram um único `AP-CONV-017` novo em `conversion-policy.md`; 3.1+3.2 viraram uma única seção nova em `hooks-e-utils.md`; 4.1+4.2 viraram um único parágrafo novo no especificador — conteúdo idêntico ao planejado, só consolidado por proximidade de arquivo/assunto.

## Contexto e fonte

Discussão disparada por um comportamento de conversão observado pelo dev: telas de cadastro (ex.: Cadastro de Funcionário) têm campos que referenciam registros de **outra** tabela (ex.: Área do funcionário) — no legado, um `TEdit` de código + lupa/browser de pesquisa + `TEdit` de descrição (read-only, autopreenchida). Hoje nossas políticas condicionam o de/para 1:1 de componente; o dev propõe que, para esse tipo específico de campo (referência a registro já existente de outra tabela), o correto é substituir por um `Combobox` já carregado com as opções, em vez de replicar código+lupa+descrição literalmente.

Referência real analisada: `GlobusWeb.Acidentes/front-end/src/features/Prestacao/CadastroPrestacao2.tsx` — usa `FuncionariosMaisAutonomosCombobox` (componente pronto do UIKit) e `TipoPrestacoesComboBox` (componente próprio do app, `shared/components/TipoDePrestacao/`). O segundo revelou a receita genérica por trás: um hook `useTipoPrestacoesOptions()` (`useQuery` + `select` mapeando para `{label: "código - descrição", value: código}`) e um componente fino que envolve o `Combobox` do UIKit injetando `options`/`loading`.

**Achado 1 — o mapeamento já existe, mas com critério de gatilho errado.** `cheatsheets/delphi-para-react.md` já tem a linha `TEdit(código)+lupa+TEdit(descrição,read-only)` → `Combobox de lookup ... ver arquétipo lookup-readonly`, mas sem distinguir os dois casos reais:
- **Lupa/browser referenciando a mesma entidade sendo cadastrada nesta tela** (a própria PK) — existe no legado só porque a tela não tem grid embutido; é o mecanismo de "encontrar um registro existente quando não se sabe o código de cor". Nossos arquétipos **já sempre têm grid embutido** (AP-CONV-014/015), que resolve o mesmo problema por clique na linha — a lupa fica redundante e nunca deve ser replicada. **Não é GAP nem Descarte a registrar caso a caso** — é consequência direta de uma decisão estrutural já tomada.
- **Lupa/browser referenciando uma tabela diferente** — caso genuíno de FK/referência, vira `Combobox` carregado com as opções da tabela referenciada.

**Achado 2 — `archetypes/lookup-readonly.md` está descrito só como arquétipo de tela inteira.** Não há indicação de que a mesma receita (backend read-only + hook + `Combobox`) se aplica como **sub-padrão de campo**, dentro de qualquer outro arquétipo (`crud-simples-*`, `crud-pai-filho`, `accordion`, etc.) — risco real de um agente achar que só se aplica quando a triagem classifica a tela inteira como `lookup-readonly`.

**Achado 3 — falta a receita genérica de "como construir um combobox de referência novo".** Só existem componentes específicos já catalogados (`EmpresaFilialCombobox`, `FuncionariosMaisAutonomosCombobox`). O padrão hook+wrapper (`TipoPrestacoesComboBox`) não está formalizado como receita a seguir quando não existe componente pronto.

**Achado 4 — o que exibir e o que persistir não são a mesma coisa, e o schema Oracle sozinho não resolve isso.** Confirmado com exemplo real do dev: o combobox de funcionário em `Prestacao2` exibe `codfunc`/chapa + nome + status (de `FLP_FUNCIONARIOS`), mas o valor efetivamente persistido nas tabelas de Prestação é `CODINTFUNC` — uma coluna diferente da mesma tabela, e essa ligação **não é necessariamente uma FK declarada no Oracle** (é comum haver "chave estrangeira informal"). Isso é uma instância específica do que a **AP-CONV-001** já estabelece de forma geral ("metadado nunca autoriza comportamento sozinho") — vale explicitar essa aplicação em vez de deixar implícito.

---

## Iniciativa 1 — Distinguir lupa redundante (própria PK) de lupa de referência genuína

**Alvo**: `packages/oai-kit-conversao/policies/conversion-policy.md` (nota em AP-CONV-014/015), `GlobusEvo.Minerva/cheatsheets/delphi-para-react.md` (linha 34).

- [x] **1.1** Nota em `conversion-policy.md`, junto a AP-CONV-014/015: lupa/browser de pesquisa do legado que referencia a **mesma tabela/entidade** sendo cadastrada nesta tela nunca é replicada — o grid embutido (já obrigatório) resolve via clique na linha. Não é GAP nem Descarte a registrar caso a caso — é consequência direta da decisão estrutural já tomada.
- [x] **1.2** Dividir a linha 34 de `delphi-para-react.md` em duas, pelo critério correto:
  - `TEdit(código)+lupa+TEdit(descrição)` referenciando a **mesma entidade** desta tela → não replicar a lupa (grid resolve, ver AP-CONV-014/015).
  - `TEdit(código)+lupa+TEdit(descrição)` referenciando **tabela diferente** → `Combobox` de referência (ver `lookup-readonly.md`, sub-padrão de campo).

**Critério de "pronto"**: a tabela de mapeamento não trata mais os dois casos como uma regra única; um agente consegue decidir corretamente sem abrir mais nenhum documento.

---

## Iniciativa 2 — Sub-padrão de campo "Combobox de referência" em `lookup-readonly.md`

**Alvo**: `GlobusEvo.Minerva/archetypes/lookup-readonly.md`.

- [x] **2.1** Nova seção "Uso como sub-padrão de campo, dentro de outro arquétipo": mesma receita (backend read-only + hook + `Combobox`), mas a unidade de aplicação é o **campo**, não a tela inteira. Gatilho: `TEdit(código)+lupa+TEdit(descrição)` no legado referenciando tabela **diferente** da entidade principal desta tela.
- [x] **2.2** Nova seção "O que trazer/exibir no combobox": campos a buscar = coluna-chave efetivamente persistida (ver 2.3) + campo(s) descritivo(s) equivalente(s) ao que o legado já exibe (reaproveitar a mesma fonte que o `.pas` usa para popular a descrição, nunca inventar campo novo). Exibição replica exatamente o que o legado mostra — inclusive quando há mais de um campo descritivo (ex.: chapa+nome+status), não uma versão simplificada.
- [x] **2.3** Nova seção "O que persistir — não confiar só no schema Oracle": o valor persistido pode não ser o mesmo que a chave exibida nem o que o schema sugere como PK óbvia da tabela referenciada (exemplo real: `CODINTFUNC` persistido vs. `CODFUNC`/chapa exibido, sem FK declarada). Procedimento de confirmação (mesma disciplina de AP-CONV-001/006/007):
  1. Ler o comportamento real do legado — qual coluna/valor o `.pas` efetivamente grava na tabela principal ao escolher o registro via lupa/browser.
  2. Cruzar com o schema Oracle de **ambas** as tabelas (principal + referência) via `tabelasConhecidas.json`/`descobertas-oracle/`/MCP Oracle — mas o schema sozinho nunca confirma a ligação quando não há FK declarada.
  3. Se não for possível confirmar por código + schema, perguntar ao dev antes de assumir — nunca adivinhar por nome parecido (AP-CONV-007).

**Critério de "pronto"**: o arquétipo cobre claramente o caso de campo-dentro-de-outra-tela, com receita de exibição e de persistência, não só o caso de tela-inteira.

---

## Iniciativa 3 — Formalizar a receita hook+wrapper

**Alvo**: `GlobusEvo.Minerva/catalogo-reuso/hooks-e-utils.md`.

- [x] **3.1** Nova entrada documentando o padrão genérico: hook `use<Entidade>Options()` (`useQuery` + `select` mapeando para `{label: "chave - descrição", value: chave}` — ou o valor real a persistir, se diferente da chave exibida, ver Iniciativa 2.3) + componente fino `<Entidade>Combobox` envolvendo o `Combobox`/`ComboboxGrid` do UIKit, injetando `options`/`loading` e expondo o resto das props por passthrough. Referência real: `TipoPrestacoesComboBox`/`useTipoPrestacoesOptions` (`GlobusWeb.Acidentes`).
- [x] **3.2** Nota de reuso: antes de criar um novo, checar se já existe combobox pronto no catálogo UIKit (`componentesUikit`) ou já implementado em outro módulo (via Federation, mesmo fluxo do AP-CONV-012) — nunca recriar.

**Critério de "pronto"**: existe uma receita copiável para "construir um combobox de referência novo", não só exemplos de componentes já prontos.

---

## Iniciativa 4 — Reforçar `oai-kit-conversao-especificador.md`

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-especificador.md`.

- [x] **4.1** No passo de de/para de componente: ao encontrar `TEdit(código)+lupa+TEdit(descrição)`, primeiro decidir "mesma tabela desta tela, ou tabela diferente?" — se mesma tabela, descartar a lupa citando AP-CONV-014/015 (nada a registrar); se tabela diferente, aplicar o sub-padrão da Iniciativa 2 (checar componente já pronto antes de propor criação).
- [x] **4.2** Ao aplicar o sub-padrão de combobox de referência, documentar na especificação: campo(s) exibido(s), campo(s) persistido(s) de fato, e a evidência que confirmou a ligação (linha do `.pas`, ou resposta do dev) — seguindo o procedimento da Iniciativa 2.3.

**Critério de "pronto"**: o especificador nunca deixa a decisão "o que persistir" implícita ou assumida do schema.

---

## Iniciativa 5 — Nova subseção em `_template-especificacao.md`

**Alvo**: `GlobusEvo.Minerva/especificacoes/_template-especificacao.md`.

- [x] **5.1** Nova seção condicional "Campos de referência (combobox)" — gatilho: algum campo é `Combobox` de referência a outra tabela (Iniciativa 2). Tabela: Campo | Tabela referenciada | Campo(s) exibido(s) | Campo persistido de fato | Evidência (linha do `.pas` ou "confirmado com o dev em AAAA-MM-DD"). Omitir se não houver nenhum campo desse tipo.

**Critério de "pronto"**: a especificação captura a distinção exibido/persistido antes da implementação, não só depois de um bug.

---

## Iniciativa 6 — Cruzar com AP-CONV-012 (referência a tabela de outro módulo)

**Alvo**: `packages/oai-kit-conversao/policies/conversion-policy.md` (nota em AP-CONV-012 ou na Iniciativa 2).

- [x] **6.1** Nota curta: quando a tabela referenciada pelo combobox pertence a outro módulo, seguir o fluxo já existente de AP-CONV-012 (dependência já implementada → consumir via Federation; não implementada → GAP cross-módulo, `N-ESPECIAL`) — o combobox de referência é só a camada de apresentação sobre esse mesmo mecanismo, não um caminho novo.

**Critério de "pronto"**: não existem dois fluxos paralelos e divergentes para "tabela de outro módulo" dependendo de ser consumida via combobox ou de outra forma.

---

## Ordem de execução sugerida

1. **Iniciativa 1** — ajuste pontual de 2 arquivos, corrige o critério de gatilho, base para tudo o resto.
2. **Iniciativa 2** — o núcleo da proposta (sub-padrão + exibição + persistência).
3. **Iniciativa 3** — receita reaproveitável, depende conceitualmente da 2 estar escrita.
4. **Iniciativa 4** — aplica as decisões da 1-3 no processo do especificador.
5. **Iniciativa 5** — captura a decisão na especificação (formaliza o passo 4.2).
6. **Iniciativa 6** — nota de fechamento, baixo risco, pode ser feita a qualquer momento após a 2.

## Como retomar

Cada sub-item com checkbox é uma unidade de trabalho independente. Ao retomar, reler o "Achado" correspondente (1-4, no Contexto) para não perder o motivo por trás da mudança, confirmar o alvo exato do arquivo, implementar, e marcar `[x]` só depois de aprovação explícita (mesmo padrão de gate usado nas iniciativas anteriores desta sessão).
