# Política: Conversion Policy

Verificações obrigatórias de `oai-kit-conversao-triagem`, `oai-kit-conversao-backend`, `oai-kit-conversao-frontend` e `oai-kit-conversao-paridade`. Violações são hard stops — consolida (sem duplicar por extenso) os princípios já estabelecidos em `documentos globus/patterns/globusweb-principles.md` e `oracle-metadata-policy.md`.

## Proibições Absolutas

### AP-CONV-001 — Metadado nunca autoriza comportamento sozinho

Existência de tabela, PK, sequence, schema Oracle ou schema GraphQL **nunca** autoriza automaticamente incluir/alterar/excluir, expor um campo, ou confirmar que uma procedure é "a regra certa". Toda operação de CRUD proposta precisa de evidência real no `.pas`/arquivos da tela (`CONFIRMED`) — na ausência, é `INFERRED` e deve ser sinalizado como tal, nunca apresentado como certo.

### AP-CONV-002 — Sem contrato GraphQL inventado

Nunca proponha um campo, query ou mutation GraphQL que não tenha sido confirmado contra o padrão real do módulo-alvo (`backend-pattern.md`) ou contra o arquétipo aplicável. Ambiguidade de contrato é `GAP`, não invenção.

### AP-CONV-003 — UIKit é transversal

Nenhuma conversão pontual altera um componente do `GlobusWeb.UIKit` sem: (1) grep pelos consumidores em todos os front-ends, (2) avaliação explícita de breaking change, (3) aprovação humana fora do escopo da tela em conversão. Isso é sempre tier `COMPLEXA`.

### AP-CONV-004 — Sem DDL/alteração de schema Oracle

Nenhuma conversão altera schema Oracle (DDL, trigger, procedure, function) sem decisão humana explícita de banco/engenharia. Isso é sempre fora do escopo de uma conversão de tela.

### AP-CONV-005 — Restrição de ferramentas do MCP Oracle

Quando `praxio-oracle-discover-mcp` estiver configurado e for necessário (ver AP-CONV-006), os agentes de conversão só podem usar ferramentas de **metadado/estrutura**: `describe_table`, `describe_procedure`, `describe_view`, `list_constraints`, `list_indexes`, `get_ddl`, `get_object_source`, `find_references`, `search_objects`, `list_packages`.

**Proibido no contexto de conversão:** `execute_sql`, `query_table`, `sample_data`, `query_eso_informacao_gerar` — essas ferramentas leem dados de linha/negócio, não estrutura, violando o princípio de nunca ler valores/amostras/dados pessoais já estabelecido em `oracle-metadata-policy.md`.

### AP-CONV-006 — MCP Oracle só quando necessário

O MCP Oracle só é acionado quando: (a) o tier já foi classificado `COMPLEXA` por sinal de schema/procedure ambíguo, **e** (b) o objeto não está em cache (`descobertas-oracle/` via `minerva-index.json`), **e** (c) o MCP está configurado (`conversao.oracleMcpConfigured`). Telas `SIMPLES` com arquétipo batido nunca acionam esse MCP — custo e tempo devem ser preservados.

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
