# Plano — Aprimoramentos ao `oai-kit-conversao`/Minerva a partir de um case real convertido pelo `migration-control-plane`

> Documento de planejamento (2026-08-07). **Nada aqui foi implementado ainda.** Cada item abaixo é uma unidade de trabalho independente, para marcar `[x]` conforme for feito e aprovado. Ordem sugerida ao final, mas nenhuma iniciativa depende estritamente de outra salvo onde indicado.

## Fonte e contexto

Em 2026-08-07 o dev compilou, em `C:\Praxio\teste control migration`, o pacote completo de documentação gerado pelo pipeline Reversa/`migration-control-plane` para uma conversão **real e já concluída**: a tela Delphi `TFrmCadastroHorarios` → `CadastroHorarios` (GraphQL/React), módulo Folha, feature "Folha-090", no repositório `GlobusWeb.Folha`. O pacote cobre do levantamento do legado até o código final (~90 arquivos, 8 fases cronológicas). Analisamos esse pacote com 4 agentes em paralelo, cada um cobrindo uma fase do pipeline, para extrair formatos e capturas que a nossa ferramenta markdown-based (`oai-kit-conversao` + `GlobusEvo.Minerva`) ainda não tem, mas que são portáveis sem depender da infraestrutura deles (scanner, grafo, MCP, banco).

**Achado que muda uma premissa nossa**: `GlobusWeb.Folha/.oai-kit/` contém cópia byte-a-byte do nosso `.oai-kit/` + `packages/oai-kit-conversao/policies/conversion-policy.md`, já na versão pós-AP-CONV-015. Ou seja, **alguém já rodou `oai-kit-conversao init` de fato nesse repositório**, e as implementações de referência reais (`TipoEndereco`, `Indisponiveis`) foram construídas seguindo essas políticas — validando empiricamente, no código de produção, 3 armadilhas já documentadas no Minerva (fórmula de `containerHeight`, proibição de `mask`, cabeçalho em 2 linhas). Isso contradiz o registro de que o kit ainda não tinha sido usado em produção real — vale confirmar com o dev responsável quem rodou o `init` e quando (item 0 abaixo).

Achado secundário: `06-diretrizes-do-projeto/migration-rules/` (deles) e `GlobusEvo.Minerva/padroes-globusweb/patterns/` (nosso) não se copiam um do outro — são **dois consumidores independentes da mesma fonte upstream** (`C:\documentos globus`). Nenhum dos dois propaga atualização da fonte original para o outro automaticamente.

---

## 0 — Ação preliminar (não é edição de arquivo)

- [x] **0.1** Confirmado pelo dev (2026-08-07): ele mesmo rodou o `init` no `GlobusWeb.Folha`. Já em uso real, algumas telas já convertidas. Ainda há pontos a arrumar por causa das mudanças recentes de padrão de frontend (Grid+Modal/Inline+Grid/Accordion) — fica para uma sessão futura, sem ação imediata aqui. Memória do projeto atualizada.

---

## Iniciativa 1 — Nota de revisão datada e não-destrutiva (maior ROI do pacote)

