# Plano — Harmonização de padrões de frontend e fechamento da causa raiz de inconsistência visual

> Documento de planejamento (2026-08-07). **Nada aqui foi implementado ainda.** Cada item com checkbox é uma unidade de trabalho independente, para marcar `[x]` conforme for feito e aprovado.

## Contexto e fonte

Análise disparada por: (1) commit real `e380f9ea9b8862a8db63c5b6c82715e78bc926d0` no `GlobusEvo.Minerva`, que corrigiu 9 padrões de layout/componente após duas conversões reais (`CadastroDetalheOcorrencia` #617110, `Cadastro de Criterios` #617445); (2) arquivo de staging `padroes-pendentes-minerva.md` (já totalmente incorporado ao commit); (3) 3 auditorias paralelas cruzando os 7 arquétipos frontend, os agentes do `oai-kit-conversao`, e a integridade estrutural do Minerva.

**Motivação real**: o dev reportou muitas inconsistências visuais/layout e uso errado de componente nas conversões recentes. A análise confirmou que a causa raiz **não é falta de conhecimento no Minerva** — é **propagação estreita**: um aprendizado corrige só o arquétipo/tela de origem, nunca se pergunta se é transversal, e o agente de paridade (a rede de segurança) não ganha checklist novo. Resultado: 2 de 7 arquétipos corrigidos, os outros 4-5 continuam ensinando ou permitindo o padrão errado, e a próxima conversão nesses arquétipos está estruturalmente destinada a repetir os mesmos erros.

**Os 9 padrões de referência** (todos já aplicados no Minerva pelo commit citado, servem de vocabulário para este plano):
1. Wrapper de formulário = componente `Form` do UIKit (nunca `Box component="form"`).
2. Ícones sempre de `@praxio/globusweb-uikit/icons`, nunca `@mui/icons-material` direto.
3. Overlay `LoadingDialog` durante save/delete (nunca só desabilitar botão).
4. Campo PK em edição: `InputProps={{readOnly: modoEdicao}}`, nunca `disabled`.
5. Pares "campo curto + campo que ocupa o resto": `size:"auto"` + `size:"grow"`, nunca frações fixas + `maxWidth`.
6. `pageSize` inicial do grid sempre `10`.
7. `@UseProximoCodigo()` para PK opcional com geração automática.
8. Comparação de PK numérica de GraphQL sempre com `Number()`/`String()` explícito, nunca `===`.
9. Altura de grid sem rolagem interna: `Box sx={{height:"100%","& > div":{height:"100% !important"}}}` (Inline+Grid) vs. `containerHeight` calculado (Grid+Modal, rolagem interna genuinamente desejada).

---

## Iniciativa 1 — Corrigir contradições ativas (P0, maior urgência)

Texto hoje ensina/permite ativamente o padrão errado — qualquer conversão nova nesses arquétipos herda o erro.

**Alvo**: `archetypes/padrao-frontend-crud-grid-modal.md`, `crud-pai-filho.md`, `crud-simples-pk-gerada.md`, `grid-procedure.md`, `lookup-readonly.md` (todos no Minerva).

- [x] **1.1** `padrao-frontend-crud-grid-modal.md:163` — corrigido para `InputProps={{readOnly: true}}`, nunca `disabled`.
- [x] **1.2** `crud-pai-filho.md:27` — corrigido, só `readOnly`.
- [x] **1.3** `crud-simples-pk-gerada.md:30` — corrigido, só `readOnly`.
- [x] **1.4** `grid-procedure.md:28` — corrigido, só `readOnly`.
- [x] **1.5** `lookup-readonly.md:47` — referências corrigidas para `#12`/`#13`.
- [x] **1.6** `crud-pai-filho.md:34` — referência corrigida para `#13`.
- [x] **1.7** `crud-simples-pk-gerada.md` — tabela reescrita com `@UseProximoCodigo()` como opção preferencial.

**Critério de "pronto"**: os 4 arquétipos com PK editável usam a mesma frase para `readOnly`/`disabled`; as 2 referências de armadilha apontam para o conteúdo certo; `crud-simples-pk-gerada.md` cita `@UseProximoCodigo()` como opção de primeira classe.

---

## Iniciativa 2 — Limpeza estrutural do Minerva (independente, baixo risco)

**Alvo**: `cheatsheets/armadilhas-comuns.md`, `minerva-index.json`, `catalogo-reuso/componentes/DataGridSearchServer.md`.

- [x] **2.1** Bloco `## 33. Lock otimista...` movido para a posição correta, entre `## 32.` e `## 34.` — sequência 1-39 confirmada.
- [x] **2.2** Entrada duplicada `EmpresaFilialGaragemCombobox` removida (mantida a ocorrência em ordem alfabética correta).
- [x] **2.3** Referência corrigida em `DataGridSearchServer.md:51` para o nome atual da seção.
- [x] **2.4** Nova armadilha #40 em `armadilhas-comuns.md` reaproveitando a regra de `frontend-pattern.md`.

**Critério de "pronto"**: numeração de armadilhas sequencial na ordem do arquivo; `minerva-index.json` sem chave duplicada; nenhuma referência textual a nome de seção que não existe mais; `size:auto/grow` acessível sem precisar abrir `patterns/*.md`.

---

## Iniciativa 3 — Fechar a lacuna estrutural em `oai-kit-conversao-frontend.md` (causa raiz, camada 1)

**Achado**: o agente nunca trata "wrapper do formulário/overlay de loading" como decisão de catálogo — AP-CONV-011 só dispara para componente já nomeado (combobox, grid), nunca para a estrutura base da tela. Por isso o agente cai em conhecimento genérico de React exatamente onde o UIKit tem convenção própria.

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-frontend.md`.

- [x] **3.1** Instrução adicionada no Passo 1 — wrapper/overlay tratados como decisão de catálogo, independente do arquétipo.
- [x] **3.2** 2 Restrições Absolutas novas adicionadas.

**Critério de "pronto"**: uma tela nova de qualquer arquétipo CRUD, convertida do zero (sem o arquétipo específico mencionar `Form`/`LoadingDialog`), ainda assim usa os componentes certos porque o agente principal exige isso independente do arquétipo.

---

## Iniciativa 4 — Fechar a rede de segurança em `oai-kit-conversao-paridade.md`

**Achado**: hoje o checklist estático pega de forma confiável só 1 dos 9 padrões (`pageSize`). Os outros 8 passam sem nenhum sinal, mesmo sendo a maioria greps triviais.

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-paridade.md`, `packages/oai-kit-conversao/policies/conversion-policy.md` (seção "Verificações do `oai-kit-conversao-paridade`").

- [x] **4.1** Bullet novo adicionado ao checklist estático de `oai-kit-conversao-paridade.md` com os 6 itens grep-detectáveis.
- [x] **4.2** Espelhado em `conversion-policy.md`, seção "Verificações do `oai-kit-conversao-paridade`".

**Critério de "pronto"**: dos 9 padrões, pelo menos 7 (os estaticamente detectáveis) têm item de checklist correspondente — não dependem mais de o agente "lembrar" sem gatilho.

---

## Iniciativa 5 — Fechar o processo de aprendizado (evitar recorrência)

**Achado**: `oai-kit-conversao-aprendizado.md` só propõe atualização no arquivo de origem do achado — nunca pergunta se o padrão é transversal a todos os arquétipos CRUD. É o motivo estrutural de só 2 de 7 arquétipos terem sido corrigidos desta vez.

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-aprendizado.md`.

- [x] **5.1** Pergunta de propagação transversal adicionada no início do Passo 3, com origem citada (episódio real desta harmonização).

**Critério de "pronto"**: a próxima vez que uma conversão real encontrar um padrão transversal, o agente de aprendizado propõe a propagação completa (arquétipos irmãos + frontend.md + paridade.md) na mesma rodada, não só o arquivo de origem.

---

## Iniciativa 6 — Propagar os padrões omitidos para os arquétipos ainda não corrigidos

Itens que hoje **omitem** (não contradizem) os 9 padrões, mas são omissões de risco real — a lista completa por arquétipo está na auditoria; os itens abaixo são os que a auditoria classificou como não-N/A.

**Alvo**: `archetypes/padrao-frontend-crud-grid-modal.md`, `accordion-secoes-indice-numerado.md`, `grid-procedure.md`, `lookup-readonly.md`.

- [x] **6.1** `padrao-frontend-crud-grid-modal.md` — ícones corrigidos no exemplo (`Add`/`Search`/`Edit`/`Delete` de `@praxio/globusweb-uikit/icons`), overlay `LoadingDialog` adicionado, nota de `size:auto/grow` no bloco do modal, "Referência real" reforçada com snippet `FormModal` correto ao lado do aviso sobre `Dialog` cru.
- [x] **6.2** `accordion-secoes-indice-numerado.md` — nota de wrapper `Form` + overlay `LoadingDialog` adicionadas na seção de Submit.
- [x] **6.3** `grid-procedure.md` — nota de overlay `LoadingDialog` para operações `@Transactional()` adicionada.
- [x] **6.4** `lookup-readonly.md` — nota de `size:auto/grow` para o par código+descrição adicionada.

**Critério de "pronto"**: os 4 arquétipos restantes cobrem os padrões aplicáveis ao seu contexto, sem depender de reaproveitar por acaso o texto de `crud-simples-pk-usuario.md`/`padrao-frontend-crud-inline-grid.md`.

---

## Ordem de execução sugerida

1. **Iniciativa 1** (P0, contradições ativas) — maior urgência, menor ambiguidade, corrige o que está ensinando errado agora.
2. **Iniciativa 2** (limpeza Minerva) — independente, baixo risco, pode ser feita em paralelo à 1.
3. **Iniciativa 3** (`oai-kit-conversao-frontend.md`) — fecha a causa raiz camada 1 (agente nunca trata wrapper/overlay como decisão de catálogo).
4. **Iniciativa 4** (`oai-kit-conversao-paridade.md`) — fecha a rede de segurança; depende conceitualmente da 3 estar feita (mesmos padrões, dois lados do mesmo processo).
5. **Iniciativa 5** (`oai-kit-conversao-aprendizado.md`) — fecha o processo para não repetir o problema em aprendizados futuros.
6. **Iniciativa 6** (propagar para arquétipos restantes) — completa a cobertura; menor urgência que as contradições ativas da Iniciativa 1, mas mesmo peso de "ficar pra trás" se adiada indefinidamente.

## Como retomar

Cada sub-item com checkbox é uma unidade de trabalho independente. Ao retomar, reler o "Achado" da iniciativa correspondente, confirmar o alvo exato do arquivo (pode ter mudado desde que este plano foi escrito), implementar, e marcar `[x]` só depois de aprovação explícita (mesmo padrão de gate usado nas iniciativas anteriores desta sessão).
