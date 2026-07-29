# /oai-kit-converter-tela

Converte uma tela do sistema legado Delphi (Globus) para o GlobusWeb. Checkpoints variáveis por complexidade — telas simples com arquétipo conhecido levam 1 checkpoint; telas complexas levam 2+.

**Uso — 3 modos de entrada, à sua escolha:**

- **Modo A — só Azure**: `/oai-kit-converter-tela {ID_AZURE}`
- **Modo B — só fontes locais** (mais rápido, sem MCP do Azure): `/oai-kit-converter-tela --fontes [caminho1] [caminho2] ... [--tabela [caminho ou nome]]`
- **Modo C — combinação**: `/oai-kit-converter-tela {ID_AZURE} --fontes [caminho1] [caminho2] ...`

O Modo B/C aceita **quantos arquivos forem necessários** — não é limitado a um `.pas`+`.dfm`. Telas no estilo Clean Architecture moderno do legado têm View/Service/Repository/UseCase em arquivos separados; passe todos.

## Sequência de Execução

### PASSO 1 — Triagem

Invoque `oai-kit-conversao-triagem`:
- Determina o modo de entrada e busca só o que realmente falta (nunca chama o MCP do Azure ou o MCP Oracle por hábito).
- Se Modo A e a task não tiver os arquivos Delphi anexados, localiza-os no repositório legado via protocolo `_shared/oai-kit-legacy-screen-locate.md` — **confirma com você que achou a tela certa antes de continuar**.
- Lê todos os arquivos do conjunto (não assume 1 arquivo = 1 tela).
- Consulta `minerva-index.json` primeiro, casa contra os arquétipos da base central.
- Classifica **tier**: `SIMPLES` ou `COMPLEXA`.
- Gera `.oai-flow/analysis/{ID}-conversao-plano.md`.

### ⚡ CHECKPOINT — proporcional ao tier

- Se **`COMPLEXA`** → **PARE AQUI.** Apresente o plano completo (arquétipo, arquivos, GAPs, padrão sugerido) e pergunte: *"O plano está correto? Posso prosseguir? (sim/não)"* Aguarde aprovação explícita antes do PASSO 2.
- Se **`SIMPLES`** → apresente o plano como informe e siga direto para o PASSO 2, sem bloquear.

### PASSO 2 — Backend

Invoque `oai-kit-conversao-backend`:
- Implementa seguindo a receita do arquétipo (`SIMPLES`) ou o processo completo de 5 fases de `delivery-sequencing.md` (`COMPLEXA`).
- Se `COMPLEXA` e a tela envolve UIKit/padrão arquitetural novo, aciona `oai-kit-architecture-agent` (perfil developer) antes de prosseguir.

### PASSO 3 — Frontend

Invoque `oai-kit-conversao-frontend`:
- Implementa a feature React consumindo o contrato já validado no PASSO 2.
- Tela 1 = mesmo passe do backend quando `SIMPLES`; gate próprio entre backend e frontend quando `COMPLEXA` (contract-review).

### PASSO 4 — Paridade

Invoque `oai-kit-conversao-paridade`:
- Checklist mínimo (`SIMPLES`) ou completo — `parity-checklist.md` (`COMPLEXA`).
- Classifica divergências: aceitas vs. GAP.

### ⚡ CHECKPOINT FINAL — sempre, rápido em telas SIMPLES

**PARADA OBRIGATÓRIA.** Apresente o resumo do diff + checklist aplicado e pergunte: *"Paridade validada. Posso commitar? (sim/não)"* Só commite (branch/commit no padrão Praxio, sigla do módulo confirmada) após aprovação explícita.

### PASSO 5 — Aprendizado

Invoque `oai-kit-conversao-aprendizado`:
- Retroalimenta `minerva-index.json`, `descobertas-oracle/`, arquétipos/cheatsheets/módulos, `gaps/gaps-log.md`, `metrics/conversoes.jsonl` em `GlobusEvo.Minerva`.
- Gate próprio (commit local e push são perguntas separadas) — `GlobusEvo.Minerva` é compartilhado pelo time.

## Regra geral

**O MCP do Azure e o MCP Oracle nunca são chamados só por hábito** — apenas quando falta um insumo que só eles fornecem. Telas `SIMPLES` com arquétipo conhecido nunca acionam o MCP Oracle.
