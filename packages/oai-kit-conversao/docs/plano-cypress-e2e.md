# Plano — Testes E2E automatizados com Cypress

> Documento de planejamento (2026-08-07). **Implementado por completo em 2026-08-07** (mesma sessão) — as 9 iniciativas abaixo estão todas marcadas `[x]`.

## Contexto e motivação

O dev quer que a conversão ganhe uma camada de verificação dinâmica antes do checkpoint de teste manual: depois que backend e frontend estão implementados, um novo passo constrói e roda testes Cypress (headless, sem abrir a interface do Cypress) contra a tela convertida, captura e documenta os erros encontrados, corrige e roda de novo — com um limite de **3 tentativas de correção por erro individual** (não por lote de erros). Objetivo duplo: (1) o front já sai coberto por testes automatizados; (2) parte dos bugs que hoje só aparecem no teste manual do dev (erro ao gravar, campo obrigatório não validado, grid com scroll interno, etc.) já chega corrigida antes desse checkpoint.

Ponto central levantado pelo dev, e que molda todo o desenho abaixo: **os testes não podem ser construídos só a partir do front que foi implementado** — se o front tiver um bug, um teste que só observa o DOM implementado vai "aprender" o bug e validar o comportamento errado como certo. Os testes precisam cruzar contra os **padrões/policies já definidos** (arquétipos, AP-CONVs), que existem independente de como aquela tela específica foi implementada. Exemplo do próprio dev: um campo que deveria ter virado `Combobox` de referência (AP-CONV-017) porque referencia outra tabela — se o front foi implementado errado como código+lupa+descrição, um teste "baseado no front" validaria a lupa como certa; um teste "baseado no padrão" reprova a lupa e aponta o bug real.

Também complementar a documentação prévia: `/oai-kit-documentar-tela` passa a esboçar casos de teste já inferidos do Delphi (sinalizados explicitamente como não-exaustivos — o fonte Delphi sozinho nunca cobre 100% dos comportamentos reais).

### Decisões já fechadas com o dev (não reabrir sem motivo novo)

- **Dono do passo**: agente novo e dedicado, `oai-kit-conversao-e2e` — não é responsabilidade extra de `oai-kit-conversao-frontend` nem `oai-kit-conversao-paridade`.
- **Escopo por nível**: obrigatório em **todos** os níveis, `N1` a `N-ESPECIAL` — custo por tela é parecido independente do nível, e é justamente nas telas "simples" que bug manual (campo obrigatório, erro ao gravar) mais pega o dev desprevenido.
- **Limite esgotado**: ao esgotar as 3 tentativas de correção de um erro específico sem sucesso, o agente registra **GAP** (erro, evidência, tentativas feitas) e **segue normalmente** para o checkpoint de teste manual — nunca trava o fluxo à espera de decisão. O dev decide ali, com o GAP já documentado, se aquilo bloqueia ou não.
- **Infraestrutura de execução (resolvido — 2026-08-07)**: tudo sobe **local**, sem orquestração nova (sem docker/CI). A sequência é sempre: (1) back-end do módulo-alvo, (2) back-end do `GlobusWeb.Gateway`, (3) front-end do módulo-alvo — nessa ordem, usando os scripts npm que **já existem** por convenção em todo repo `GlobusWeb.<Modulo>` (confirmado em `GlobusWeb.Folha`/`GlobusWeb.Gateway`, mesma estrutura em todos): `npm run start:backend` no root do módulo, depois `npm run start:backend` no root de `GlobusWeb.Gateway` (repositório irmão — nunca `npm run start:gateway`, que sobe o Gateway inteiro incluindo o front dele, desnecessário aqui), depois `npm run start:frontend` no root do módulo. **Configuração local (env, conexão Oracle, etc.) não é responsabilidade do agente** — o dev já mantém isso pronto para rodar, mesmo princípio de quando ele testa manualmente hoje.
- **Flag de opt-out (`--sem-cypress`)**: dev pode pular a parte de Cypress tanto na documentação quanto na conversão, independentemente um do outro (ver Iniciativa 9).
- **Higiene de dados de teste (resolvido — 2026-08-07)**: todo dado criado pelos testes usa o prefixo `CYPRESS_TESTE_` em qualquer campo de texto livre/descritivo do registro (nome, descrição, observação) — permite localizar e limpar mesmo que o cleanup automático não rode (falha no meio do teste, interrupção). Campos sem valor descritivo (só código/numérico, sem texto livre) não têm como carregar o prefixo — nesses casos a limpeza depende só do `afterEach`/`after` do próprio teste ter rodado normalmente; o prefixo é a rede de segurança adicional, não o único mecanismo.
- **Quem corrige um erro de causa ambígua (resolvido — 2026-08-07)**: `oai-kit-conversao-e2e` corrige diretamente (frontend ou backend, conforme a causa), **com uma condição explícita**: toda correção segue os mesmos padrões/policies/arquétipos que `oai-kit-conversao-backend`/`-frontend` seguiriam — nunca um ajuste ad-hoc só para o teste passar, contrariando o padrão de frontend decidido no plano ou qualquer AP-CONV. Se a correção mínima e correta exigiria contrariar um padrão (situação anômala), isso não é "corrigir" — vira o mesmo tratamento de erro esgotado (GAP), mesmo dentro do limite de tentativas.
- **Bootstrap do Cypress na primeira conversão por repositório (resolvido — 2026-08-07)**: acontece dentro do próprio fluxo de conversão, mesmo na primeira vez — não é um passo de setup separado antes da primeira conversão (ver Iniciativa 1.3, já desenhada assim).