**Achado**: no case Folha-090, uma decisão (`HUMAN DECISION` sobre regra de `NULL` em `INTERF2HORA`) foi tomada, depois revertida durante a codificação ao descobrir um fato técnico novo (`to_date('','hh24:mi')` e `to_date(NULL,...)` produzem o mesmo resultado no Oracle). A reversão foi propagada, com nota `[Revisão — comando/agente, data]`, para **11 arquivos diferentes**, sem nunca apagar o raciocínio original — só anexando o porquê da mudança e o que ela invalida. Três agentes de análise, lendo pastas diferentes do pacote, convergiram nesse mesmo achado de forma independente — sinal forte de que é o padrão mais valioso do pacote.

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-aprendizado.md`, `packages/oai-kit-conversao/policies/conversion-policy.md`, `GlobusEvo.Minerva/gaps/gaps-log.md` (convenção de entrada).

- [x] **1.1** Passo 4b + restrição adicionados em `oai-kit-conversao-aprendizado.md` (2026-08-07).
- [x] **1.2** Convenção adicionada no cabeçalho de `gaps-resolvidos.md`, com referência cruzada em `gaps-log.md`.
- [x] **1.3** Exemplo ilustrativo generalizado adicionado em `gaps-resolvidos.md`, logo após o "Formato de entrada".

---

## Iniciativa 2 — Log de descarte estruturado (`discard_log`), distinto de GAP

**Achado**: quando a conversão decide conscientemente **não replicar** um comportamento do legado (ex.: um fallback de permissão que abre tudo incondicionalmente ao fechar a tela), isso hoje não tem lar formal no nosso método — vira nota solta ou fica implícito no código. O pacote analisado tem uma categoria própria (`discard_log.md`) com campos fixos: origem (arquivo:linha), justificativa, vínculo a mudança de padrão/arquitetura, o que substitui, e risco de descartar.

**Alvo**: novo arquivo satélite no Minerva, `especificacoes/_template-especificacao.md`, `packages/oai-kit-conversao/agents/oai-kit-conversao-especificador.md`, `minerva-index.json`.

- [x] **2.1** Critério de Descarte definido em `conversion-policy.md` (fronteira com GAP e com "Aceita" de `oai-kit-conversao-paridade`).
- [x] **2.2** `gaps/descartes-log.md` criado no Minerva (append-only, formato DESCARTE-NNN).
- [x] **2.3** Seção "Descartes conscientes" adicionada em `_template-especificacao.md` (após Regras de negócio).
- [x] **2.4** Passo adicionado em `oai-kit-conversao-especificador.md`; persistência final via novo passo 4c em `oai-kit-conversao-aprendizado.md` (não previsto originalmente neste plano, necessário para o mecanismo funcionar ponta a ponta).
- [x] **2.5** Referenciado no `README.md` do Minerva (estrutura + regras de conteúdo) — sem entrada em `minerva-index.json` (mesmo tratamento não-indexado de `gaps-resolvidos.md`).

---

## Iniciativa 3 — Exceção de fidelidade por risco de segurança

**Achado**: reforça, com evidência independente de um case real, um ponto já levantado na análise anterior desta sessão (varredura de segurança). O princípio "fidelidade ao legado vence padrão comum" **não deve valer** quando o comportamento legado é uma folga de segurança sem justificativa de negócio identificada (ex.: liberar todas as permissões ao fechar uma tela "para o caso de não existir definição para o usuário").

**Alvo**: `packages/oai-kit-conversao/policies/conversion-policy.md` (AP-CONV-009), `GlobusEvo.Minerva/cheatsheets/armadilhas-comuns.md`.

- [x] **3.1** Nota adicionada em AP-CONV-009 (`conversion-policy.md`, 2026-08-07): fidelidade não se estende a falha de segurança confirmada.
- [x] **3.2** Armadilha #34 adicionada em `armadilhas-comuns.md`: "Fallback de permissão liberado incondicionalmente ao fechar a tela".

---

## Iniciativa 4 — Checklist LGPD

**Achado**: nenhuma policy do `oai-kit-conversao` menciona LGPD hoje. O pacote analisado tem checklist de autorização/minimização de payload/mascaramento/auditoria/bloqueio de exportação para componente com dado sensível.

**Alvo**: `.oai-kit/policies/security-policy.md` (já existe, confirmado) e/ou `packages/oai-kit-conversao/policies/conversion-policy.md`; `especificacoes/_template-especificacao.md`; `oai-kit-conversao-especificador.md`.

- [x] **4.1** `security-policy.md` lido — genérico ao kit (credenciais/SQL/XSS), zero sobreposição com LGPD.
- [x] **4.2** Novo `AP-CONV-016` em `conversion-policy.md` (não em `security-policy.md` — específico de conversão) + bullet no checklist de paridade.
- [x] **4.3** Seção "Dados sensíveis / LGPD" adicionada em `_template-especificacao.md`, após Tabela(s) Oracle.
- [x] **4.4** Frase-gatilho adicionada em `oai-kit-conversao-especificador.md`.

---

## Iniciativa 5 — Taxonomia para componente Delphi sem equivalente visual

**Achado**: um componente Delphi que não é elemento de UI (`TFDStoredProc`, timer, `TIdHTTP`) hoje cai genericamente em regra de negócio Tipo 2/3 ou vira GAP, sem marcador explícito de "isto não é UI, é lógica/infra". O pacote tem uma taxonomia de 4 categorias (`DISCARD` / `MIGRATE_BACKEND` / `MIGRATE_BEHAVIOR` / `HUMAN_DECISION`) para resolver isso.

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-especificador.md`, `packages/oai-kit-conversao/policies/conversion-policy.md`, Minerva (armadilhas ou catálogo).

