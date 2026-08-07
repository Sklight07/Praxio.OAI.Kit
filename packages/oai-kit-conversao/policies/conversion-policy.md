# Política: Conversion Policy

Verificações obrigatórias de `oai-kit-conversao-triagem`, `oai-kit-conversao-backend`, `oai-kit-conversao-frontend`, `oai-kit-conversao-paridade`, `oai-kit-conversao-especificador` e `oai-kit-conversao-aprendizado`. Violações são hard stops — consolida (sem duplicar por extenso) os princípios já estabelecidos em `{knowledgeBasePath}/padroes-globusweb/patterns/globusweb-principles.md` e `oracle-metadata-policy.md`.

## Escala de Classificação (N1-N5 / N-ESPECIAL)

Substitui qualquer noção de tier binário. Usada por `oai-kit-conversao-especificador` (ao gerar uma especificação prévia) e por `oai-kit-conversao-triagem` (ao classificar uma conversão, com ou sem especificação prévia).

**Pontuação estrutural** (só se nenhum gatilho de exceção estiver presente) — valores configuráveis, calibrar com a experiência real:

| Sinal | Peso |
|---|---|
| Grid presente | +1 |
| PK composta (2+ chaves) | +1 |
| Tabela(s)-filha / master-detail (mesma família de entidade) | +1 |
| Referências externas (FK/lookup para outra tabela) | nenhuma=0, poucas (1-2)=+1, muitas (3+)=+2 |

Soma → nível: `0`→N1, `1`→N2, `2-3`→N3, `4-5`→N4/N5 (mais pesado dentro da faixa = N5).

**Gatilhos de exceção → nível é sempre `N-ESPECIAL`**, vencem a pontuação incondicionalmente: procedure/function chamada no `.pas`; integração externa; gravação em tabela **não-relacionada** como efeito colateral (diferente de master-detail, que é escrita em tabela-filha da mesma família); "muitas" regras de negócio **Tipo 3 — Complexa** (contagem: 0-2 poucas, 3-5 moderadas, 6+ muitas → dispara); dependência cross-módulo que exige nova implementação (ver AP-CONV-012).

### Taxonomia de regras de negócio (usada por `oai-kit-conversao-especificador` ao documentar e por `oai-kit-conversao-triagem` ao contar)

Substitui a antiga classificação binária trivial/não-trivial. Toda regra de negócio encontrada numa tela cai em um dos 3 tipos:

- **Tipo 1 — Trivial**: validação simples de campo (obrigatório, tamanho, formato). Não conta para nada.
- **Tipo 2 — Condicional especificável**: regra redutível a uma tabela condição→efeito determinística, sem cálculo ou lógica externa. Inclui: habilitar/desabilitar/obrigar campo condicionado ao valor de outro campo; filtrar/restringir opções de combobox condicionado a outro campo; exibir/ocultar campo/seção/botão condicionado a outro campo; regra de navegação/ordem de preenchimento; e a **guarda de exclusão referencial** ("só é possível excluir se a PK não for referenciada como FK em outra tabela") — sempre um padrão nomeado e uniforme (verificar existência de referência antes do `DELETE`), independente de quantas tabelas referenciam a PK. Regras Tipo 2 **devem** ser especificadas por completo como tabela condição→efeito na especificação (nunca como descrição solta) — é isso que elimina a necessidade do conversor abrir o fonte Delphi por causa delas. **Não contam** para o gatilho de "muitas regras".
- **Tipo 3 — Complexa**: regra que exige cálculo multi-campo com fórmula de negócio própria (ex: cálculo de INSS/FGTS), depende de estado temporal/histórico, tem exceções aninhadas de verdade, ou exige ler múltiplas tabelas para decidir um valor (além de um guard de existência simples, que é Tipo 2). **Só regras Tipo 3 contam** para o gatilho "muitas regras" acima — o corte (0-2/3-5/6+) não muda, só o que é contado nele.

Ver o padrão "guarda de exclusão referencial" documentado em `{knowledgeBasePath}/cheatsheets/armadilhas-comuns.md` para a receita de implementação (back: `COUNT` contra a(s) tabela(s) referenciadora(s) antes do `DELETE`; front: capturar erro e mostrar toast) — nunca reinventar isso a cada tela.

### Classificação de elemento Delphi sem equivalente visual (eixo diferente da taxonomia de regras acima)

Usada por `oai-kit-conversao-especificador` ao encontrar um componente/objeto Delphi que não é controle de UI (ex.: `TFDStoredProc`, `TTimer`, `TIdHTTP`, thread) — antes de forçar o achado em Tipo 2/3 ou GAP, classifique-o em um dos 4 baldes:

- **Descartar**: mecanismo puramente da VCL/event loop do Delphi, sem efeito de negócio observável no alvo (ex.: timer que só força repaint). Não migra, não vira regra de negócio, não é GAP — só uma nota no output do que foi conscientemente descartado e por quê.
- **Migrar para backend**: lógica que pertence ao backend (chamada de procedure/function, integração externa, geração de arquivo, processamento em lote) — vira service/resolver, nunca componente de UI.
- **Migrar como comportamento**: não tem componente equivalente, mas o efeito observável (ex.: refresh periódico, side-effect ao focar/perder foco) precisa ser preservado por outro mecanismo no alvo (hook, polling, listener) — documentar o efeito, não o componente que o gerava.
- **Decisão humana**: genuinamente ambíguo se/como migrar — vira GAP.

Registrar a classificação escolhida e o motivo na especificação, seção "De/para de componente" — nunca deixar o elemento sem classificação explícita nem forçá-lo dentro de Tipo 2/3 só porque não há categoria própria.

**Cortes de uso** (configuráveis, calibrar com o tempo):
- **N1-N3**: especificação prévia (se existir) é suficiente sozinha — zero leitura do fonte Delphi.
- **N4-N5**: especificação prévia é usada, mas os "pontos de atenção" que o especificador sinalizou devem ser confirmados pontualmente contra o fonte (leitura parcial, não do conjunto inteiro).
- **N-ESPECIAL**: sempre lê o fonte inteiro — especificação prévia (se existir) vira só contexto/orientação, nunca substitui a leitura.

Na dúvida sobre se um gatilho de exceção se aplica, trate como se aplicasse — o padrão seguro é `N-ESPECIAL`.

## Sincronismo do `GlobusEvo.Minerva`

Aplica-se a todo agente/comando que lê ou escreve em `knowledgeBasePath` (`oai-kit-conversao-triagem`, `oai-kit-conversao-especificador`, `oai-kit-conversao-aprendizado`, `/oai-kit-registrar-gap`):