---

## Iniciativa 1 — Novo agente `oai-kit-conversao-e2e`

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-e2e.md` (novo arquivo).

- [x] **1.1** Identidade: constrói, roda e corrige testes Cypress (headless, `cypress run` — nunca a UI interativa do Cypress) para a tela recém-implementada. Posicionado entre `oai-kit-conversao-frontend` e `oai-kit-conversao-paridade`. Nunca substitui o checklist de teste manual do dev — é uma rede de segurança **antes** dele, não um substituto.
- [x] **1.2** Pré-condições: backend e frontend já implementados; branch já existe e está com checkout feito (mesma pré-condição dos outros agentes desta fase).
- [x] **1.3** Passo "Bootstrap Cypress no repositório-alvo" — operação única por repositório (não por tela): se o projeto-alvo ainda não tem Cypress configurado (hoje, nenhum tem), instala a dependência, cria `cypress.config.ts`, estrutura `cypress/e2e/`+`cypress/support/`, e comandos customizados reutilizáveis (ex.: login, se a aplicação exigir autenticação antes de qualquer tela). Se já existir configuração (conversões futuras), reaproveita sem recriar.
- [x] **1.4** Passo "Construir os casos de teste" — **duas fontes obrigatórias e complementares, nunca uma só**:
  1. **Casos de teste da especificação** (`especificacoes/<modulo>/<tela>.md`, nova seção — ver Iniciativa 3) — cobre o golden path e as regras Tipo 2 específicas desta tela, inferidos do Delphi.
  2. **Checklist de verificações obrigatórias por padrão estrutural** (novo documento central no Minerva — ver Iniciativa 2), aplicado **sempre**, independente do que o front implementado faz. É isso que impede o teste de "aprender o bug": o agente lê a mesma receita de arquétipo que `oai-kit-conversao-frontend` deveria ter seguido, não o código já escrito, para decidir o que o teste deve exigir.
- [x] **1.5** Passo "Subir a stack local" — sobe, nesta ordem, sem se preocupar com configuração de ambiente (o dev já mantém isso pronto para rodar): (1) `npm run start:backend` no root do módulo-alvo; (2) `npm run start:backend` no root de `GlobusWeb.Gateway` (repositório irmão, path resolvido a partir do diretório-pai do módulo-alvo — **nunca** `npm run start:gateway`, que sobe o Gateway inteiro incluindo o front dele, desnecessário para o teste); (3) `npm run start:frontend` no root do módulo-alvo. Exceção pontual documentada em `AP-CONV-018` (ver Iniciativa 6) — nenhum outro agente sobe processo algum. Aguardar cada processo sinalizar pronto (porta respondendo / linha de log característica) antes de subir o próximo, nunca um `sleep` fixo arbitrário.
- [x] **1.6** Passo "Rodar" — `cypress run` headless contra o front-end do módulo já de pé.
- [x] **1.7** Passo "Loop de correção" — **por erro individual, nunca por lote**:
  1. Para cada teste que falhar, analisar a evidência (mensagem, screenshot/log do Cypress).
  2. Aplicar a correção mínima (frontend ou backend, conforme a causa raiz real — nunca assumir que é sempre frontend só porque o teste é E2E) — **a correção segue as mesmas regras/policies/arquétipo que `oai-kit-conversao-backend`/`-frontend` seguiriam** (padrão de frontend decidido no plano, catálogo de componentes UIKit, `conversion-policy.md` por completo). Se a causa raiz só puder ser corrigida contrariando um padrão/AP-CONV, isso não conta como correção válida — trata-se como erro esgotado (item 5 abaixo), mesmo dentro do limite de tentativas.
  3. Re-rodar (o teste específico, ou a suíte inteira — a decidir na implementação; suíte inteira é mais seguro contra regressão colateral, mais caro em tempo).
  4. Repetir até passar ou esgotar **3 tentativas para aquele erro específico** — o contador é por erro, não resetado nem compartilhado entre erros diferentes da mesma leva.
  5. Erro que esgota as 3 tentativas (ou que só se corrigiria contrariando um padrão) → registrar GAP (descrição do erro, evidência, as tentativas de correção feitas e por que não resolveram) e seguir para o próximo erro pendente — nunca travar o passo inteiro por causa de um erro não resolvido.
- [x] **1.8** Passo "Derrubar a stack local" — sempre, ao final do passo (sucesso ou não): encerra os 3 processos subidos no passo 1.5 (módulo backend, Gateway backend, módulo frontend) — nunca deixar processo pendurado, mesmo se o passo falhar/for interrompido no meio.
- [x] **1.9** Output: registrar em `.oai-flow/delivery/{ID}-conversao-patch.md` (seção própria) — specs criadas, resultado por spec (passou / corrigido em N tentativas / GAP registrado), arquivos `.cy.ts` gerados.
- [x] **1.10** **Convenção de dados de teste**: todo registro criado por um teste usa o prefixo `CYPRESS_TESTE_` em qualquer campo de texto livre/descritivo (nome, descrição, observação) do registro — permite localizar e limpar manualmente mesmo que o `afterEach`/`after` do teste não rode (falha/interrupção no meio). Todo teste que cria dado **também** tenta desfazer no `afterEach`/`after` normalmente — o prefixo é rede de segurança adicional, não substitui a limpeza automática. Campos sem texto livre (só código/numérico) não recebem o prefixo — dependem só da limpeza automática ter rodado.
- [x] **1.11** Restrições Absolutas: nunca é substituto do checklist manual do dev; nunca mais de 3 tentativas de correção por erro individual; nunca aplica uma correção que contrarie um padrão/AP-CONV só para o teste passar (isso é erro esgotado, não correção); nunca sobe a stack fora deste passo específico (a exceção ao AP-CONV-010 é só dele); nunca constrói um teste só a partir do front implementado, sem cruzar contra o checklist de padrão (Iniciativa 2); nunca cria dado de teste sem o prefixo `CYPRESS_TESTE_` em algum campo descritivo, quando o registro tiver um; nunca deixa processo/servidor pendurado ao final; nunca commita (mesma regra dos demais agentes desta fase — branch já existe, commit só acontece no gate de `oai-kit-conversao-paridade`).

**Critério de "pronto"**: o agente existe, documentado com o mesmo nível de detalhe operacional dos demais agentes de conversão, e cobre bootstrap → construção → execução → correção com limite → output.

---

## Iniciativa 2 — Catálogo central de verificações Cypress por padrão (Minerva)

**Alvo**: novo arquivo `cheatsheets/cypress-checks-por-padrao.md` no `GlobusEvo.Minerva`, referenciado pelos arquétipos e pelo novo agente.

- [x] **2.1** Seção "Sempre, independente do padrão": CRUD completo sem erro (criar/editar/excluir gravando de fato, não só abrir formulário); todo campo obrigatório bloqueia submit quando vazio; nenhum toast de erro não tratado (erro de mutation aparece como mensagem amigável, não como exceção crua no console); grid principal nunca gera barra de rolagem interna indevida (mesma regra de `containerHeight` que `oai-kit-conversao-paridade` já verifica estaticamente — aqui é verificado visualmente/via layout real).
- [x] **2.2** Seção "Grid+Modal": abrir modal "Novo", preencher e gravar sem erro; editar via ícone e confirmar persistência; excluir via modal de confirmação; busca explícita retorna os resultados esperados (nunca dispara sozinha por debounce).
- [x] **2.3** Seção "Inline+Grid": duplo clique na linha do grid carrega o registro no form; campo-chave com código existente autopreenche ao sair do campo (`onBlur`); código vazio ao gravar gera novo registro (via `@UseProximoCodigo`); grid de seleção nunca tem coluna de ações.
- [x] **2.4** Seção "Accordion+Índice Numerado": navegação entre seções preserva dados já preenchidos; submit único grava todas as seções; sub-lista própria via `RepeatableForm` permite incluir/remover linha; dado de outro domínio aparece como tabela read-only (nunca editável).
- [x] **2.5** Seção "Combobox de referência (AP-CONV-017)": o campo aparece como combobox selecionável/filtrável (nunca como dois campos + lupa); a lista de opções carrega da tabela referenciada; ao selecionar uma opção e gravar, o registro persistido usa o campo confirmado na spec como "persistido de fato" (verificável consultando o resultado da mutation/registro salvo, não o que aparece no DOM) — é este teste especificamente que pega o cenário que o dev descreveu (lupa implementada por engano em vez de combobox não passaria aqui).
- [x] **2.6** Seção "LGPD (AP-CONV-016)", se a tela tiver campo sensível: campo aparece mascarado na exibição por padrão; exportação/cópia (se existir na tela) não inclui o dado desmascarado.
- [x] **2.7** Cada arquétipo (`padrao-frontend-crud-grid-modal.md`, `padrao-frontend-crud-inline-grid.md`, `accordion-secoes-indice-numerado.md`, `lookup-readonly.md`) ganha uma linha apontando para a seção correspondente deste novo documento, em vez de duplicar o conteúdo.

**Critério de "pronto"**: existe um documento único, central, que qualquer conversão futura consulta para saber o que o Cypress precisa validar por padrão — sem depender do que aquela tela específica implementou.

---

## Iniciativa 3 — `/oai-kit-documentar-tela` e `oai-kit-conversao-especificador` ganham "Casos de teste"

**Alvo**: `_template-especificacao.md` (Minerva), `agents/oai-kit-conversao-especificador.md`, `commands/oai-kit-documentar-tela.md`.

- [x] **3.1** Nova seção condicional em `_template-especificacao.md`: "Casos de teste (inferidos do Delphi)" — tabela `Cenário | Passos | Resultado esperado | Origem` (`Origem`: confirmado no `.pas` | inferido por convenção do arquétipo | não coberto pelo Delphi, exige teste manual extra). Nota fixa no cabeçalho da seção: **nunca exaustivo** — o fonte Delphi sozinho não garante cobertura de 100% dos comportamentos reais; isso complementa, nunca substitui, o checklist de padrão da Iniciativa 2.
- [x] **3.2** Novo passo em `oai-kit-conversao-especificador.md`: ao documentar regras de negócio (Tipo 1/2/3) e o de/para de componente, já esboçar os casos de teste correspondentes na tabela acima — reaproveitando o que já foi levantado, não uma investigação nova.
- [x] **3.3** Bullet novo no recap do PASSO 1 de `commands/oai-kit-documentar-tela.md`, mesmo padrão das últimas revisões desta sessão.

**Critério de "pronto"**: uma especificação gerada por `/oai-kit-documentar-tela` já inclui casos de teste esboçados, que `oai-kit-conversao-e2e` reaproveita depois sem precisar reinferir do zero.

---

## Iniciativa 4 — Inserir o novo passo no fluxo de `/oai-kit-converter-tela`

**Alvo**: `packages/oai-kit-conversao/commands/oai-kit-converter-tela.md`.

- [x] **4.1** Novo "PASSO 4 — Testes E2E (Cypress)", entre o atual PASSO 3 (Frontend) e o atual PASSO 4 (Paridade, que passa a ser PASSO 5). PASSO 5 (Aprendizado) passa a ser PASSO 6.
- [x] **4.2** Não introduz um novo checkpoint bloqueante — GAPs de erro esgotado seguem para o informe normal (mesmo tratamento de qualquer outro GAP), o dev só é parado nos checkpoints que já existem (proporcional ao nível, e o checkpoint final de teste manual).

**Critério de "pronto"**: o comando descreve os 6 passos na ordem certa, sem sugerir bloqueio novo.

---

## Iniciativa 5 — `oai-kit-conversao-paridade.md` passa a considerar o resultado do E2E

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-paridade.md`.

