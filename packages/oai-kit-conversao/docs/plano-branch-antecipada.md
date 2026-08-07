# Plano — Criação de branch antecipada (início do fluxo, não no final)

> Documento de planejamento (2026-08-07). **Nada aqui foi implementado ainda.** Cada item com checkbox é uma unidade de trabalho independente, para marcar `[x]` conforme for feito e aprovado.

## Contexto e motivação

Hoje, `/oai-kit-converter-tela` implementa (backend + frontend) diretamente na branch em que o dev já está posicionado (tipicamente `develop`), e só cria a branch nova no gate final de `oai-kit-conversao-paridade`, depois que o dev testa e aprova manualmente — nesse momento a branch é criada, o commit é aplicado, e a retroalimentação do Minerva acontece.

O dev pediu para inverter a ordem: a branch deve ser criada **no início** do comando, antes de qualquer classificação/implementação — a sequência correta passa a ser:

1. `/oai-kit-converter-tela` é chamado.
2. Sincroniza `develop` do repositório GlobusWeb-alvo (diretório de trabalho atual da sessão).
3. Cria e faz checkout da branch nova (`feature/{SIGLA}_{SIM|PSE}_{numero}`, ou `feature/{SIGLA}_TASK_{ID_AZURE}` como fallback — mesma resolução já existente do AP-CONV-008).
4. Classificação (triagem) e implementação (backend/frontend) acontecem **nesta branch**, não mais em `develop`.
5. No final, o gate de `oai-kit-conversao-paridade` não cria mais branch nenhuma (já existe) — só commita, dá push, e aciona a retroalimentação.

**Regra nova, absoluta**: nunca fazer merge desta branch de volta para `develop`/`master`/`main`, e nunca commitar qualquer coisa diretamente em `develop`/`master`/`main` do projeto-alvo, em nenhum momento do fluxo — tudo fica na branch até o PR (fora do escopo dos agentes).

**Fora de escopo desta mudança** (confirmar, não implementar):
- `/oai-kit-documentar-tela` — nunca implementa nem commita, só escreve no Minerva. Não afetado.
- Fluxo multi-repo de GAP cross-módulo (AP-CONV-012, `oai-kit-conversao-backend.md` passo 4b) — cria uma branch **em outro repositório**, mas só quando o GAP é confirmado durante a implementação (não é possível antecipar antes de saber se o GAP existe). Continua criada no momento em que é descoberta, não no início.

---