- **Pull obrigatório antes de qualquer leitura.** Se falhar (sem rede, working tree suja, conflito local não resolvido), o agente para e informa o dev — nunca prossegue sobre uma base potencialmente desatualizada (outro dev pode já ter documentado/convertido/registrado algo sobre a mesma tela).
- **Push não é uma pergunta separada e opcional.** Uma vez que o dev aprove o commit no Minerva, o agente sempre tenta o push em seguida, no mesmo gate. Se rejeitado por non-fast-forward, tenta `git pull --rebase` + push automaticamente **uma vez**; se ainda conflitar (mais provável em `minerva-index.json`, o único arquivo não append-only da base), para e mostra o conflito ao dev — nunca resolve sozinho.
- **Staleness de especificação prévia**: ao reaproveitar uma especificação, sempre comparar `mtime`/`tamanho` dos arquivos-fonte registrados contra o estado atual antes de confiar nela. Divergência não bloqueia automaticamente, mas exige perguntar ao dev se confia mesmo assim ou prefere regenerar a especificação.

## Critério de GAP — o que registrar em `gaps/gaps-log.md` e o que não registrar

Aplica-se a `oai-kit-conversao-aprendizado` e a `/oai-kit-registrar-gap` (os dois únicos escritores de `gaps-log.md`), e a qualquer agente que sinalize algo como candidato a GAP antes deles. **Nota (2026-08-05): critério endurecido após revisão** — `gaps-log.md` acumulou entradas que nunca deveriam ter sido registradas como GAP (ver histórico removido na mesma revisão); este critério existe para não repetir o erro.

**Um GAP é só uma decisão ou problema real que fica pendente ao final da conversão** — exige que **alguém ainda precise fazer algo** (decidir, corrigir, implementar) para desbloquear ou resolver, e essa ação **não aconteceu** dentro desta conversão pontual porque o risco/escopo extrapola ela (arquitetura, negócio, banco, ou trabalho cross-módulo genuíno).

**Nunca registrar GAP para:**
- Inconsistência de dado num card do Azure (índice de menu, SIM/PSE ausente, qualquer campo divergente) que **já foi resolvida dentro da própria conversão** — o valor correto foi identificado (via Minerva, legado, ou pergunta ao dev) e usado. Isso não ficou pendente; nada a mais precisa acontecer para a conversão estar correta. Corrigir o dado errado no card do Azure é rotina de quem gerencia o backlog, não uma decisão arquitetural/de negócio — e não é o trabalho deste sistema rastrear rotina de outro sistema.
- Convenção de processo já estabelecida sendo aplicada normalmente (ex.: usar o ID da Task no lugar de SIM/PSE ausente, conforme AP-CONV-008) — a convenção **funcionou como esperado**, não é uma decisão pendente.
- Nome de branch/commit, nomenclatura de pasta, ou qualquer detalhe processual que já tem regra definida em `oai-kit.md`/`conversion-policy.md` e foi seguido corretamente.
- Qualquer achado que, relatado, serviria só de aviso informativo sem exigir ação de ninguém para desbloquear algo.

**Sempre registrar GAP para:**
- Decisão de negócio/arquitetura genuinamente pendente (ex.: comportamento divergente do Delphi que precisa de validação do PO/arquiteto antes de decidir se é aceito).
- Dependência cross-módulo que exige nova implementação em outro repositório, ainda não feita (AP-CONV-012).
- Ambiguidade real que não pôde ser resolvida nem pela base central nem perguntando ao dev.
- Divergência de comportamento vs. Delphi, reportada no teste manual, que o dev não aprovou como melhoria consciente (categoria "GAP" de `oai-kit-conversao-paridade`, passo 3 — este uso já é corretamente restrito, manter).

**Teste rápido antes de registrar**: "isso exige que alguém tome uma decisão ou ação futura para desbloquear algo, ou é só uma nota de que um dado estava errado e a conversão já contornou sozinha?" — só o primeiro caso é GAP. Na dúvida genuína (não a maioria dos casos), prefira **não registrar** e mencionar o achado só no output da conversão (`.oai-flow/delivery/{ID}-conversao-patch.md`) — `gaps-log.md` é lido por todo o time; ruído ali custa tempo de todo mundo, não só de quem registrou.

## Critério de Descarte — o que registrar em `gaps/descartes-log.md` e o que não registrar

Aplica-se a `oai-kit-conversao-especificador` (ao documentar, quando encontra comportamento candidato) e a `oai-kit-conversao-aprendizado` (único escritor de `descartes-log.md`). Categoria distinta de GAP e de "Aceita" (`oai-kit-conversao-paridade`):

- **GAP** = decisão/problema que **ainda** precisa de ação futura de alguém para ser desbloqueado.
- **Descarte** = decisão **já tomada** nesta conversão de não replicar um comportamento real do legado, com risco/trade-off que vale documentar — não é rotina resolvida, é uma escolha.
- **Aceita** (`oai-kit-conversao-paridade`) = divergência descoberta **depois** de implementado, durante teste manual, validada pelo dev — ponto diferente do pipeline (pós-implementação, não pré-implementação).

**Teste rápido**: "o legado realmente faz/tem isso, e a conversão decidiu conscientemente não replicar, com um motivo que vale registrar (segurança, bug conhecido, inconsistência, incompatibilidade arquitetural)?" → Descarte. "Alguém ainda precisa decidir/agir no futuro?" → GAP. "O legado não fazia isso mesmo, ou o valor já estava certo?" → nenhum dos dois, nem nota.

**Sempre registrar como Descarte:**
- Comportamento legado que é um risco (ex.: folga de segurança — AP-CONV-009, nota 2026-08-07) — nunca replicado.
- Comportamento legado reconhecidamente um bug/inconsistência que a conversão decide corrigir em vez de replicar fielmente.
- Mecanismo do legado (ex.: estado local de edição) sem equivalente necessário na arquitetura alvo — não é bug nem GAP, é diferença arquitetural por design.

**Nunca registrar como Descarte:**
- Comportamento que vira regra de negócio Tipo 2/3 e **é** replicado normalmente.
- Ausência de algo que o legado nunca teve.
- Dado incorreto que a conversão já contornou usando o valor certo (isso é rotina resolvida — ver Critério de GAP).

Formato de entrada em `descartes-log.md`: origem (arquivo:linha), descrição, justificativa, vínculo a mudança de padrão/arquitetura (o que substitui, se houver), risco de descartar.

## Proibições Absolutas

### AP-CONV-001 — Metadado nunca autoriza comportamento sozinho

Existência de tabela, PK, sequence, schema Oracle ou schema GraphQL **nunca** autoriza automaticamente incluir/alterar/excluir, expor um campo, ou confirmar que uma procedure é "a regra certa". Toda operação de CRUD proposta precisa de evidência real no `.pas`/arquivos da tela (`CONFIRMED`) — na ausência, é `INFERRED` e deve ser sinalizado como tal, nunca apresentado como certo.

### AP-CONV-002 — Sem contrato GraphQL inventado