- [x] **5.1** Novo item na verificação estática (passo 1): confirmar que `oai-kit-conversao-e2e` rodou e revisar os GAPs que ele tenha aberto (erro esgotado) antes de montar o checklist de teste manual — nenhum GAP de E2E fica sem menção no output final.
- [x] **5.2** **Não** reduzir o checklist de teste manual existente por causa da cobertura nova do Cypress — a redundância é intencional (rede de segurança final continua sendo o dev). Deixar isso explícito para não ser um esquecimento silencioso de escopo numa revisão futura.

**Critério de "pronto"**: paridade sabe que o passo de E2E existe e usa o resultado dele, sem duplicar trabalho nem reduzir o checklist manual.

---

## Iniciativa 6 — Nova política `AP-CONV-018` em `conversion-policy.md`

**Alvo**: `packages/oai-kit-conversao/policies/conversion-policy.md`.

- [x] **6.1** Novo `AP-CONV-018 — Testes E2E automatizados (Cypress): exceção pontual ao AP-CONV-010, escopo e limites`:
  - Único agente autorizado a subir a stack local é `oai-kit-conversao-e2e`, e só para rodar `cypress run` headless — nunca para smoke test manual do próprio agente, nunca para qualquer outro agente. Sobe sempre na ordem: back-end do módulo-alvo → back-end de `GlobusWeb.Gateway` (`npm run start:backend`, nunca `start:gateway`) → front-end do módulo-alvo; configuração de ambiente é sempre responsabilidade do dev, nunca do agente.
  - Limite de 3 tentativas de correção por erro individual (não por lote) — ao esgotar, GAP e segue (nunca bloqueia o passo inteiro). Correção que só funcionaria contrariando um padrão/AP-CONV não conta como correção válida — mesmo tratamento de erro esgotado.
  - Testes **nunca** construídos só a partir do front implementado — sempre cruzados contra `cheatsheets/cypress-checks-por-padrao.md` (Iniciativa 2) e a especificação (Iniciativa 3).
  - Dado criado por teste automatizado sempre usa o prefixo `CYPRESS_TESTE_` em campo de texto livre/descritivo, além de tentar a limpeza normal (`afterEach`/`after`) — o banco de desenvolvimento é real e compartilhado com outros devs, nunca um banco efêmero.