- [x] **5.1** Taxonomia adaptada: Descartar / Migrar para backend / Migrar como comportamento / Decisão humana. Nova subseção em `conversion-policy.md`.
- [x] **5.2** Passo novo em `oai-kit-conversao-especificador.md` (antes da classificação de regras de negócio) + restrição correspondente.
- [x] **5.3** Tabela de 5 exemplos adicionada em `cheatsheets/delphi-para-nestjs.md` (nova seção "Elementos Delphi sem equivalente visual").

---

## Iniciativa 6 — Nova categoria no Minerva: "Convenções de implementação"

**Achado**: o pacote tem um documento síntese (`07-padroes-e-convencoes-do-codigo.md`) capturando convenções de código descobertas por leitura do código real — nem arquitetura (já coberto por `archetypes/`/`padroes-globusweb/patterns/`), nem armadilha pontual de UI. Ex.: `insert: false` para coluna `NOT NULL` populada por trigger; `type: 'timestamp'` (nunca `'date'`) para coluna Oracle que só guarda hora; padrão de teste de `QueryService` via `Object.create`+`jest.spyOn`; convenção `id: String(pk)` em mutations do `nestjs-query-graphql`.

**Alvo**: novo arquivo/diretório no Minerva; `minerva-index.json`; `packages/oai-kit-conversao/agents/oai-kit-conversao-backend.md`.

- [x] **6.1** Decidido: arquivo único `cheatsheets/convencoes-implementacao.md` (mesmo padrão de crescimento de `armadilhas-comuns.md`).
- [x] **6.2** Arquivo criado com os 4 achados (insert:false, timestamp vs date, teste QueryService, id:String(pk) em mutations).
- [x] **6.3** Referenciado no `README.md` do Minerva (cheatsheets não são indexados em `minerva-index.json` — confirmado ao implementar, corrigindo a suposição inicial deste plano).
- [x] **6.4** `oai-kit-conversao-backend.md` (passo 1) agora abre `convencoes-implementacao.md` junto do arquétipo.

---

## Iniciativa 7 — Três seções condicionais na especificação

**Achado**: no case Folha-090, uma tabela "estado × habilitação de botão" exaustiva expôs um bug real (botão nunca desabilitado explicitamente); uma coluna "Escrita" na tabela de campos expôs uma assimetria de gravação entre duas colunas; um flowchart do fluxo crítico tornou visual uma ramificação perigosa. Nenhuma das três é necessária para toda tela — só quando o gatilho se aplica.

**Alvo**: `especificacoes/_template-especificacao.md`, `packages/oai-kit-conversao/agents/oai-kit-conversao-especificador.md`.

