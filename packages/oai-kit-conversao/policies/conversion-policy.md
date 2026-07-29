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

Quando `praxio-oracle-discover-mcp` estiver configurado e for necessário (ver AP-CONV-006), os agentes de conversão só podem usar ferramentas de **metadado/estrutura**: `describe_table`, `describe_procedure`, `describe_view`, `list_constraints`, `list_indexes`, `get_ddl`, `get_object_source`, `find_references`, `search_objects`, `list_packages`.

**Proibido no contexto de conversão:** `execute_sql`, `query_table`, `sample_data`, `query_eso_informacao_gerar` — essas ferramentas leem dados de linha/negócio, não estrutura, violando o princípio de nunca ler valores/amostras/dados pessoais já estabelecido em `oracle-metadata-policy.md`.

### AP-CONV-006 — MCP Oracle só quando necessário

O MCP Oracle só é acionado quando: (a) o nível já foi classificado `N-ESPECIAL` por sinal de schema/procedure ambíguo, **e** (b) o objeto não está em cache (`descobertas-oracle/` via `minerva-index.json`), **e** (c) o MCP está configurado (`conversao.oracleMcpConfigured`). Telas `N1`-`N5` com arquétipo batido nunca acionam esse MCP — custo e tempo devem ser preservados.

### AP-CONV-007 — Nunca adivinhar por aproximação

Nome de tabela, procedure, objeto Oracle ou tela do legado: sempre nome exato ou correspondência inequívoca. Se a busca (schema, código ou `oai-kit-legacy-screen-locate`) não encontrar um candidato claro, o campo/objeto permanece `GAP` — nunca é substituído por um nome parecido.

### AP-CONV-008 — Sigla do módulo, branch e commit

Nunca commite sem a sigla do módulo confirmada pelo dev. Branch e commit seguem o padrão Praxio já documentado no `oai-kit.md` central — sem exceção para conversões, mesmo as mais simples.

## Verificações do `oai-kit-conversao-paridade`

Antes de aprovar qualquer conversão, verifique:
- Nenhuma chamada a `execute_sql`/`query_table`/`sample_data` aparece no histórico de ferramentas usadas pela triagem/backend.
- Nenhuma alteração em arquivos de `GlobusWeb.UIKit` sem o processo do AP-CONV-003.
- Todo campo marcado `INFERRED` no plano da triagem está claramente sinalizado como tal no output final (não foi silenciosamente promovido a `CONFIRMED`).

Qualquer hit de violação = veredicto BLOQUEADO até resolução.