- [x] **6.2** Adicionar bullet correspondente na lista "Verificações do `oai-kit-conversao-paridade`" ao final do arquivo, espelhando a Iniciativa 5.1.

**Critério de "pronto"**: a exceção ao AP-CONV-010 está documentada como exceção nomeada e restrita, não uma reinterpretação geral da regra.

---

## Iniciativa 7 — Métrica nova em `metrics/conversoes.jsonl`

**Alvo**: `metrics/README.md` (Minerva) + `agents/oai-kit-conversao-aprendizado.md`.

- [x] **7.1** Novos campos no schema de métricas: erros E2E detectados, erros corrigidos automaticamente (com quantas tentativas cada), GAPs abertos por esgotamento do limite — para calibrar ao longo do tempo se 3 tentativas é o número certo e medir a eficácia real do passo (quantos bugs manuais deixaram de acontecer).
- [x] **7.2** `oai-kit-conversao-aprendizado.md` passa a persistir esses campos, mesmo padrão de `bugsConversaoCorrigidos` já existente.

**Critério de "pronto"**: dá para responder, depois de N conversões, "o passo de Cypress está valendo o custo?" com dado real, não impressão.

---

## Iniciativa 8 — `README.md` do pacote

**Alvo**: `packages/oai-kit-conversao/README.md`.