Nunca proponha um campo, query ou mutation GraphQL que não tenha sido confirmado contra o padrão real do módulo-alvo (`backend-pattern.md`) ou contra o arquétipo aplicável. Ambiguidade de contrato é `GAP`, não invenção.

### AP-CONV-003 — UIKit é transversal

Nenhuma conversão pontual altera um componente do `GlobusWeb.UIKit` sem: (1) grep pelos consumidores em todos os front-ends, (2) avaliação explícita de breaking change, (3) aprovação humana fora do escopo da tela em conversão. Isso é sempre nível `N-ESPECIAL`.

### AP-CONV-004 — Sem DDL/alteração de schema Oracle

Nenhuma conversão altera schema Oracle (DDL, trigger, procedure, function) sem decisão humana explícita de banco/engenharia. Isso é sempre fora do escopo de uma conversão de tela.

### AP-CONV-005 — Restrição de ferramentas do MCP Oracle

Quando `praxio-oracle-discover-mcp` estiver configurado (ver AP-CONV-006), os agentes de conversão usam **prioritariamente** ferramentas de metadado/estrutura: `describe_table`, `describe_procedure`, `describe_view`, `list_constraints`, `list_indexes`, `get_ddl`, `get_object_source`, `find_references`, `search_objects`, `list_packages`.

**`execute_sql` é permitido, mas só como fallback estreito**: (a) somente depois que a tool dedicada (`describe_table`/`list_constraints`/etc.) falhar ou se mostrar indisponível para o objeto (ex: `ORA-00942` numa tabela que existe — limitação conhecida da tool), **e** (b) a query é um `SELECT` restrito a esta allowlist de views de dicionário de dados, filtrada por owner/nome do objeto: `ALL_TAB_COLUMNS`, `ALL_CONSTRAINTS`, `ALL_CONS_COLUMNS`, `ALL_TAB_COMMENTS`, `ALL_COL_COMMENTS`, `ALL_TRIGGERS`, `ALL_INDEXES`, `ALL_IND_COLUMNS`, `ALL_OBJECTS`. Fora dessa allowlist, `execute_sql` continua proibido.

**Sempre proibido no contexto de conversão:** `query_table`, `sample_data`, `query_eso_informacao_gerar`, e qualquer `execute_sql` fora da allowlist acima (isso inclui qualquer tabela de negócio real, ex: `FLP_ESTADOCIVIL`) — essas leem dados de linha/negócio, não estrutura, violando o princípio de nunca ler valores/amostras/dados pessoais já estabelecido em `oracle-metadata-policy.md`.

### AP-CONV-006 — Dois usos do MCP Oracle, dois gates diferentes

**Confirmação de schema** (colunas/tipos/PK/FK/triggers da tabela principal e das relacionadas por FK) — **não é gateada por nível**, mas **é sempre condicionada ao cache primeiro, por tabela**. Depois de identificar no legado quais tabelas a tela precisa (principal + relacionadas por FK/lookup), o processo é:

1. **Para cada tabela**, consulte o cache **antes de cogitar o MCP** — mas nunca via `Read` de `minerva-index.json` para isso (ver nota de tamanho abaixo). Desde 2026-08-05, `tabelasConhecidas` é um arquivo separado (`{knowledgeBasePath}/tabelasConhecidas.json`, ~1500+ entradas) — a consulta é sempre um **`Grep` pelo nome exato da tabela** (ex.: padrão `"FLP_ESTADOCIVIL":`) nesse arquivo, nunca um `Read` do arquivo inteiro. Se a entrada existir, **o MCP não é chamado para esta tabela** — leia diretamente `{knowledgeBasePath}/<arquivo apontado pela entrada>` (o `descobertas-oracle/<TABELA>.md`, que já tem colunas/tipos/PK/FK/constraints completos — o índice guarda só o ponteiro, nunca os detalhes). Isso vale mesmo que o arquivo ainda tenha divergências Delphi-vs-Oracle marcadas `[completar]` (import em massa sem cruzamento de `.pas` ainda) — completar essas notas é comparar contra o `.pas` real da tela, **não** chamar o MCP de novo; o schema em si já está confirmado.
2. **Só as tabelas sem entrada em `tabelasConhecidas.json`** (ou com entrada genuinamente stale — schema realmente mudou desde `verificadoEm`, não só nota `[completar]` pendente) seguem a sequência de descoberta: tool dedicada → fallback de dicionário (AP-CONV-005) → **perguntar ao dev** se as duas falharem ou o MCP não estiver configurado. **Adicionar uma entrada nova** (ao contrário da consulta) exige abrir o arquivo para editar — isso é esperado e aceitável, é uma operação pontual e rara (só quando a tabela é genuinamente nova), diferente da consulta de cache, que é frequente (várias tabelas checadas por tela) e por isso nunca deve custar um `Read` do arquivo inteiro.

**Nota de tamanho (2026-08-05):** `tabelasConhecidas` foi extraído de `minerva-index.json` para `tabelasConhecidas.json` porque chegou a ser 89% do índice (1531 entradas, ~239KB) — a maior parte de um import em massa de dicionário Oracle (FLP/SRH/ESO/FRQ, 2026-07-31), não descoberta incremental por tela. Isso nunca deve ser podado/removido (as entradas serão necessárias conforme mais telas desses módulos forem convertidas) — só deixou de ser carregado por inteiro a cada agente. `minerva-index.json` ficou ~40KB (era ~850KB no disco, a maior parte formatação verbosa do PowerShell `ConvertTo-Json` sem nenhuma informação a mais) — voltou a ser genuinamente pequeno, seguro para `Read` completo como o resto dos agentes já assume.

Isso vale para **qualquer nível**, `N1` a `N-ESPECIAL` — o código Delphi sozinho não é evidência confiável do tipo real da coluna (ex: campo lido como `AsString` no Delphi pode ser `NUMBER` no Oracle; o driver tolera a conversão implícita), mas **isso só importa pra tabela que ainda não foi confirmada** — uma vez em `tabelasConhecidas`, confia-se no cache. Toda descoberta nova é persistida em `descobertas-oracle/` — nunca fica só na especificação de uma tela isolada. **O MCP Oracle é usado só quando genuinamente necessário — não é obrigatório em toda conversão.**

**Investigação profunda** (fonte de procedure/function via `get_object_source`, `find_references` para regra de negócio complexa) — continua gateada: só quando o nível é `N-ESPECIAL` **e** o objeto não está em cache **e** o MCP está configurado (`conversao.oracleMcpConfigured`). Telas `N1`-`N5` nunca precisam disso — é investigação cara, diferente de confirmar um tipo de coluna.

