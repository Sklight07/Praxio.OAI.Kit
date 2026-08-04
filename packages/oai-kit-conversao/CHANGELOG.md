# Changelog — praxio-oai-kit-conversao

Formato baseado em [Keep a Changelog](https://keepachangelog.com/). Datas em ISO-8601.

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