- [x] **8.1** Diagrama "Sequência de execução" atualizado para os 6 passos (Triagem → Backend → Frontend → **Testes E2E** → Paridade → Aprendizado).

**Critério de "pronto"**: o README não fica desatualizado assim que a Iniciativa 4 for implementada (mesmo tipo de gap encontrado e corrigido nesta sessão em outros arquivos).

---

## Iniciativa 9 — Flag `--sem-cypress` nos dois comandos

**Alvo**: `commands/oai-kit-documentar-tela.md`, `commands/oai-kit-converter-tela.md`.

Os dois usos da flag são **independentes** — um dev pode combinar qualquer um dos dois, mesmo sem o outro.

- [x] **9.1** `/oai-kit-documentar-tela`: nova flag opcional `--sem-cypress`, combinável com qualquer um dos 3 modos de entrada já existentes (ex.: `/oai-kit-documentar-tela {ID_AZURE} --sem-cypress`). Quando presente, `oai-kit-conversao-especificador` **não gera** a seção "Casos de teste (inferidos do Delphi)" (Iniciativa 3) — a seção fica de fora da especificação, não só vazia.
- [x] **9.2** `/oai-kit-converter-tela`: nova flag opcional `--sem-cypress` (ex.: `/oai-kit-converter-tela {ID_AZURE} --sem-cypress`). Quando presente, o **PASSO 4 (Testes E2E) é pulado por completo** — `oai-kit-conversao-e2e` nunca é acionado, o fluxo vai direto do PASSO 3 (Frontend) para o PASSO 5 (Paridade).
- [x] **9.3** A flag em `/oai-kit-converter-tela` vale **mesmo que a especificação reaproveitada já tenha** a seção "Casos de teste" (gerada por um `/oai-kit-documentar-tela` anterior sem a flag) — a seção fica só sem uso nesta conversão, nunca é motivo para forçar o passo de qualquer forma.
- [x] **9.4** Caso inverso, a cobrir na Iniciativa 1: se a especificação **não tem** "Casos de teste" (documentada com `--sem-cypress`, ou spec antiga anterior a esta iniciativa) mas o PASSO 4 **não** foi pulado nesta conversão, `oai-kit-conversao-e2e` constrói os testes só a partir do checklist de padrão (Iniciativa 2) — a ausência da fonte 1 não é bloqueante, só reduz a cobertura ao que os padrões já garantem.