**Owner do schema**: o mesmo host pode ter múltiplos owners com tabelas de mesmo nome — **estruturalmente idênticas**, o owner não muda a tabela, só afeta qual instância a tool do MCP resolve. É **puramente um parâmetro de consulta em tempo de execução**: use `conversao.oracleSchemaOwner` se o dev tiver configurado essa chave (pessoal, por ambiente — nunca um valor fixo do kit). Se ausente, ou se a tabela não for encontrada sob esse owner, **pergunte ao dev qual owner usar** — nunca tente owners "parecidos" ou por tentativa e erro silenciosa (AP-CONV-007), e nunca assuma um owner "padrão" que não veio de configuração explícita ou da resposta do dev. **Owner nunca aparece em `descobertas-oracle/`** (nome de arquivo, conteúdo ou chave do índice) — só na chamada da tool.

### AP-CONV-007 — Nunca adivinhar por aproximação

Nome de tabela, procedure, objeto Oracle ou tela do legado: sempre nome exato ou correspondência inequívoca. Se a busca (schema, código ou `oai-kit-legacy-screen-locate`) não encontrar um candidato claro, o campo/objeto permanece `GAP` — nunca é substituído por um nome parecido.

### AP-CONV-008 — Sigla do módulo, branch e commit

Nunca commite sem a sigla do módulo confirmada pelo dev. Branch e commit seguem o padrão Praxio já documentado no `oai-kit.md` central — sem exceção para conversões, mesmo as mais simples.

**Nunca commite diretamente em `develop`/`master`/`main`** — no gate final de `oai-kit-conversao-paridade` (após o dev confirmar o teste manual), sempre crie uma branch nova antes de aplicar o commit, mesmo que o dev esteja posicionado numa dessas branches naquele momento. Se a Task do Azure não tiver SIM/PSE vinculado (nem nela, nem navegando a hierarquia até a Feature/Epic), use o número da própria Task do Azure no lugar do número de SIM/PSE: `feature/{SIGLA}_TASK_{ID_AZURE}` (ou `hotfix/...`, conforme a origem). Após o commit, o push da branch nova para o remoto e a retroalimentação do `GlobusEvo.Minerva` (via `oai-kit-conversao-aprendizado`) nunca ficam implícitos — ver gate final em `oai-kit-conversao-paridade`. (Origem: 2026-08-03, reforço pedido após feedback pós-conversão real.)

### AP-CONV-009 — Fidelidade vence "padrão comum" do arquétipo

Nenhum agente adiciona campo, grid, botão ou qualquer funcionalidade que a tela legada (ou a especificação prévia, quando os sinais estruturais dela dizem o contrário) não tem — **mesmo que seja o padrão usual daquele arquétipo em outras telas**. Um arquétipo é um ponto de partida para a receita técnica (backend/frontend), nunca uma imposição de estrutura de UI sobre o que a tela realmente faz. Ex.: `crud-simples-pk-usuario` normalmente tem grid, mas se a tela real não tem, a conversão **não** adiciona grid.

Qualquer sugestão de adicionar algo que o legado não tinha (melhoria de UX, padronização) é registrada como proposta em `gaps/gaps-log.md` para decisão humana — nunca implementada silenciosamente como parte da conversão. (Origem: bug real encontrado na primeira conversão de teste — `especificacoes/folha/estado-civil.md`, corrigido em 2026-07-29.)

**Nota (2026-08-03, atualizada 2026-08-05): o exemplo acima sobre grid foi superado, especificamente quanto à decisão estrutural, pelos AP-CONV-014/015** — para arquétipos CRUD, a tela sempre tem grid (mesmo que o legado não tivesse), mas a estrutura em si (Grid+Modal, Inline+Grid, ou Accordion+Índice) é escolhida por tela via AP-CONV-015, não é mais um único padrão fixo para todos os casos. Este AP-CONV-009 continua valendo integralmente para **fidelidade de campos, regras de negócio e dados** (nunca adicionar campo/regra que o legado não tem) — só a decisão "grid sim/não, qual estrutura de container" deixou de ser regida por fidelidade estrutural 1:1 para esses arquétipos.

**Nota (2026-08-07): fidelidade não se estende a falha de segurança confirmada.** Quando o comportamento do legado é uma falha de segurança sem justificativa de negócio identificável (ex.: liberar incondicionalmente todas as permissões de um recurso ao fechar uma tela, "para o caso de não existir definição para o usuário"), a regra de fidelidade deste AP-CONV-009 não se aplica no sentido de obrigar a replicar — a conversão não reproduz o comportamento e registra `GAP` para investigação humana antes de decidir o que fazer no alvo. Diferente do carve-out do AP-CONV-014/015 (que é sobre *adicionar* estrutura nova): aqui a exceção é sobre **não replicar** algo que o legado de fato tem. (Origem: achado analisado em pacote de conversão real de terceiro, 2026-08-07.)

### AP-CONV-010 — Agentes nunca executam os projetos

Nenhum agente de conversão sobe/executa o back-end ou o front-end do GlobusWeb — nem para smoke test, nem para "confirmar que o schema reflete o módulo", nem para validar fluxo de UI. O máximo permitido:
- `npm run build` / compilação / lint / typecheck (verificação estática).
- `npm install`/`npm ci` **só** se `package.json` mudou (nova dependência).

Testar a aplicação rodando (subir o servidor, clicar na tela, validar GraphQL Playground) é **sempre** responsabilidade do desenvolvedor, depois que os agentes terminam. `oai-kit-conversao-paridade` prepara um checklist de teste manual para o dev executar — não assume que passou.

### AP-CONV-011 — Catálogo de componentes UIKit vence exploração de `node_modules`

Antes de usar qualquer componente de `@praxio/globusweb-uikit` numa tela, `oai-kit-conversao-frontend` e `oai-kit-conversao-especificador` consultam **primeiro** `{knowledgeBasePath}/catalogo-reuso/componentes/<Componente>.md` (índice rápido: `minerva-index.json` → `componentesUikit`). Nunca abrem `node_modules/@praxio/globusweb-uikit/dist/*.d.ts` nem a `ui-generator-kb.json` interna do próprio UIKit (tem erros confirmados — props de componentes internos aparecem atribuídas ao componente errado) como primeira parada.

Só cai para leitura de `node_modules`/fonte real (`src/types/*.d.ts` do `GlobusWeb.UIKit`, se o dev tiver o repo local, senão `.d.ts` compilado mesmo) quando o componente **não está catalogado ainda** em `componentesUikit`. Nesse caso, ao final da conversão, propor a nova entrada via `oai-kit-conversao-aprendizado` seguindo `_template-componente.md` — mesmo fechamento de loop já usado para arquétipos novos (AP-CONV-009 tem o precedente).

