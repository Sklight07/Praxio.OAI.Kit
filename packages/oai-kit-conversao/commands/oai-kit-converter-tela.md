# /oai-kit-converter-tela

Converte uma tela do sistema legado Delphi (Globus) para o GlobusWeb. Checkpoints variáveis por nível de complexidade (escala `N1`-`N5`/`N-ESPECIAL`, ver `.oai-kit/policies/conversion-policy.md` — arquivo local do projeto, não fica no Minerva) — telas simples com arquétipo conhecido levam 1 checkpoint; telas com gatilho de exceção levam 2+. Se já existir uma especificação prévia (`/oai-kit-documentar-tela` rodado antes, por você ou outro dev) e o nível permitir, a leitura do fonte Delphi é pulada inteira ou parcialmente.

**Uso — 3 modos de entrada, à sua escolha:**

- **Modo A — só Azure**: `/oai-kit-converter-tela {ID_AZURE}`
- **Modo B — só fontes locais** (mais rápido, sem MCP do Azure): `/oai-kit-converter-tela --fontes [caminho1] [caminho2] ... [--tabela [caminho ou nome]]`
- **Modo C — combinação**: `/oai-kit-converter-tela {ID_AZURE} --fontes [caminho1] [caminho2] ...`

O Modo B/C aceita **quantos arquivos forem necessários** — não é limitado a um `.pas`+`.dfm`. Telas no estilo Clean Architecture moderno do legado têm View/Service/Repository/UseCase em arquivos separados; passe todos.

## Sequência de Execução

### PASSO 1 — Triagem

Invoque `oai-kit-conversao-triagem`:
- `git pull` obrigatório em `GlobusEvo.Minerva` antes de qualquer leitura.
- Determina o modo de entrada e o identificador provisório da tela.
- **Etapa 1b — antes de qualquer classificação**: sincroniza `develop` do repositório GlobusWeb-alvo e já cria/faz checkout da branch nova (`feature/{SIGLA}_{SIM|PSE}_{numero}`, ou `feature/{SIGLA}_TASK_{ID_AZURE}` como fallback — AP-CONV-008). Toda a implementação dos passos seguintes (backend, frontend) acontece **nesta branch**, nunca mais em `develop`.
- **Consulta `minerva-index.json` → `especificacoes` primeiro** — se já existir uma especificação prévia para esta tela (feita via `/oai-kit-documentar-tela`), verifica staleness e reaproveita conforme o nível registrado (ver abaixo), sem precisar localizar/ler o fonte Delphi inteiro.
- Se não houver especificação (ou o nível exigir leitura), e Modo A sem anexo, localiza os arquivos no legado via `_shared/oai-kit-legacy-screen-locate.md` — **confirma com você que achou a tela certa antes de continuar**.
- Lê todos os arquivos do conjunto quando precisar ler (não assume 1 arquivo = 1 tela).
- Casa contra os arquétipos da base central e calcula o **nível**: `N1`-`N5` (pontuação estrutural: grid, PK composta, master-detail, referências externas) ou `N-ESPECIAL` (gatilho de exceção: procedure/function, integração, gravação em tabela não-relacionada, muitas regras de negócio — sempre vence a pontuação).
- **Decide o padrão de frontend** (Grid+Modal | Inline+Grid | Accordion+Índice Numerado) via AP-CONV-015: convenção de texto na task do Azure primeiro, senão inferência a partir dos sinais do legado, senão pergunta ao dev — nunca decidido por hábito.
- Gera `.oai-flow/analysis/{ID}-conversao-plano.md`.

### ⚡ CHECKPOINT — proporcional ao nível

- **`N1`-`N3`** → apresenta o plano como informe e segue direto para o PASSO 2, sem bloquear. Se veio de especificação prévia, zero leitura de fonte Delphi.
- **`N4`-`N5`** → apresenta o plano como informe (com os "pontos de atenção" sinalizados) e segue direto — mas o backend/frontend vão confirmar pontualmente esses pontos contra o fonte antes de implementar a parte correspondente.
- **`N-ESPECIAL`** → **PARE AQUI.** Apresente o plano completo (arquétipo, arquivos, GAPs, padrão sugerido) e pergunte: *"O plano está correto? Posso prosseguir? (sim/não)"* Aguarde aprovação explícita antes do PASSO 2.

### PASSO 2 — Backend

Invoque `oai-kit-conversao-backend`:
- `N1`-`N5`: implementa seguindo a receita do arquétipo (confirmando pontualmente os pontos de atenção se `N4`-`N5`).
- `N-ESPECIAL`: processo completo de 5 fases de `delivery-sequencing.md`, aciona `oai-kit-architecture-agent` (perfil developer) se envolver UIKit/padrão arquitetural novo.

### PASSO 3 — Frontend

Invoque `oai-kit-conversao-frontend`:
- Implementa a feature React consumindo o contrato já validado no PASSO 2.
- Mesmo passe do backend quando `N1`-`N5`; gate próprio entre backend e frontend quando `N-ESPECIAL` (contract-review).

### PASSO 4 — Paridade

Invoque `oai-kit-conversao-paridade`:
- Verificação **estática** apenas (build/lint/typecheck/revisão de código vs. spec) — **nunca sobe o projeto** (AP-CONV-010).
- Prepara o checklist de teste manual proporcional ao nível (mínimo `N1`-`N3`, intermediário `N4`-`N5`, completo — `parity-checklist.md` — `N-ESPECIAL`) para **você** rodar na aplicação.
- Classifica divergências que você reportar ao testar: aceitas vs. GAP.

### ⚡ CHECKPOINT FINAL — espera você testar, nunca assume sucesso

**PARADA OBRIGATÓRIA.** Apresenta a verificação estática + o checklist de teste manual, e pede que você rode o checklist na aplicação (subir o projeto é sua parte, não do agente) e confirme o resultado. Só commite (na branch já criada no PASSO 1, padrão Praxio) depois que você confirmar explicitamente que testou e passou — silêncio ou "deve estar ok" não bastam. Nunca cria branch nova aqui (já existe desde o início) e nunca faz merge dela para `develop`/`master`/`main`.

### PASSO 5 — Aprendizado

Invoque `oai-kit-conversao-aprendizado`:
- `git pull` obrigatório em `GlobusEvo.Minerva` antes de qualquer atualização.
- Retroalimenta `minerva-index.json`, `descobertas-oracle/`, arquétipos/cheatsheets/módulos, `gaps/gaps-log.md`, `metrics/conversoes.jsonl` em `GlobusEvo.Minerva`.
- Um único gate ("posso commitar e subir?") — aprovado, **sempre** commita e dá push (com retry automático de `git pull --rebase` uma vez em caso de conflito), não são mais duas perguntas separadas.

## Regra geral

**O MCP do Azure e o MCP Oracle nunca são chamados só por hábito** — apenas quando falta um insumo que só eles fornecem. Telas `N1`-`N5` com arquétipo conhecido nunca acionam o MCP Oracle. Para documentar uma tela adiantado, sem converter, use `/oai-kit-documentar-tela`.