**Critério de "pronto"**: um dev consegue documentar sem Cypress e converter com Cypress (ou vice-versa) sem nenhuma das duas pontas travar ou exigir a outra.

---

## Ordem de execução sugerida

1. **Iniciativa 2** — o catálogo de verificações por padrão é a fonte de verdade que tudo mais referencia; sem ele, o agente novo (Iniciativa 1) não tem o que consultar além da spec.
2. **Iniciativa 3** — casos de teste na especificação, para o agente novo ter as duas fontes completas desde o início.
3. **Iniciativa 1** — o agente `oai-kit-conversao-e2e` em si.
4. **Iniciativa 6** — `AP-CONV-018`, formalizando a exceção que a Iniciativa 1 já pressupõe.
5. **Iniciativas 4, 5, 8** — encaixar no fluxo, ajustar paridade e README.
6. **Iniciativa 9** — flag `--sem-cypress` nos dois comandos, depois que o passo 4/PASSO 4 já existir de fato (não há o que pular antes disso).
7. **Iniciativa 7** — métrica, por último (só faz sentido depois que o passo já roda de verdade).

## Como retomar

Cada sub-item com checkbox é uma unidade de trabalho independente. Ao retomar, reler "Contexto e motivação" (todas as decisões já estão fechadas — nenhum ponto em aberto restante) antes de continuar.