**Staleness não é por versão exata** — o pacote publica múltiplas versões por semana; tratar toda divergência de versão como "catálogo inválido" geraria falso positivo o tempo todo. Antes de confiar numa entrada do catálogo:
1. Comparar a versão instalada do `@praxio/globusweb-uikit` no projeto-alvo (`node_modules/@praxio/globusweb-uikit/package.json`) com `uikitVersaoVerificada` da entrada.
2. Se igual, confiar direto na entrada do catálogo.
3. Se diferente, **não descartar automaticamente** — grep `node_modules/@praxio/globusweb-uikit/CHANGELOG.md` pelo nome do componente entre as duas versões:
   - Aparece mencionado → sinalizar "possível mudança, confirmar contra `src/types/<X>.d.ts` real (ou `.d.ts` compilado)" antes de usar a receita do catálogo como está.
   - Não aparece → tratar a entrada como ainda válida; atualizar só `uikitVersaoVerificada`/`verificadoEm` da entrada no Minerva (refresh barato, sem reprocessar o componente inteiro).

Componentes cuja entrada tem `temExemploReal: false` não são menos confiáveis quanto a props/comportamento (vieram da mesma leitura de `src/types/*.d.ts` + implementação) — só significa que nenhuma tela já convertida usou esse componente ainda. Ao ser o primeiro a usar um desses, atualizar a seção "Exemplo de uso real" da entrada via `oai-kit-conversao-aprendizado` com o exemplo real gerado.

### AP-CONV-012 — Tabela de outro módulo nunca vira domínio local; GAP cross-módulo é sempre `N-ESPECIAL`

O GlobusWeb é composto por repositórios/módulos independentes, cada um dono de um conjunto de tabelas Oracle identificável por prefixo (`{knowledgeBasePath}/minerva-index.json` → `dicionarioModulos.prefixosTabela`, resolvido em dois níveis: prefixo → sigla implementadora → `dicionarioModulos.siglas` para nome do repositório). **Nunca implementar entidade/domínio de uma tabela num módulo que não é o dono dela** — o consumo correto é sempre via Apollo Federation/gateway, nunca duplicando a entidade localmente. Isso é a mesma regra de "nunca modifica UIKit sem avaliar todos os consumidores" do AP-CONV-003, aplicada a domínio de dados.

**Detecção (todo agente que referencia uma tabela que não é a principal da tela):** resolver o prefixo da tabela via `prefixosTabela` → sigla implementadora, comparar contra a sigla do módulo da tela atual. Divergem → dependência cross-módulo real. Prefixo ausente do dicionário → perguntar ao dev qual sigla é dona e persistir a resposta — nunca inventar (mesmo princípio do AP-CONV-007). **Atenção**: a sigla implementadora pode não ser óbvia pelo prefixo — ex. tabelas `ESO_` implementam-se no módulo `FLP` (Folha de Pagamento), não num módulo `ESO` próprio (não existe repositório `GlobusWeb.ESO`); sempre resolver pela sigla implementadora do dicionário, nunca pelo prefixo bruto.

**Dois cenários, dois tratamentos:**
1. **Dependência já implementada** (`implementacaoBackend.existe: true` na entrada da tabela em `{knowledgeBasePath}/tabelasConhecidas.json` — arquivo separado do índice desde 2026-08-05, consultado por grep pelo nome exato da tabela, nunca `Read` do arquivo inteiro) — consumir via Federation, documentar a referência (entidade/GraphQL type do módulo dono). **Não força `N-ESPECIAL`** — é tratada como qualquer "referência externa" normal da pontuação estrutural (0/+1/+2). Consumir algo já pronto e documentado é barato.
2. **Dependência exige nova implementação** (`implementacaoBackend` ausente ou `existe: false`, GAP genuíno) — antes de assumir isso, `oai-kit-conversao-especificador` deve checar `implementacaoBackend`; se ainda não há entrada nenhuma, localizar o repositório do módulo dono (lookup em `knownRepos` → sugerir a convenção de caminho-irmão observada, ex. `<pai-do-repo-atual>\GlobusWeb.<Modulo>` → **sempre confirmar com o dev antes de usar, nunca assumir silenciosamente**, mesmo mecanismo "Múltiplos Repositórios" do `oai-kit.md` central), sincronizar a branch `develop` daquele repositório (`git fetch`/`checkout develop`/`git pull`), e verificar lá se já existe entidade/resolver para a tabela antes de concluir que é GAP. Só depois dessa verificação, se realmente não existir em nenhum lugar, é GAP cross-módulo — e **isso força `N-ESPECIAL`**, independente de quão simples o resto da tela pareça: criar implementação nova no repositório de outro módulo é trabalho multi-repo e arquitetural, justifica o checkpoint humano por si só.

**Implementação de GAP cross-módulo (`oai-kit-conversao-backend`, só quando `N-ESPECIAL` por este motivo) é sempre multi-repo:**
1. **Gate de Plano** antes de tocar no segundo repositório — mostrar exatamente o que será criado lá (entidade, resolver, nome da branch) e pedir aprovação explícita.
2. Branch no **outro** repositório seguindo o mesmo padrão Praxio (`feature/{SIGLA}_{SIM|PSE}_{numero}` — mesmo número de ticket, é a mesma feature atravessando repositórios).
3. Implementar lá (entidade/resolver/`@key` Federation) seguindo os padrões daquele módulo.
4. Voltar ao módulo da tela e consumir via Federation.
5. **Output final consolidado**: repositórios tocados, branch usada em cada um, arquivos alterados por repositório — antes de paridade/aprendizado.

Ao final, `oai-kit-conversao-aprendizado` persiste a implementação nova (ou confirmada) em `implementacaoBackend` da entrada da tabela em `tabelasConhecidas.json` e qualquer mapeamento de prefixo↔sigla confirmado com o dev em `dicionarioModulos.prefixosTabela` (esse sim em `minerva-index.json`) — para o próximo módulo que precisar da mesma tabela nunca mais perguntar ou explorar.

### AP-CONV-013 — Índice de menu nunca é adivinhado; resolução sempre por `indicemenu` + `nome` + módulo