- [x] **7.1** Seção "Fluxo crítico" adicionada em `_template-especificacao.md`, após Regras de negócio.
- [x] **7.2** Seção "Estados e habilitação de controles" adicionada após Grid.
- [x] **7.3** Subseção "Colunas com mais de um caminho de escrita" adicionada dentro de Tabela(s) Oracle.
- [x] **7.4** 3 frases-gatilho adicionadas em `oai-kit-conversao-especificador.md` (passo 3), uma por seção condicional.

---

## Iniciativa 8 — Critério de "pronto" mais estrito na paridade

**Achado**: o pacote define o critério de conclusão do checklist de paridade como "tela alcançada navegando pelo menu real do GlobusWeb (não por URL direta), com pelo menos um ciclo funcional completo persistindo de fato no backend — compilar/typechecar sem esse percurso não conta como pronto." Nosso AP-CONV-010 já proíbe subir a aplicação, mas não nomeia essa navegação-por-menu como critério explícito de conclusão.

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-paridade.md`, `packages/oai-kit-conversao/policies/conversion-policy.md` (AP-CONV-010).

- [x] **8.1** Frase de critério de conclusão adicionada em `oai-kit-conversao-paridade.md` (Restrições Absolutas) e no checklist de "Verificações do oai-kit-conversao-paridade" de `conversion-policy.md`.

---

## Iniciativa 9 — Registrar a convergência `migration-rules/` ↔ Minerva

**Achado**: `migration-rules/` (deles) e `padroes-globusweb/patterns/` (nosso) são consumidores independentes da mesma fonte upstream (`C:\documentos globus`) — nenhum sincroniza com o outro automaticamente.

**Alvo**: `GlobusEvo.Minerva/padroes-globusweb/README.md`.

- [x] **9.1** Nota adicionada em `padroes-globusweb/README.md`, seção Atualização.

---

## O que foi analisado e descartado como não-portável (não vira iniciativa)

Pipeline de agentes nomeados com estado persistente entre execuções; C4 completo (3 níveis) para telas simples (só valeria, e mesmo assim em nível único, para N-ESPECIAL com topologia real multi-repositório); `graph-context.md`/métricas de grafo (Graphify); hash de integridade + invalidação automática de gate; captura de golden files via Docker/Wine para oráculo Delphi; `confidence-report.md` como artefato agregado formal (cerimonial demais para sessão única); `decision-contract.md`/coleta via MCP Oracle-GraphQL (o conceito de "contrato canônico com proveniência por campo" já foi absorvido na Frente 4 do plano `migration-control-plane`, não precisa duplicar aqui).

---

## Ordem de execução sugerida

Todas as iniciativas são independentes entre si (nenhuma bloqueia outra). Sugestão por custo/ambiguidade, não por obrigatoriedade:

1. **0.1** — ação humana, pode ser feita a qualquer momento, em paralelo a tudo.
2. **3, 8** — ajustes de frase em policy/agente já existente, sem criar artefato novo. Menor custo, zero ambiguidade de design.
3. **1** — convenção de escrita nova, mas sem criar arquivo novo. Baixo custo, alto ROI.
4. **6, 9** — conteúdo já pronto para popular (achados do case), só falta decidir onde colocar no Minerva.
5. **5** — requer adaptar taxonomia de 4 categorias ao nosso vocabulário antes de aplicar.
6. **2, 7** — requerem mais decisão de design (fronteira GAP/descarte; gatilhos exatos das seções condicionais) — atacar com mais tempo disponível.
7. **4** — requer ler `security-policy.md` primeiro para não duplicar; pode ser feito em paralelo a qualquer outra.

## Como retomar

Cada sub-item com checkbox é uma unidade de trabalho independente. Ao retomar, reler o "Achado" da iniciativa correspondente para não perder o motivo por trás da mudança, confirmar o alvo exato do arquivo (pode ter mudado desde que este plano foi escrito), implementar, e marcar `[x]` só depois de aprovação explícita (mesmo padrão de gate já usado nas demais iniciativas desta sessão).