## Iniciativa 1 — Mover a criação da branch para o início do fluxo (triagem)

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-triagem.md`.

- [x] **1.1** Nova etapa "1b — Sincronizar `develop` e criar a branch", inserida logo após o passo 1 (Determinar o modo de entrada e o identificador da tela) e antes do passo 2 (checar especificação prévia) — ou seja, antes de qualquer classificação/leitura de fonte:
  1. Confirmar a sigla do módulo com o dev se ainda não estiver confirmada nesta sessão (nunca assumir — princípio inegociável do `oai-kit.md` central).
  2. Resolver `SIM`/`PSE` (navegando a hierarquia Task→Feature→Epic) ou, na ausência, o ID da própria Task do Azure — mesma resolução já usada hoje no gate final (AP-CONV-008), só que aplicada aqui, no início.
  3. No repositório GlobusWeb-alvo (diretório de trabalho atual): `git fetch`, `git checkout develop`, `git pull`. Parar e informar o dev se a working tree estiver suja ou o pull falhar — nunca prosseguir sobre uma base desatualizada ou com mudanças locais não commitadas.
  4. Criar e fazer checkout da branch nova a partir de `develop`: `feature/{SIGLA}_{SIM|PSE}_{numero}` (ou `feature/{SIGLA}_TASK_{ID_AZURE}` se a Task não tiver SIM/PSE vinculado).
  5. Registrar o nome da branch no plano (`.oai-flow/analysis/{ID}-conversao-plano.md`) para os agentes seguintes referenciarem.
- [x] **1.2** Nova Restrição Absoluta em `oai-kit-conversao-triagem.md`: nunca prosseguir com working tree suja ou pull falho ao sincronizar `develop`; nunca commitar nada em `develop` durante este processo (o checkout em si não commita, mas reforçar explicitamente).

**Critério de "pronto"**: a branch já existe e está com checkout feito antes do passo de classificação começar; nenhuma implementação acontece mais em `develop`.

---

## Iniciativa 2 — Atualizar o comando `/oai-kit-converter-tela`

**Alvo**: `packages/oai-kit-conversao/commands/oai-kit-converter-tela.md`.

- [x] **2.1** Nota no "PASSO 1 — Triagem" explicando que a etapa 1b (sincronizar + criar branch) agora acontece dentro da triagem, antes da classificação — a implementação dos passos seguintes (backend/frontend) já acontece na branch nova, nunca em `develop`.
- [x] **2.2** Atualizar o "CHECKPOINT FINAL" (hoje: *"Só commite (branch/commit no padrão Praxio...) depois que você confirmar..."*) para remover a menção a criar branch — a partir de agora só *"Só commite (no padrão Praxio) depois que você confirmar..."*, já que a branch existe desde o PASSO 1.

**Critério de "pronto"**: o texto do comando não sugere mais, em nenhum lugar, que a branch é criada no final.

---

## Iniciativa 3 — Atualizar `oai-kit-conversao-paridade.md`

**Alvo**: `packages/oai-kit-conversao/agents/oai-kit-conversao-paridade.md`.

- [x] **3.1** Reescrever o trecho do gate final que hoje diz *"sempre crie uma branch nova antes de aplicar o commit, mesmo que o dev esteja posicionado numa dessas branches"* — a branch já existe (criada na triagem, etapa 1b); este agente **nunca cria branch**, só aplica o commit nela.
- [x] **3.2** Nova Restrição Absoluta: nunca fazer merge desta branch para `develop`/`master`/`main`; nunca commitar qualquer coisa diretamente em `develop`/`master`/`main` do projeto-alvo, em nenhuma circunstância.

**Critério de "pronto"**: o agente de paridade não tem mais nenhuma instrução de criar branch — só commit, push, retroalimentação; a proibição de merge/commit em `develop` está explícita.

---

## Iniciativa 4 — Reescrever `AP-CONV-008` (fonte de verdade da política)

**Alvo**: `packages/oai-kit-conversao/policies/conversion-policy.md`.

- [x] **4.1** Reescrever AP-CONV-008 por completo: a branch é criada **no início** de `/oai-kit-converter-tela` (triagem, etapa 1b), a partir de `develop` sincronizada — não mais no gate final. O gate final de `oai-kit-conversao-paridade` só commita (nunca cria branch) e sempre dá push em seguida, com a retroalimentação do Minerva nunca implícita (isso já valia e continua valendo). Nome da branch: mesma resolução de sempre (`feature/{SIGLA}_{SIM|PSE}_{numero}`, fallback `feature/{SIGLA}_TASK_{ID_AZURE}`).
- [x] **4.2** Adicionar regra absoluta nova, destacada: nunca fazer merge da branch de volta para `develop`/`master`/`main`; nunca commitar qualquer coisa diretamente em `develop`/`master`/`main` do projeto-alvo, em nenhum momento do fluxo — tudo fica na branch até o PR (fora do escopo dos agentes de conversão).

**Critério de "pronto"**: AP-CONV-008 é a única fonte de verdade sobre o novo momento de criação da branch — todos os outros arquivos (triagem, comando, paridade) apontam para ela, sem contradição.

---

## Ordem de execução sugerida

1. **Iniciativa 4** primeiro — reescrever a política é a fonte de verdade; os outros arquivos citam ela.
2. **Iniciativa 1** — implementa a mudança de fato no agente que passa a criar a branch.
3. **Iniciativa 2** — ajusta o comando para refletir a nova ordem.
4. **Iniciativa 3** — remove a criação de branch do agente que antes fazia isso.

## Como retomar

Cada sub-item com checkbox é uma unidade de trabalho independente. Ao retomar, reler o "Contexto e motivação" para não perder o motivo da mudança, confirmar o alvo exato do arquivo, implementar, e marcar `[x]` só depois de aprovação explícita (mesmo padrão de gate usado nas iniciativas anteriores desta sessão).
