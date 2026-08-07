# Changelog — praxio-oai-kit-conversao

Formato baseado em [Keep a Changelog](https://keepachangelog.com/). Datas em ISO-8601.

## [Não lançado]

Origem: análise comparativa de um pacote de documentação real gerado por outra ferramenta de conversão (`migration-control-plane`/Reversa) para uma conversão já concluída (`GlobusWeb.Folha`, tela Cadastro de Horários) — usado para extrair formatos e capturas que o método markdown-based ainda não tinha. Achado relevante: `GlobusWeb.Folha/.oai-kit/` já é uma cópia real do kit (pós-AP-CONV-015) em uso de produção, confirmado pelo dev.

### Adicionado
- Passo 4b em `oai-kit-conversao-aprendizado.md`: decisão revertida por fato novo nunca reescreve entrada existente — sempre anexa nota `[Revisão — data]` preservando o raciocínio original. Convenção espelhada em `gaps-resolvidos.md`/`gaps-log.md` (Minerva).
- **Critério de Descarte** (`conversion-policy.md`, nova seção) e `gaps/descartes-log.md` (Minerva, novo arquivo append-only): categoria distinta de GAP para comportamento real do legado conscientemente não replicado (ex.: falha de segurança, bug conhecido, incompatibilidade arquitetural) — antes não tinha lar formal. Nova seção "Descartes conscientes" em `_template-especificacao.md`.
- **AP-CONV-009**: nota de exceção — fidelidade ao legado não se estende a falha de segurança confirmada (nunca replicar fallback de permissão liberado incondicionalmente). Nova armadilha #39 em `armadilhas-comuns.md` (Minerva) — número ajustado após rebase, pois #34 já havia sido usado por outra conversão concorrente no intervalo (`gaps-log.md` PTSTM-003/004).
- **Taxonomia para elemento Delphi sem equivalente visual** (`conversion-policy.md`): Descartar / Migrar para backend / Migrar como comportamento / Decisão humana — para `TFDStoredProc`/`TTimer`/`TIdHTTP`/thread, que antes eram forçados dentro da taxonomia de regras de negócio. Exemplos em `cheatsheets/delphi-para-nestjs.md` (Minerva).
- Nova categoria no Minerva: `cheatsheets/convencoes-implementacao.md` — convenções de código real descobertas por leitura de implementação (`insert: false` para coluna com trigger, `type: 'timestamp'` para hora-only, padrão de teste de `QueryService`, convenção `id: String(pk)` em mutations `nestjs-query-graphql`). `oai-kit-conversao-backend` passa a consultá-la.
- 3 seções condicionais em `_template-especificacao.md` (Minerva): "Fluxo crítico" (Mermaid, múltiplas escritas na mesma coluna), "Estados e habilitação de controles" (tabela exaustiva por estado do registro), "Colunas com mais de um caminho de escrita" (dentro de Tabela(s) Oracle).
- **AP-CONV-016** (`conversion-policy.md`): checklist LGPD para campo sensível (autorização, minimização de payload, mascaramento, auditoria quando já existir, bloqueio de exportação) — nova seção "Dados sensíveis / LGPD" em `_template-especificacao.md`.
- Critério de "pronto" mais estrito no checklist de `oai-kit-conversao-paridade`: item só conta como concluído se testado navegando pelo menu real (não URL direta), com ciclo funcional persistindo no backend.

Plano completo: `packages/oai-kit-conversao/docs/plano-aprendizados-migration-control-plane.md`.

**Origem (2026-08-07, segunda rodada)**: harmonização de 9 padrões de layout/componente reais (commit `e380f9ea9b8862a8db63c5b6c82715e78bc926d0` do Minerva) que só tinham sido corrigidos em 2 de 7 arquétipos — causa raiz: `oai-kit-conversao-frontend.md` nunca tratava wrapper de form/overlay como decisão de catálogo, e `oai-kit-conversao-aprendizado.md` nunca perguntava se um achado era transversal. Plano completo: `packages/oai-kit-conversao/docs/plano-harmonizacao-padroes-frontend.md`.

### Adicionado (continuação)
- `oai-kit-conversao-frontend.md`: novo passo tratando wrapper de formulário/overlay de loading como decisão de catálogo (AP-CONV-011), independente do arquétipo mencionar; 2 Restrições Absolutas novas (`Box component="form"` e ausência de `LoadingDialog`).
- `oai-kit-conversao-paridade.md` + `conversion-policy.md`: 6 itens novos de checklist grep-detectáveis para os 9 padrões (wrapper de form, ícones, PK readOnly, overlay de loading, pares de campo, coerção de PK numérica).
- `oai-kit-conversao-aprendizado.md`: pergunta de propagação transversal no passo 3 — todo achado precisa ser avaliado quanto a valer para todos os arquétipos CRUD, não só o de origem.
- 7 correções de contradição ativa nos arquétipos (`disabled`→`readOnly` em 4 arquivos, 2 referências de armadilha erradas, `@UseProximoCodigo()` incluído em `crud-simples-pk-gerada.md`) e propagação dos padrões omitidos para `padrao-frontend-crud-grid-modal.md`, `accordion-secoes-indice-numerado.md`, `grid-procedure.md`, `lookup-readonly.md`.
- Limpeza estrutural do Minerva: armadilha #33 reordenada, chave duplicada `EmpresaFilialGaragemCombobox` removida de `minerva-index.json`, referência quebrada corrigida em `DataGridSearchServer.md`, nova armadilha #40 (`size:"auto"`/`"grow"`).
- **Testes unitários do backend, obrigatórios em todo nível/padrão** (`oai-kit-conversao-backend.md`, novo passo 3b): `CreateInput`/`UpdateInput` sempre tem spec de `class-validator`; `QueryService` também, se houve override — checklist de `oai-kit-conversao-paridade` passa a bloquear ausência. Origem: inconsistência real entre conversões (algumas com spec, outras sem, sem exigência explícita no processo).
- `cheatsheets/convencoes-implementacao.md` (Minerva) ganha 2 entradas confirmadas por leitura de código real (`CadastroDetalheOcorrencia`/`CadastroCriterios`, GlobusWeb.Folha): wrapper key de `CreateOne<X>Input` segue o `@ObjectType()` (não o nome do método/mutation); padrão de teste de `CreateInput`/`UpdateInput` via `class-validator`.

**Origem (2026-08-07, terceira rodada)**: comportamento de conversão discutido com o dev — campos com lupa/browser de pesquisa no legado (`TEdit` código + lupa + `TEdit` descrição) precisam distinguir se referenciam a própria entidade da tela (lupa redundante, resolvida pelo grid embutido) ou uma tabela diferente (referência/FK genuína, vira `Combobox`). Referência real analisada: `GlobusWeb.Acidentes/front-end/src/features/Prestacao/CadastroPrestacao2.tsx` (`TipoPrestacoesComboBox`/`useTipoPrestacoesOptions`). Plano completo: `packages/oai-kit-conversao/docs/plano-combobox-referencia-fk.md`.

### Adicionado (continuação 2)
- **AP-CONV-017** (`conversion-policy.md`, novo): distingue lupa própria (nunca replicada, grid resolve) de lupa de referência genuína (vira `Combobox`); valor a persistir nunca assumido só pelo schema Oracle (mesmo princípio do AP-CONV-001) — confirmar via comportamento do legado + schema de ambas as tabelas + dev, nunca por nome parecido; cruza com AP-CONV-012 quando a tabela é de outro módulo.
- `cheatsheets/delphi-para-react.md`: linha de mapeamento do padrão `TEdit(código)+lupa+TEdit(descrição)` dividida em duas, pelo critério correto (mesma entidade vs. tabela diferente).
- `archetypes/lookup-readonly.md`: nova seção "Uso como sub-padrão de campo, dentro de outro arquétipo" (a receita vale para um campo isolado, não só telas classificadas inteiramente como lookup-readonly) + seções "O que trazer/exibir" e "O que persistir — não confiar só no schema Oracle" (procedimento de confirmação em 3 passos).
- `catalogo-reuso/hooks-e-utils.md` (Minerva): nova receita genérica "Combobox de referência (hook + wrapper)" para quando não existe componente pronto — `use<Entidade>Options()` + `<Entidade>Combobox` fino, referência real `TipoPrestacoesComboBox`.
- `_template-especificacao.md` (Minerva): nova seção condicional "Campos de referência (combobox)" — campo exibido vs. persistido de fato vs. evidência que confirmou a ligação.
- `oai-kit-conversao-especificador.md`: passo novo no de/para de componente aplicando o critério do AP-CONV-017 antes de mapear um campo com lupa.

**Origem (2026-08-07, quarta rodada)**: mudança de processo pedida pelo dev — a branch deixa de ser criada no gate final (depois do teste manual) e passa a ser criada **no início** de `/oai-kit-converter-tela`, antes de qualquer classificação/implementação. Plano completo: `packages/oai-kit-conversao/docs/plano-branch-antecipada.md`.

### Alterado
- **AP-CONV-008** (`conversion-policy.md`): reescrito — a branch é criada na etapa 1b de `oai-kit-conversao-triagem` (sincroniza `develop`, cria/faz checkout), não mais no gate final de `oai-kit-conversao-paridade` (que agora só commita). Nova regra absoluta: nunca fazer merge da branch para `develop`/`master`/`main`, em nenhuma circunstância — isso é sempre decisão do dev via PR, fora do escopo dos agentes.
- `oai-kit-conversao-triagem.md`: nova etapa "1b — Sincronizar develop e criar a branch", antes de qualquer classificação; template do plano ganha campo "Branch".
- `commands/oai-kit-converter-tela.md`: PASSO 1 e CHECKPOINT FINAL atualizados para refletir que a branch já existe desde o início.
- `oai-kit-conversao-paridade.md`: gate final não cria mais branch (só commita nela); nova Restrição Absoluta contra merge/commit em `develop`/`master`/`main`.
- Fora de escopo, confirmado: `/oai-kit-documentar-tela` (nunca implementa/commita) e o fluxo multi-repo de GAP cross-módulo (AP-CONV-012, branch criada só quando o GAP é confirmado, não há como antecipar).

**Revisão pontual (2026-08-07)** de `oai-kit-conversao-backend.md` após a mudança de branch antecipada: restrição de commit (Restrições Absolutas) atualizada para não descrever mais o cenário antigo ("commitar direto em `develop`"); Pré-condições ganham a confirmação de que a branch já existe; passo 3 (Implementar) ganha 2 bullets que faltavam — AP-CONV-016 (LGPD, medidas atribuídas ao backend pela policy mas nunca mencionadas no agente) e AP-CONV-017 (combobox de referência — criar/confirmar o módulo backend read-only da tabela referenciada).

**Revisão pontual (2026-08-07) de `oai-kit-conversao-aprendizado.md`** — falta bullet propondo entradas novas em `cheatsheets/convencoes-implementacao.md` (existia o arquivo, faltava o gatilho); e gap de transparência real no Gate Pré-Commit: a lista mostrada ao dev antes de aprovar não incluía `catalogo-reuso/hooks-e-utils.md` nem `catalogo-reuso/componentes/<Componente>.md`, apesar do passo 3 já instruir escrever nos dois — dev podia aprovar sem ver hook/componente novo sendo adicionado. Ambos corrigidos.

**Revisão pontual (2026-08-07) de `oai-kit-conversao-especificador.md`** — mesmo bug de pontuação encontrado na `triagem.md`: o cálculo de nível (passo 5) também não excluía a lupa da própria PK de "referências externas" (AP-CONV-017), risco de inflar o nível indevidamente. Adicionada a mesma ressalva; nova Restrição Absoluta contra registrar campo exibido como persistido sem confirmação.

**Revisão pontual (2026-08-07) de `oai-kit-conversao-paridade.md`** — mesmo padrão de gap do backend/frontend: a policy diz explicitamente que paridade verifica AP-CONV-016, mas o checklist estático não tinha nenhum item para LGPD nem para AP-CONV-017. Adicionados 2 bullets no passo de verificação estática: LGPD (autorização, minimização de payload, mascaramento, auditoria/exportação) e combobox de referência (campo persistido de fato documentado e usado na mutation, nenhuma lupa redundante da própria PK).

**Revisão pontual (2026-08-07) de `oai-kit-conversao-triagem.md`** — gap mais sério que o do backend/frontend: no fluxo direto (sem especificação prévia, comum em `N1`-`N3`), AP-CONV-016/017 podiam ser silenciosamente pulados, porque backend/frontend só checam "se a especificação tem a seção X" e a triagem não tinha nenhum passo/seção equivalente. Adicionado: novo passo 4f (detectar campo sensível e campo de referência com lupa, quando não veio de espec prévia); ressalva na pontuação estrutural — lupa/browser da própria entidade nunca conta como referência externa (AP-CONV-017); 2 seções novas no template do plano ("Dados sensíveis (LGPD)", "Campos de referência (combobox)"); 2 Restrições Absolutas novas.

**Revisão pontual (2026-08-07) de `oai-kit-conversao-frontend.md`** — mesmo tipo de gap do backend: nenhuma menção a branch/commit, AP-CONV-016 ou AP-CONV-017 apesar de a policy atribuir medidas de frontend a esses três. Adicionado: confirmação de branch já criada (Pré-condições); nota de que "Lookup" também vale como sub-padrão de campo (AP-CONV-017); 2 bullets no passo Implementar (mascaramento/bloqueio de exportação LGPD; usar componente pronto ou hook+wrapper do combobox de referência, enviando na mutation o campo persistido de fato, não o exibido); proposta de nova entrada em `hooks-e-utils.md` quando cria um wrapper de combobox novo (Output); 3 Restrições Absolutas novas (nunca commitar; nunca replicar lupa da própria PK; nunca enviar campo exibido sem confirmar que é o persistido).

## [0.1.13] — 2026-08-05

Origem: surgiu um novo padrão real de conversão (form inline 1:1 + grid de seleção, sem modal, com inteligência de campo-chave) confirmado em duas telas-irmãs de `GlobusWeb.Acidentes` (`CondicaoPavimento`/`CondicaoPista`), e um padrão para telas complexas com múltiplas `TabSheet`/`PageControl` do legado (accordion + índice numerado lateral, confirmado na tela de cadastro de Acidente do mesmo módulo). O padrão Grid+Modal (AP-CONV-014) deixa de ser a única estrutura obrigatória — agora é um de três padrões possíveis, escolhidos por tela via um novo mecanismo de decisão.

### Adicionado
- **Novo padrão de frontend "Inline+Grid"** (`archetypes/padrao-frontend-crud-inline-grid.md`, Minerva) — default a partir desta versão para `crud-simples-*`/`crud-pai-filho`, salvo sinalização em contrário: campos sempre visíveis (nunca modal) + grid de seleção abaixo sem coluna "Ações", duplo clique carrega a linha no form, inteligência de campo-chave (`onBlur` autofill / código vazio gera próximo via `@UseProximoCodigo`).
- **Novo arquétipo "Accordion + Índice Numerado"** (`archetypes/accordion-secoes-indice-numerado.md`, Minerva) — telas com múltiplas `TabSheet`/`PageControl` no legado, convertidas em `CustomAccordionGroup` (modo controlado) + `AccordionSectionsNavRail` (índice lateral numerado). 4 variantes de conteúdo de seção (form simples, sub-abas, `RepeatableForm`, `Table` read-only) e backend com cascade `OneToMany` multi-nível para sub-entidades próprias vs. REST read-only (Padrão B) para dados de outro domínio.
- **AP-CONV-015** (`conversion-policy.md`): mecanismo de escolha do padrão de frontend — convenção de texto (`Padrão de conversão: <valor>`) na descrição/comentário da task do Azure primeiro; senão inferência a partir dos sinais estruturais do legado (default `inline-grid` para cadastro simples, `accordion-indice` só para múltiplas `TabSheet`); senão perguntar ao dev apresentando as opções. `oai-kit-conversao-triagem` (passo 4d, novo) e `oai-kit-conversao-especificador` (passo 3d, novo) aplicam a mesma ordem.
- Novo índice `padroesFrontend` em `minerva-index.json` (Minerva) e nova seção "Componentes compartilhados de app (não-UIKit)" em `catalogo-reuso/hooks-e-utils.md` (Minerva) para `CustomAccordionGroup`/`AccordionSectionsNavRail`.
- Novas armadilhas #28-#33 em `cheatsheets/armadilhas-comuns.md` (Minerva): `RepeatableForm` remount por `key`, accordion sem lazy-load, scroll heurístico por timeout, validação cross-seção sem navegação automática, cascade `orphanedRowAction:'delete'` com risco de exclusão silenciosa, lock otimista sem unlock visível. Escopo da armadilha #25 (`fitColumns`) esclarecido: proibido só no padrão Grid+Modal, esperado no Inline+Grid.
- Novo campo "Padrão de conversão de frontend" em `especificacoes/_template-especificacao.md` (Minerva).

- **Critério de GAP endurecido** (`conversion-policy.md`, nova seção "Critério de GAP"): um GAP só deve ser registrado em `gaps/gaps-log.md` quando exige decisão/ação futura genuína para desbloquear algo — nunca para inconsistência de dado do Azure (índice de menu, SIM/PSE ausente) já contornada pela própria conversão, nem para convenção de processo já seguida corretamente. Origem: duas entradas desnecessárias (`GAP-001`, `GAP-002`) encontradas em `gaps-log.md` do Minerva e removidas nesta mesma revisão.
- `oai-kit-conversao-aprendizado` (passo 4) e `/oai-kit-registrar-gap` (novo passo 1, triagem antes de coletar): aplicam o mesmo teste do Critério de GAP antes de escrever qualquer entrada nova.
- `conversion-policy.md` (AP-CONV-013): nota explícita — divergência de `indicemenu` entre task Azure e Minerva, uma vez resolvida com o valor confirmado, não é GAP.
- **`tabelasConhecidas` extraído de `minerva-index.json` para `tabelasConhecidas.json`** (Minerva, arquivo novo): tinha crescido para 89% do índice (1531 entradas, ~239KB minificado — a maior parte de um import em massa de dicionário Oracle em 2026-07-31, não descoberta incremental por tela). `minerva-index.json` caiu de ~850KB (no disco, formatação verbosa do `ConvertTo-Json` do PowerShell) para ~40KB, voltando a ser genuinamente pequeno para o `Read` completo que todo agente faz no início. Nenhuma entrada foi removida/podada — só realocada. AP-CONV-006/012 e os agentes `oai-kit-conversao-triagem`/`-especificador`/`-aprendizado` passam a consultar essa tabela via **`Grep` pelo nome exato**, nunca `Read` do arquivo inteiro (a escrita/adição de entrada nova continua abrindo o arquivo normalmente — é operação rara, diferente da consulta de cache, que é frequente).
- Documentado (não implementado) o mesmo remédio para `especificacoes` em `minerva-index.json`, via `_nota` na própria entrada — gatilho: crescer para ~100+ entradas (~60-70KB+), o que a ambição de 600+ telas de `GlobusWeb.Folha` tornaria provável ao longo do tempo.

### Alterado
- **AP-CONV-014**: deixa de ser "sempre obrigatório" — passa a descrever a receita só para quando o padrão escolhido (via AP-CONV-015) é Grid+Modal. Nota antiga (2026-08-03) dentro de AP-CONV-009 atualizada para não contradizer isso.
- `oai-kit-conversao-frontend`, `oai-kit-conversao-triagem`, `oai-kit-conversao-especificador`, `oai-kit-conversao-backend`, `oai-kit-conversao-aprendizado`, `oai-kit-conversao-paridade`: ajustados para os 3 padrões de frontend possíveis em vez de assumir Grid+Modal sempre — inclui o gate final de paridade, que antes reprovaria como bloqueante uma conversão correta em Inline+Grid.
- `commands/oai-kit-converter-tela.md`, `commands/oai-kit-documentar-tela.md`: passos de triagem/especificação agora citam a decisão do padrão de frontend via AP-CONV-015.
- `archetypes/crud-simples-pk-usuario.md`, `crud-simples-pk-gerada.md`, `crud-pai-filho.md`, `grid-procedure.md` (Minerva): seção Frontend passa a apontar para a escolha entre os dois padrões via AP-CONV-015, em vez de Grid+Modal fixo.
- `especificacoes/_template-especificacao.md` (Minerva): seção "Grid" (antes "Grid principal") condiciona "Ações por linha" ao padrão de frontend decidido, em vez de assumir Grid+Modal.

### Corrigido
- `archetypes/crud-simples-pk-usuario.md` (Minerva): frase sobre envio do campo Código no `CreateInput` corrigida — neste arquétipo o código é sempre digitado e sempre enviado (obrigatório), diferente de `crud-simples-pk-gerada` (opcional); uma edição anterior havia copiado a semântica errada entre os dois arquivos.
- `cheatsheets/armadilhas-comuns.md` #33 e `archetypes/accordion-secoes-indice-numerado.md` (Minerva): afirmação sobre lock otimista sem desbloqueio corrigida — existe uma tela manual dedicada (`features/DesbloqueioRA/`) na referência real; o que não existe é chamada automática ao sair do formulário principal.
- `agents/oai-kit-conversao-frontend.md`: referência a "AP-CONV-014/passo 4d de `oai-kit-conversao-triagem`" corrigida para "passo 4e" após a renumeração dos passos da triagem (4d passou a ser a decisão do padrão de frontend).

## [0.1.12] — 2026-08-04

Origem: `oai-kit-conversao-especificador` criou `especificacoes/FLP/flp-criterios.md` (task Azure #617445) — uma pasta nova nomeada com a sigla do módulo, duplicando `especificacoes/folha/` que já existia com 5 outras telas do mesmo módulo (`FLP`). Corrigido no `GlobusEvo.Minerva` (arquivo movido para `especificacoes/folha/criterios.md`, `minerva-index.json` e `descobertas-oracle/FLP_CRITERIOS.md` atualizados).

### Corrigido
- **`oai-kit-conversao-especificador`**: passo 7 agora determina `<modulo>` (nome da pasta) a partir de `dicionarioModulos.siglas.<SIGLA>.repositorio` (ex.: `GlobusWeb.Folha` → `folha`) — nunca a sigla em si — e exige checar se a pasta já existe antes de criar uma nova. Nova restrição correspondente em Restrições Absolutas.
- `especificacoes/README.md` (Minerva): regra de nomeação de pasta explicitada, com instrução de sempre reaproveitar uma pasta de módulo já existente.

## [0.1.11] — 2026-08-04

Origem: feedback pós-conversão real de outra tela (Nacionalidades, FLP_617662) — dois bugs de UI só encontrados no teste manual do dev (verificação estática passou 100%, pois nenhum é erro de tipagem/sintaxe), mais uma observação de processo: o agente de backend implementou o frontend ele mesmo e commitou direto em `develop`, pulando o handoff para `oai-kit-conversao-frontend` e o checkpoint final de `oai-kit-conversao-paridade`.

### Adicionado
- **Restrição ao prop `mask` do `TextField`**: incompatibilidade real confirmada entre o `TextField` do UIKit e `react-input-mask@^3.0.0-alpha.2` (dependência que o próprio UIKit fixa) — crash em runtime (`Cannot read properties of undefined (reading 'disabled')`) não detectável por build/typecheck. Padrão recomendado: `inputProps={{ maxLength: N }}` + regex Zod.
- **Receita de altura do grid principal** (`containerHeight`, `pageSize` inicial 10): sem essa prop o container do `DataGridSearchServer` é sempre `height: 100vh` fixo, gerando sobra de espaço ou rolagem interna indevida. Fórmula (header + linhas reais × altura da linha + footer + folga) documentada em `archetypes/padrao-frontend-crud-grid-modal.md` e `catalogo-reuso/componentes/DataGridSearchServer.md`.
- **Restrição a `fitColumns`**: desativa o autosize embutido (única proteção nativa contra corte de cabeçalho) — nunca usar no grid principal sem razão documentada. Tabela de largura de coluna inicial por tipo Oracle (com folga).
- Convenção de nome `field: "acoes"` para a coluna de ações do grid (o `buildColumns` interno do UIKit identifica por esse nome exato).
- **Reforço no `oai-kit-conversao-backend`**: nunca implementar a feature de frontend ele mesmo (sempre acionar `oai-kit-conversao-frontend`, mesmo em `N1`-`N3`) e nunca commitar antes do checkpoint final de `oai-kit-conversao-paridade`.
- Novas armadilhas #21 (`mask`), #22 (grid sem `containerHeight`), #23 (`fitColumns`) em `cheatsheets/armadilhas-comuns.md` (Minerva).
- Verificações estáticas correspondentes em `oai-kit-conversao-paridade` e `conversion-policy.md`.

## [0.1.10] — 2026-08-03

Origem: feedback pós-conversão real de uma tela — o dev encontrou e corrigiu manualmente dois bugs (filtro de coluna do grid morto por `compliance`+`onFilterChange` stub; layout de cabeçalho quebrado por wrap numa única linha) que já estavam corretamente resolvidos em `GridCadastroDefeitos.tsx`/`GlobusWeb.Manutencao`, mas nunca haviam sido consultados.

### Adicionado
- **Checagem cross-repo de precedente estrutural** (`oai-kit-conversao-triagem`, novo passo 4d): quando o front-end do módulo alvo está em estágio "esqueleto" (pasta `features/` vazia/quase vazia) e o arquétipo é Grid+Modal, a triagem agora verifica `knownRepos` por uma tela já convertida do mesmo arquétipo antes do frontend inventar estrutura do zero.
- **Verificação estática de props do `DataGridSearchServer`** (`oai-kit-conversao-paridade`): compara as props passadas contra `catalogo-reuso/componentes/DataGridSearchServer.md`; sinaliza `compliance`/`hasSearchField` ligados sem necessidade documentada. Arquétipos Grid+Modal nunca devem ligar `compliance`.
- **Nova categoria de divergência "Bug de conversão"** (`oai-kit-conversao-paridade`, passo 3): distingue erro introduzido pela própria implementação (corrigir antes de commitar, nunca adiar como GAP) das categorias já existentes Aceita/GAP. Nova métrica `bugsConversaoCorrigidos` em `metrics/conversoes.jsonl` para rastrear recorrência entre conversões (`oai-kit-conversao-aprendizado`).
- **Regras de branch/commit no gate final de paridade** (AP-CONV-008): nunca commitar direto em `develop`/`master`/`main` — sempre criar branch nova; se a Task do Azure não tiver SIM/PSE vinculado (nem na própria Task, nem em Feature/Epic), usar o número da própria Task no lugar (`feature/{SIGLA}_TASK_{ID_AZURE}`). Após o commit, o agente sempre avisa o dev sobre push da branch e retroalimentação obrigatória do `GlobusEvo.Minerva` (o *momento* é escolha do dev, a retroalimentação em si nunca é dispensada).

### Restrições novas (`oai-kit-conversao-frontend`)
- Nunca ligar `compliance` no `DataGridSearchServer` para arquétipos Grid+Modal sem necessidade real documentada.
- Nunca montar o cabeçalho da tela principal como uma única `Box` com `flexWrap="wrap"` — sempre duas `Box` distintas.

### Base de conhecimento (`GlobusEvo.Minerva`, não versionada junto ao npm, mas consumida por esta versão)
- `catalogo-reuso/componentes/DataGridSearchServer.md`: corrigida a descrição de `hasSearchField` (gate do filtro por coluna, não um campo de busca geral); novo guia de decisão para `compliance`.
- `archetypes/padrao-frontend-crud-grid-modal.md`: snippet explícito de cabeçalho em 2 linhas.
- `cheatsheets/armadilhas-comuns.md`: novas entradas #19 (`compliance`+stub morto) e #20 (layout de cabeçalho).
- `metrics/README.md`: campo `bugsConversaoCorrigidos` documentado no schema.

## [0.1.9] — 2026-08-03

### Adicionado
- **AP-CONV-014 — padrão Grid+Modal obrigatório** para telas CRUD (`crud-simples-pk-usuario`, `crud-simples-pk-gerada`, `crud-pai-filho`, e telas-cadastro de `grid-procedure`): tela principal com busca explícita + grid (coluna Ações) + botão "Novo"; criar/editar/excluir sempre via `FormModal` (nunca form inline, nunca `Dialog` cru, nunca `window.confirm`) — independente de o legado ter grid ou não. Carve-out explícito do AP-CONV-009, restrito à decisão estrutural; fidelidade de campos/regras/dados não muda.
- Novo documento central `archetypes/padrao-frontend-crud-grid-modal.md` no `GlobusEvo.Minerva` (referência real: `GridCadastroDefeitos.tsx`/`CadastroDefeitos.tsx`, `GlobusWeb.Manutencao`).
- Verificação de estrutura Grid+Modal e uso de `FormModal` adicionada ao `oai-kit-conversao-paridade`.

### Alterado
- `oai-kit-conversao-frontend`, `oai-kit-conversao-especificador`, `oai-kit-conversao-triagem`: seções de padrão de UX/frontend atualizadas para descrever Grid+Modal explicitamente.
- `especificacoes/_template-especificacao.md` (Minerva): seção "Grid" deixa de ser opcional para arquétipos CRUD.

---

Versões anteriores a 0.1.9 não têm changelog formal — ver histórico de commits de `packages/oai-kit-conversao/` no repositório para o detalhamento (`0.1.0` a `0.1.8`: criação da extensão, taxonomia de regras Tipo 1/2/3, AP-CONV-012/013, resolução de menu, comando `update`, restrição do MCP Oracle).