Toda tela GlobusWeb precisa de um código de índice de permissão (`indice`, string — ex: `"000100"`) usado no mapa `labels: Record<rota, indice>` de `menu.constants.tsx` (ver `cheatsheets/armadilhas-comuns.md` #16). **Mesmo princípio do AP-CONV-007**: nunca derivar esse código do nome do arquivo/tela ou do caption do menu — captions podem se repetir entre menus diferentes; `indicemenu`/`nome` nunca.

**O valor que importa é sempre `indicemenu`** (o índice estrutural do `.dfm` do legado) — é o mesmo valor reaproveitado como `indice` no GlobusWeb, tanto para o legado quanto para a conversão. Alguns índices de menu legado trazem também `indicemenu_glb7`/`caption_glb7` (quando presentes) — esses são o índice/caption do **mesmo item de menu em outra aplicação (GLB7)**, **nunca** usados para preencher o `indice` desta conversão; servem só como referência cruzada entre sistemas (ver `menus/legado/_template-menu-legado.md`).

**Resolução por 3 parâmetros — `indicemenu`, `nome`, módulo (implícito pelo contexto da conversão, ex.: tela de Folha → módulo `FLP`, busca sempre dentro de `menus/legado/FLP.json`, nunca cruzando módulos):**

1. **Task do Azure traz `indicemenu` e `nome`** (cenário ideal) — procure a entrada em `menus/legado/<SIGLA>.json` cujo `indicemenu` **e** `nome` batam exatamente com os dois. Isso identifica um único registro sem ambiguidade.
2. **Task traz só um dos dois** — procure por esse único valor no arquivo do módulo:
   - Exatamente um resultado → use-o, resolvido, sem perguntar nada.
   - Mais de um resultado, **divergentes entre si** (índices/nomes diferentes) → **só aqui** pergunte ao dev, mostrando os candidatos para ele escolher.
   - Nenhum resultado → pergunte ao dev o valor que falta.
3. **Task não traz nenhum dos dois** — pergunte ao dev diretamente (`indicemenu` e/ou `nome`, ou a hierarquia de captions se o módulo não tiver `menus/legado/<SIGLA>.json` ainda). Nunca adivinhe por nome de arquivo/caption.

**Nunca pergunte ao dev reflexivamente** — só nos dois casos acima (ambiguidade real com candidatos divergentes, ou dado ausente). Um único valor que já resolve para um único registro não precisa de confirmação adicional.

**Se o valor de `indicemenu` na task do Azure divergir do valor confirmado em `menuLegado.<SIGLA>`**: use o valor confirmado pelo Minerva (é a fonte mais confiável que o texto livre da task) e siga a conversão normalmente. **Isso não é um GAP** — o valor correto foi identificado e usado, nada ficou pendente; ver "Critério de GAP" acima. Mencionar a divergência no output da conversão é suficiente (para quem gerencia o card corrigi-lo por rotina, se quiser) — não em `gaps-log.md`.

**Hierarquia de menu (até 3 níveis) nunca assume o nível mais alto por padrão** — consultar `{knowledgeBasePath}/minerva-index.json` → `menuGlobusWeb.<SIGLA>` para saber quais grupos/submenus já existem em `menu.constants.tsx` antes de decidir onde a tela entra; criar só os níveis que realmente faltam. Um 3º nível de menu pode ser o primeiro caso real no módulo (hoje a maioria só tem 2) — isso é uma mudança direta na estrutura local, não um bloqueio; sinalizar como novidade no output.

### AP-CONV-014 — Padrão Grid+Modal é um dos padrões estruturais válidos para telas CRUD (carve-out do AP-CONV-009)

**Nota (2026-08-05): este AP-CONV deixou de ser a única estrutura obrigatória — ver AP-CONV-015.** Até 2026-08, Grid+Modal era sempre a estrutura para os arquétipos CRUD. A partir de agora, é **um dos padrões possíveis** (ao lado de Inline+Grid, `padrao-frontend-crud-inline-grid.md`), escolhido tela a tela pelo mecanismo do AP-CONV-015 — nunca mais assumido automaticamente só porque o arquétipo de backend é `crud-simples-*`/`crud-pai-filho`/`grid-procedure`-cadastro. Este AP-CONV continua descrevendo a receita **quando o padrão escolhido é Grid+Modal**:

Para os arquétipos `crud-simples-pk-usuario`, `crud-simples-pk-gerada`, `crud-pai-filho`, e telas classificadas em `grid-procedure` que são fundamentalmente um cadastro (lista + criar/editar/excluir, mesmo com backend Padrão B por PK composta/Federation/procedure — ex.: `CadastroDefeito` em GlobusWeb.Manutencao), quando o padrão escolhido (AP-CONV-015) é Grid+Modal, a estrutura de frontend é:

1. **Tela principal**: busca (campo + botão explícito "Pesquisar" + Enter — nunca debounce automático) + botão "Novo" + `DataGridSearchServer`/`Datagrid` com coluna "Ações" (ícones Editar/Excluir).
2. **Criar/editar**: sempre `FormModal` (nunca form inline acima do grid, nunca `Dialog` cru).
3. **Excluir**: sempre `FormModal` de confirmação (nunca `Dialog` cru, nunca `window.confirm`).

Receita completa em `{knowledgeBasePath}/archetypes/padrao-frontend-crud-grid-modal.md`.

**A escolha entre Grid+Modal e Inline+Grid é deliberadamente independente de o legado ter grid, form inline, ou modal** — é uma decisão estrutural do time/AP-CONV-015, um carve-out explícito do AP-CONV-009 (fidelidade vence padrão comum) **só quanto a essa decisão estrutural específica**. AP-CONV-009 continua em vigor integralmente para fidelidade de **campos, regras de negócio e dados** — nunca adicionar campo/regra que o legado não tem, mesmo dentro de qualquer um dos dois padrões estruturais. Se o legado não tinha grid, as colunas/o grid da tela são escolhidos entre os campos mais identificadores/buscáveis do form original — nunca inventados.

Telas de ciclo de vida com múltiplas etapas (ex.: `OrdemServico`, abertura→execução→fechamento→cancelamento) **não** seguem nenhum dos dois padrões — continuam sem uma estrutura única de UX (ver seção Frontend de `grid-procedure.md`). Na dúvida se uma tela `grid-procedure` é "cadastro" ou "ciclo de vida", tratar como ciclo de vida (mais seguro) e perguntar ao dev.

### AP-CONV-015 — Escolha do padrão de frontend: convenção na task > inferência via Minerva > perguntar ao dev

Toda tela cai em um de três padrões de frontend — **Grid+Modal** (`padrao-frontend-crud-grid-modal.md`), **Inline+Grid** (`padrao-frontend-crud-inline-grid.md`), ou **Accordion+Índice Numerado** (`accordion-secoes-indice-numerado.md`, quando o arquétipo de backend é `accordion-secoes-indice-numerado` — múltiplas `TabSheet`/`PageControl` no legado) — mais o caso já existente de telas de ciclo de vida sem padrão único (`grid-procedure` fora do caso "cadastro"). `oai-kit-conversao-triagem` decide qual, nesta ordem, **nunca perguntando reflexivamente quando um passo anterior já resolveu**:

1. **Convenção de texto na task do Azure (sinal explícito, sempre vence)**: procure, na descrição ou em comentário da task, uma linha no formato `Padrão de conversão: <valor>` (mesmo lugar/hábito onde a task já traz os caminhos do fonte legado), com `<valor>` sendo um dos identificadores de `minerva-index.json` → `padroesFrontend` (`grid-modal`, `inline-grid`) ou `accordion-indice` (alias curto para o arquétipo `accordion-secoes-indice-numerado`). Se encontrado, **use direto, sem inferir nem perguntar** — este é o cenário ideal, o dev já decidiu.
2. **Inferência a partir dos sinais estruturais do legado + do que já está documentado no Minerva** (só se a task não trouxer o sinal explícito):
   - Legado com `PageControl`/múltiplas `TabSheet` → arquétipo de backend é `accordion-secoes-indice-numerado`; padrão de frontend é `accordion-indice`, sem alternativa.
   - Cadastro simples/pai-filho (`crud-simples-*`, `crud-pai-filho`, `grid-procedure`-cadastro) — **com ou sem grid no legado** — → **default `inline-grid`** (é a mesma ideia de conversão 1:1 tanto para telas que já tinham grid quanto para as que não tinham: adapta-se o form para ficar acompanhado de um grid de seleção). Só infira `grid-modal` em vez disso quando houver um motivo estrutural real e documentável (ex.: volume de campos que não caberia razoavelmente acima de um grid) — nunca por hábito ou porque "é o padrão mais antigo/conhecido".
   - Telas de ciclo de vida multi-etapa continuam sem padrão único (nenhuma inferência aqui, ver `grid-procedure.md`).
3. **Perguntar ao dev, mostrando as opções, só quando os passos 1-2 genuinamente não resolverem** (ex.: sinais estruturais ambíguos, ou uma tela que parece caber em mais de um padrão) — a pergunta sempre apresenta os padrões disponíveis (com uma frase do que cada um significa) para o dev escolher, nunca só "qual padrão usar?" sem contexto.

Registrar no plano da triagem **qual dos 3 passos resolveu** (sinalizado na task | inferido | perguntado ao dev) — é isso que permite auditar depois se a inferência está calibrada certo (ex.: se o passo 3 está sendo acionado com frequência alta para um tipo de tela, é sinal de que a regra de inferência do passo 2 precisa de mais um caso coberto).

### AP-CONV-016 — Checklist LGPD para campo sensível

Quando a tela manipula CPF, dado de saúde, dado financeiro sigiloso, ou outro campo classificável como dado pessoal sensível pela LGPD, `oai-kit-conversao-especificador` documenta e `oai-kit-conversao-backend`/`-frontend` implementam, e `oai-kit-conversao-paridade` verifica:

- **Autorização de acesso**: campo sensível visível/editável só para perfil de permissão apropriado — nunca exposto a todo usuário autenticado por padrão.
- **Minimização de payload**: query/resolver GraphQL retorna só os campos sensíveis que a tela realmente exibe — nunca o registro inteiro "por via das dúvidas".
- **Mascaramento de exibição**: quando a tela não precisa do dado completo à vista, mascarar parcialmente (ex.: CPF com dígitos ocultos) — seguir o padrão já usado no legado, se existir; se o legado não mascarava, registrar `GAP` (decisão de segurança/compliance) em vez de decidir sozinho.
- **Trilha de auditoria**: alteração de dado sensível registrada (quem, quando, valor anterior) só se o módulo já tiver mecanismo de auditoria equivalente — não invente um mecanismo novo fora de escopo; se não existir e a regra parecer exigir, registre `GAP`.
- **Bloqueio de exportação/cópia**: exportar/imprimir/copiar não inclui dado sensível não mascarado além do que o legado já permitia.

Isso é verificação adicional — não substitui `security-policy.md` (credenciais/SQL/XSS, genérico ao kit, não específico de dado pessoal em tela convertida).

### AP-CONV-017 — Campo com lupa/browser de pesquisa: distinguir PK própria (redundante) de referência genuína (FK)

O legado tem um padrão VCL recorrente — `TEdit` (código) + lupa/`JvSpeedButton` (abre browser de pesquisa) + `TEdit` (descrição, read-only, autopreenchida) — que exige decidir **a que tabela** esse código se refere antes de decidir o de/para:

- **Referencia a mesma entidade sendo cadastrada nesta tela** (a própria PK): a lupa existe no legado só porque a tela não tem grid embutido — é o mecanismo de encontrar/editar um registro existente quando o usuário não sabe o código de cor. Nossos arquétipos CRUD **já sempre têm grid embutido** (AP-CONV-014/015), que resolve o mesmo problema por clique na linha. **A lupa nunca é replicada** — isso não é GAP nem Descarte a registrar caso a caso, é consequência direta da decisão estrutural já tomada.
- **Referencia uma tabela diferente** (FK/referência genuína — ex.: campo Área dentro de um Cadastro de Funcionário): vira `Combobox` carregado com as opções da tabela referenciada, nunca a réplica literal código+lupa+descrição. Receita completa (o que trazer/exibir, o que persistir, quando reaproveitar componente já pronto) em `{knowledgeBasePath}/archetypes/lookup-readonly.md`, seção "Uso como sub-padrão de campo".

**O valor a persistir nunca é assumido só pelo schema Oracle** — mesmo princípio do AP-CONV-001 (metadado nunca autoriza comportamento sozinho): a coluna realmente gravada na tabela principal pode divergir da chave exibida no combobox (ex.: `CODINTFUNC` persistido vs. `CODFUNC`/chapa exibido), e essa ligação pode não ser uma FK declarada no Oracle. Confirmar sempre pelo comportamento real do legado (o que o `.pas` grava ao escolher o registro) cruzado com o schema de ambas as tabelas — nunca adivinhar por nome parecido (AP-CONV-007); perguntar ao dev se não for possível confirmar.

Se a tabela referenciada pertence a outro módulo, o combobox de referência é só a camada de apresentação sobre o mecanismo já existente do **AP-CONV-012** (dependência já implementada → Federation; não implementada → GAP cross-módulo, `N-ESPECIAL`) — não é um caminho novo e paralelo.

## Ordem de referência para padrões (economia de tempo)

`{knowledgeBasePath}/padroes-globusweb/patterns/*.md` são documentos de governança, escritos para arquitetos — completos, mas caros de ler por inteiro a cada tela. O arquétipo (`archetypes/<x>.md`), os cheatsheets e o catálogo de componentes (`catalogo-reuso/componentes/`) já resumem o que é necessário para os casos comuns (`N1`-`N5`).

**Ordem**: arquétipo/cheatsheet/catálogo de componentes primeiro, sempre. Só abrir o arquivo completo em `padroes-globusweb/patterns/` (para arquitetura/regras de negócio) ou explorar `node_modules`/fonte do `GlobusWeb.UIKit` (para um componente não catalogado) quando a situação encontrada genuinamente não estiver coberta pela receita — normalmente só em `N-ESPECIAL` ou componente novo. Abrir o documento completo de governança ou reverse-engineerar um componente já catalogado é tempo desperdiçado; registrar em `metrics/conversoes.jsonl` (`padroesGlobusWebAbertos`) sempre que isso acontecer, para calibrar se o cheatsheet/catálogo precisa ficar mais completo.

## Verificações do `oai-kit-conversao-paridade`

Antes de aprovar qualquer conversão, verifique:
- Nenhuma chamada a `query_table`/`sample_data` aparece no histórico de ferramentas usadas pela triagem/especificador/backend; qualquer `execute_sql` usado está restrito à allowlist de dicionário de dados do AP-CONV-005 (nunca contra tabela de negócio real).
- Toda tabela/schema confirmado via MCP ou perguntado ao dev está persistido em `descobertas-oracle/` — não ficou só na especificação/plano da tela isolada.
- Nenhuma alteração em arquivos de `GlobusWeb.UIKit` sem o processo do AP-CONV-003.
- Todo campo marcado `INFERRED` no plano da triagem está claramente sinalizado como tal no output final (não foi silenciosamente promovido a `CONFIRMED`).
- Nenhum campo/grid/botão foi adicionado além do que a tela legada (ou a especificação) realmente tem (AP-CONV-009).
- Nenhuma tentativa de subir/rodar o projeto aparece no histórico de ações do backend/frontend (AP-CONV-010) — só build/lint/typecheck/install.
- Uso de componentes `@praxio/globusweb-uikit` consultou primeiro `catalogo-reuso/componentes/` (AP-CONV-011); se algum componente usado não estava catalogado, uma proposta de nova entrada foi gerada para `oai-kit-conversao-aprendizado`.
- Nenhuma entidade/domínio de tabela de outro módulo foi implementada localmente (AP-CONV-012) — dependências cross-módulo já implementadas são consumidas via Federation; GAPs cross-módulo genuínos passaram pelo fluxo multi-repo completo (gate, branch no outro repositório, output consolidado).
- O `indice` de menu usado em `menu.constants.tsx` bate exatamente com o documentado na spec/task Azure (AP-CONV-013 — nunca inventado); a hierarquia de menu criada corresponde à seção "Menu e navegação" da spec, sem níveis pulados ou criados a mais.
- O padrão de frontend escolhido (Grid+Modal | Inline+Grid | Accordion+Índice) está registrado no plano com sua origem (sinalizado na task | inferido | perguntado ao dev — AP-CONV-015); a inferência do passo 2 do AP-CONV-015, quando usada, seguiu a regra documentada (default `inline-grid` para cadastro simples/pai-filho, `accordion-indice` só para múltiplas TabSheet) — não foi uma escolha arbitrária do agente.
- **Se o padrão é Grid+Modal** (AP-CONV-014): tela principal tem busca+grid+"Novo"; criar/editar usa `FormModal` (nunca form inline, nunca `Dialog` cru); excluir usa `FormModal` de confirmação (nunca `Dialog` cru, nunca `window.confirm`); cabeçalho em 2 linhas distintas (título+Novo; busca+Pesquisar), nunca 1 linha com wrap (armadilha #20); grid principal com `containerHeight` computado dinamicamente (nunca o default `100vh`, armadilha #24) e **nunca `fitColumns`** sem razão documentada (armadilha #25); `compliance` do `DataGridSearchServer` nunca ligado sem necessidade real (armadilha #19).
- **Se o padrão é Inline+Grid** (`padrao-frontend-crud-inline-grid.md`): campos sempre visíveis (nunca modal) + grid abaixo **sem coluna "Ações"**; duplo clique na linha carrega o registro no form; campo-chave com inteligência de autofill (`onBlur`) e geração automática quando vazio; `fitColumns`+`autoHeight` no grid são esperados neste padrão (não é a mesma proibição do Grid+Modal, ver nota de escopo na armadilha #25).
- **Se o padrão é Accordion+Índice Numerado** (`accordion-secoes-indice-numerado.md`): cada seção corresponde 1:1 a uma `TabSheet` do legado (mesmos campos/grids, nunca adicionados/removidos); `id` de seção compatível com a nomenclatura de permissão legada quando a tela tiver permissionamento por aba; submit único cobrindo todas as seções; sub-listas próprias via `RepeatableForm`, dados de outro domínio via `Table` read-only — nunca o inverso (ver armadilhas #28-#33).
- Se a tela usa `DataGridSearchServer` fora do escopo dos dois itens acima: props comparadas contra `catalogo-reuso/componentes/DataGridSearchServer.md` — `compliance`/`hasSearchField` sinalizados se ligados sem necessidade documentada.
- Nenhum `TextField` usa o prop `mask` — incompatível em runtime com a versão de `react-input-mask` fixada pelo UIKit, mesmo corretamente tipado (armadilha #23, bug real confirmado 2026-08-04); usar `inputProps={{ maxLength: N }}` + regex Zod.
- **Padrões de layout/componente transversais** (2026-08-07): nenhum `Box component="form"` como wrapper de formulário (deve ser `Form` do UIKit); nenhum import de `@mui/icons-material` (deve ser `@praxio/globusweb-uikit/icons`); campo de PK em modo edição nunca usa `disabled` (deve ser `InputProps={{readOnly}}`); toda operação de save/delete tem `LoadingDialog` de overlay junto a `isSaving`/`isDeleting`; pares "campo curto + campo que ocupa o resto" usam `size:"auto"`+`size:"grow"` (armadilha #40); comparação de PK numérica vinda de GraphQL sempre com `Number()`/`String()` explícito, nunca `===` estrito (armadilhas #3/#38).
- Backend nunca implementa a feature de frontend ele mesmo (mesmo em `N1`-`N3` — sempre aciona `oai-kit-conversao-frontend`) e nunca commita antes do checkpoint final de `oai-kit-conversao-paridade` (AP-CONV-008 — origem: incidente real FLP_617662, 2026-08-04).
- Divergência de comportamento reportada pelo dev classificada em uma de 3 categorias — **Aceita** (melhoria consciente vs. Delphi), **GAP** (não resolvível agora vs. Delphi) ou **Bug de conversão** (erro introduzido pela própria implementação — corrigido antes de commitar, nunca adiado como GAP; contabilizado em `metrics/conversoes.jsonl` → `bugsConversaoCorrigidos` para rastrear recorrência).
- **Critério de "pronto" do checklist manual** (2026-08-07): só conta como concluído um item testado navegando pelo menu real do GlobusWeb (nunca por URL digitada direto), completando o ciclo funcional até persistir no backend — a tela abrir/compilar sem erro não conta como pronto.
- **Testes unitários do backend** (2026-08-07): `CreateInput`/`UpdateInput` sempre têm spec de validação (`class-validator`, `validate()`); `QueryService` também, se houve override. Ausência é bloqueante, independente do nível ser `N1` (ver `oai-kit-conversao-backend.md`, passo 3b, e `cheatsheets/convencoes-implementacao.md`).
- Se a tela manipula campo sensível (LGPD), o checklist AP-CONV-016 foi aplicado (autorização, minimização de payload, mascaramento, auditoria quando já existir, bloqueio de exportação).

Qualquer hit de violação = veredicto BLOQUEADO até resolução.
