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

**Gatilhos de exceção → nível é sempre `N-ESPECIAL`**, vencem a pontuação incondicionalmente: procedure/function chamada no `.pas`; integração externa; gravação em tabela **não-relacionada** como efeito colateral (diferente de master-detail, que é escrita em tabela-filha da mesma família); "muitas" regras de negócio não-triviais (contagem: 0-2 poucas, 3-5 moderadas, 6+ muitas → dispara).

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

**Confirmação de schema** (colunas/tipos/PK/FK/triggers da tabela principal e das relacionadas por FK) — **não é gateada por nível**. Sempre que a tela tiver tabela Oracle real e o schema não estiver em cache (`descobertas-oracle/` via `minerva-index.json` → `tabelasConhecidas`), a sequência é: cache → tool dedicada → fallback de dicionário (AP-CONV-005) → **perguntar ao dev** se as três falharem ou o MCP não estiver configurado. Isso vale para **qualquer nível**, `N1` a `N-ESPECIAL` — o código Delphi sozinho não é evidência confiável do tipo real da coluna (ex: campo lido como `AsString` no Delphi pode ser `NUMBER` no Oracle; o driver tolera a conversão implícita). Toda descoberta é persistida em `descobertas-oracle/` — nunca fica só na especificação de uma tela isolada.

**Investigação profunda** (fonte de procedure/function via `get_object_source`, `find_references` para regra de negócio complexa) — continua gateada: só quando o nível é `N-ESPECIAL` **e** o objeto não está em cache **e** o MCP está configurado (`conversao.oracleMcpConfigured`). Telas `N1`-`N5` nunca precisam disso — é investigação cara, diferente de confirmar um tipo de coluna.

**Owner do schema**: o mesmo host pode ter múltiplos owners com tabelas de mesmo nome — **estruturalmente idênticas**, o owner não muda a tabela, só afeta qual instância a tool do MCP resolve. É **puramente um parâmetro de consulta em tempo de execução**: use `conversao.oracleSchemaOwner` se o dev tiver configurado essa chave (pessoal, por ambiente — nunca um valor fixo do kit). Se ausente, ou se a tabela não for encontrada sob esse owner, **pergunte ao dev qual owner usar** — nunca tente owners "parecidos" ou por tentativa e erro silenciosa (AP-CONV-007), e nunca assuma um owner "padrão" que não veio de configuração explícita ou da resposta do dev. **Owner nunca aparece em `descobertas-oracle/`** (nome de arquivo, conteúdo ou chave do índice) — só na chamada da tool.

### AP-CONV-007 — Nunca adivinhar por aproximação

Nome de tabela, procedure, objeto Oracle ou tela do legado: sempre nome exato ou correspondência inequívoca. Se a busca (schema, código ou `oai-kit-legacy-screen-locate`) não encontrar um candidato claro, o campo/objeto permanece `GAP` — nunca é substituído por um nome parecido.

### AP-CONV-008 — Sigla do módulo, branch e commit

Nunca commite sem a sigla do módulo confirmada pelo dev. Branch e commit seguem o padrão Praxio já documentado no `oai-kit.md` central — sem exceção para conversões, mesmo as mais simples.

### AP-CONV-009 — Fidelidade vence "padrão comum" do arquétipo

Nenhum agente adiciona campo, grid, botão ou qualquer funcionalidade que a tela legada (ou a especificação prévia, quando os sinais estruturais dela dizem o contrário) não tem — **mesmo que seja o padrão usual daquele arquétipo em outras telas**. Um arquétipo é um ponto de partida para a receita técnica (backend/frontend), nunca uma imposição de estrutura de UI sobre o que a tela realmente faz. Ex.: `crud-simples-pk-usuario` normalmente tem grid, mas se a tela real não tem, a conversão **não** adiciona grid.

Qualquer sugestão de adicionar algo que o legado não tinha (melhoria de UX, padronização) é registrada como proposta em `gaps/gaps-log.md` para decisão humana — nunca implementada silenciosamente como parte da conversão. (Origem: bug real encontrado na primeira conversão de teste — `especificacoes/folha/estado-civil.md`, corrigido em 2026-07-29.)

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

Qualquer hit de violação = veredicto BLOQUEADO até resolução.
