# praxio-oai-kit

Kit de IA multi-perfil para times Praxio — **Developer, QA e PO** — com suporte a **Claude Code** e **Cursor**. Há também uma **extensão opcional de Conversão** (`praxio-oai-kit-conversao`), para times fazendo migração assistida por IA de sistemas legados.

> **Humans Decide. Agents Execute.**  
> O kit nunca avança sozinho. Em cada etapa crítica ele para, apresenta o que encontrou e aguarda sua aprovação antes de continuar.

---

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Migrar de v1.x](#migrar-de-v1x)
- [Configuração do MCP](#configuração-do-mcp)
- [Primeiros passos](#primeiros-passos)
- [Comandos CLI](#comandos-cli)
- [Slash Commands — Developer](#slash-commands--developer)
- [Slash Commands — QA](#slash-commands--qa)
- [Slash Commands — PO](#slash-commands--po)
- [Extensão — Conversão de Sistemas Legados](#extensão--conversão-de-sistemas-legados)
- [Fluxos de trabalho](#fluxos-de-trabalho)
- [Padrões da Praxio](#padrões-da-praxio)
- [Agentes disponíveis](#agentes-disponíveis)
- [O Speckit — memória institucional](#o-speckit--memória-institucional)
- [Múltiplos repositórios](#múltiplos-repositórios)
- [Políticas e hard stops](#políticas-e-hard-stops)
- [Estrutura de arquivos](#estrutura-de-arquivos)
- [Configuração local](#configuração-local)
- [Atualizar o kit](#atualizar-o-kit)
- [Perguntas frequentes](#perguntas-frequentes)

---

## Pré-requisitos

- **Node.js** >= 18
- **Claude Code** (`npm install -g @anthropic-ai/claude-code`) e/ou **Cursor**
- **Azure CLI** (`az`) instalado e autenticado (`az login`) — ou um Personal Access Token do Azure DevOps
- Acesso ao Azure DevOps da Praxio

---

## Instalação

Execute dentro do repositório onde quer instalar o kit:

```bash
npx praxio-oai-kit init
```

O assistente pergunta interativamente:

1. **Nome do projeto** — ex: `Praxio.Api.Faturamento`
2. **IDEs** — `1` Claude Code | `2` Cursor | `1,2` ambas
3. **Perfis** — `1` Developer | `2` QA | `3` PO | combinação ex: `1,2`

O que acontece após responder:
- Instala `.oai-kit/` (fonte de verdade dos agentes e comandos)
- Cria `.speckit/` e `.oai-flow/` se não existirem (preservados se já existirem — são seus dados)
- Executa o adapter da IDE selecionada:
  - **Claude Code** → gera `.claude/agents/` e `.claude/commands/` com os agentes do perfil
  - **Cursor** → gera `.cursor/rules/*.mdc` com os agentes do perfil
- Injeta `@.claude/oai-kit.md` no `CLAUDE.md` (Claude Code)
- Cria `oai-kit.yaml` com a configuração do projeto
- Atualiza `.gitignore`

Para reinstalar sobrescrevendo tudo:

```bash
npx praxio-oai-kit init --force
```

---

## Migrar de v1.x

Se o repositório já tem o OAI Kit v1.x instalado (`.claude/agents/` sem `.oai-kit/`):

```bash
npx praxio-oai-kit migrate
```

O comando detecta a instalação v1.x, instala a nova estrutura `.oai-kit/`, pergunta sobre IDEs e perfis, e regenera os agentes. Seus dados em `.speckit/` e `.oai-flow/` são preservados.

---

## Configuração do MCP

> **O `setup-mcp` não é obrigatório.** Os agentes funcionam sem ele — o que muda é o nível de automação.

### Níveis de integração com o Azure DevOps

| Nível | Configuração | O que funciona |
|-------|-------------|----------------|
| **Completo** | `setup-mcp` executado | Leitura e criação automáticas no Azure via MCP |
| **CLI** | `az login` no terminal | Leitura via `az boards`; criação no Azure manual |
| **Manual** | Nenhuma | Dev cola o conteúdo da task na conversa quando solicitado |

Os agentes tentam os três modos em cascata: MCP → `az boards` CLI → solicitar ao dev.

### Quando rodar o `setup-mcp`

Execute se quiser a experiência completa — o agente lê e cria itens no Azure sem nenhuma intervenção manual:

```bash
npx praxio-oai-kit setup-mcp
```

O assistente interativo pede:

| Campo | Exemplo | Descrição |
|-------|---------|-----------|
| Organização ADO | `praxio` | Nome da org no Azure DevOps |
| Autenticação | `PAT` ou `az cli` | Modo de autenticação |
| Personal Access Token | `xxxxx` | Necessário apenas se escolher PAT |
| Repositórios relacionados | (opcional) | Outros repos envolvidos (frontend, libs, etc.) |

Gera:
- `.claude/.local-config.json` — configuração local (gitignored)
- `.mcp.json` — servidor MCP do Azure DevOps para o Claude Code (gitignored)

**Reinicie o Claude Code** após o `setup-mcp` para carregar o servidor MCP.

> **Por dev, não por repositório.** Ambos os arquivos são gitignored — cada desenvolvedor configura uma vez na própria máquina. Pode ser re-executado a qualquer momento para atualizar org, PAT ou repos relacionados.

### Já configurei o MCP no Claude Code manualmente

Se você já tem o servidor Azure DevOps configurado nas settings globais do Claude Code (`~/.claude/settings.json`), o kit vai usá-lo automaticamente — não precisa rodar `setup-mcp` nem gerar `.mcp.json`.

---

## Primeiros passos

### 1. Faça o onboarding do repositório

Dentro do Claude Code:

```
/oai-kit-bootstrap-repo NOME_DO_SISTEMA
```

Gera o **Speckit** — memória institucional do sistema — com análise estática do código. Campos não inferíveis ficam como `[DRAFT]` para você preencher.

### 2. Refine cards antes da sprint

```
/oai-kit-refine-card 54841
```

O agente lê o card no Azure (hierarquia EPIC → FEATURE → US → tasks), analisa o código e posta análise técnica diretamente na task — arquivos prováveis, riscos, estimativa, sugestões de teste.

### 3. Trabalhe no desenvolvimento

Para bugs:
```
/oai-kit-analyze-bug 54841
```

Para features:
```
/oai-kit-feature 54841
```

---

## Comandos CLI

Executados via `npx` no terminal, fora do Claude Code.

### `init`

```bash
npx praxio-oai-kit init
npx praxio-oai-kit init --force
```

Instala o kit com seleção interativa de IDEs e perfis.

### `migrate`

```bash
npx praxio-oai-kit migrate
```

Migra repositório de OAI Kit v1.x para v2.0. Detecta a instalação antiga, instala a nova estrutura `.oai-kit/` e regenera os agentes.

### `update`

```bash
npx praxio-oai-kit update
```

Atualiza o kit para a versão mais recente. Lê `oai-kit.yaml` para saber quais IDEs e perfis estão instalados, atualiza `.oai-kit/` e re-executa os adapters. Seus dados em `.speckit/` e `.oai-flow/` são preservados.

### `ide add`

```bash
npx praxio-oai-kit ide add claude
npx praxio-oai-kit ide add cursor
```

Adiciona suporte a uma nova IDE no repositório. Executa o adapter da IDE e atualiza `oai-kit.yaml`.

### `profile add`

```bash
npx praxio-oai-kit profile add qa
npx praxio-oai-kit profile add po
```

Adiciona um perfil ao repositório. Instala os agentes e comandos do perfil e re-executa os adapters. Útil quando uma equipe passa a incluir QA ou PO no mesmo repositório.

### `setup-mcp`

```bash
npx praxio-oai-kit setup-mcp
```

**Opcional.** Configura a integração com Azure DevOps de forma interativa. Gera `.mcp.json` e `.claude/.local-config.json`. Pode ser re-executado para atualizar configurações. Sem ele, os agentes leem o Azure via `az boards` CLI ou solicitam que o dev cole o conteúdo manualmente. Veja [Configuração do MCP](#configuração-do-mcp) para detalhes.

---

## Slash Commands — Developer

Executados dentro do **Claude Code** (comece digitando `/`).

> **{ID}** nos exemplos = ID numérico da USER STORY no Azure DevOps (ex: `54841`).

---

### `/oai-kit-refine-card`

```
/oai-kit-refine-card 54841
```

**Quando usar:** cerimônia de refinamento, antes da sprint.

Lê a task e a hierarquia completa no Azure, analisa o código local e posta comentário técnico na task com arquivos prováveis, riscos, estimativa (P/M/G/GG) e sugestões de teste para o QA.

---

### `/oai-kit-analyze-bug`

```
/oai-kit-analyze-bug 54841
```

**Quando usar:** início do trabalho em uma correção de bug.

1. Busca task e hierarquia no Azure DevOps.
2. Consulta o Speckit (known issues, diagnostic guide, risk map).
3. Formula hipóteses H1/H2/H3 com probabilidade antes de abrir qualquer arquivo.
4. Determina root cause com **arquivo:linha + trecho de código**.
5. Mapeia blast radius (módulos, banco, integrações, outros repos).

⚡ **Checkpoint 1** — apresenta root cause e estratégia. Aguarda aprovação.

---

### `/oai-kit-generate-fix`

```
/oai-kit-generate-fix 54841
```

**Quando usar:** após aprovar o Checkpoint 1.

1. Valida políticas (sem SQL concatenado, sem credencial hardcoded).
2. Aciona `architecture-agent` se o fix é de alto risco.
3. Confirma a **sigla do módulo** com você (nunca assume).
4. Propõe branch no padrão Praxio.
5. Escreve o **teste que falha** (RED) antes de qualquer código.
6. Implementa o mínimo para o teste passar (GREEN).
7. Commita no formato Praxio.

⚡ **Checkpoint 2** — apresenta o patch para sua revisão.

---

### `/oai-kit-run-regression`

```
/oai-kit-run-regression 54841
```

**Quando usar:** após aprovar o Checkpoint 2.

Confirma RED→GREEN, executa suíte completa e escreve testes complementares (edge cases, cenários do impact report).

---

### `/oai-kit-open-pr`

```
/oai-kit-open-pr 54841
```

**Quando usar:** após validação dos testes.

Gera PR no Azure com título/descrição no padrão Praxio, linka tasks (US + FEATURE) e preenche a task de fechamento de desenvolvimento.

⚡ **Checkpoint 3** — aguarda aprovação do PR no Azure DevOps.

---

### `/oai-kit-release-check`

```
/oai-kit-release-check 54841
```

**Quando usar:** após aprovação do PR.

Verifica quality gates (PR aprovado, CI verde, janela de release). Gera release package com instrução de deploy e o que monitorar pós-deploy.

⚡ **Checkpoint 4** — aguarda confirmação do deploy.

**Pós-deploy:** aciona `learning-agent` — atualiza o Speckit e fecha a task no Azure.

---

### `/oai-kit-feature`

```
/oai-kit-feature 54841
```

**Quando usar:** desenvolvimento de uma feature nova (não é bug).

Auto-dimensiona por complexidade:

| Tamanho | Critério | Fluxo |
|---------|---------|-------|
| **S** | < 4h, 1 módulo, sem banco | 1 checkpoint + execução |
| **M** | 4–16h, até 3 módulos | 1 checkpoint + execução |
| **L** | > 16h ou múltiplos módulos | 2 checkpoints: escopo + plano de tasks |

---

### `/oai-kit-review-pr`

```
/oai-kit-review-pr 42
```

**Quando usar:** revisar o PR de um colega.

Analisa o diff em 4 dimensões: funcionalidade, qualidade, padrões Praxio e testes. Gera veredicto: **APROVADO / APROVADO COM RESSALVAS / SOLICITAR MUDANÇAS**.

---

## Slash Commands — QA

> Disponíveis quando o perfil `qa` está instalado.

---

### `/oai-kit-qa-plan`

```
/oai-kit-qa-plan 54841
```

**Quando usar:** criar ou atualizar o plano de testes de uma US.

Dois modos:
- **Refinamento** — análise prévia sem acesso ao código (pré-sprint). Cria Test Plan + Test Suite no Azure com Test Cases estruturados.
- **Execução** — valida a implementação pronta. Atualiza os Test Cases com resultados e cria tasks `[AJUSTE]` para defeitos encontrados.

---

### `/oai-kit-qa-refine-card`

```
/oai-kit-qa-refine-card 54841
```

**Quando usar:** cerimônia de refinamento, perspectiva QA.

Analisa a task sob ótica de testabilidade — critérios de aceite, ambiguidades, cenários de borda. Posta análise no Azure e adiciona tag `refinado-qa`.

---

### `/oai-kit-qa-regression`

```
/oai-kit-qa-regression 42
```

**Quando usar:** antes de validar um PR.

Mapeia o diff do PR nas suítes de regressão da base de conhecimento QA. Classifica risco por suíte (CRÍTICO / ALTO / MÉDIO / BAIXO) e indica quais devem ser executadas obrigatoriamente.

---

### `/oai-kit-qa-validate`

```
/oai-kit-qa-validate 54841
```

**Quando usar:** após o PR estar pronto, antes de aprovar.

Cruza os critérios de aceite da task com o código do PR. Classifica cada critério: ✅ Atendido | ⚠️ Parcial | ❌ Não atendido | ❓ Não verificável.

---

### `/oai-kit-qa-bug`

```
/oai-kit-qa-bug
```

**Quando usar:** ao encontrar um defeito durante execução de testes.

Estrutura o defeito (título, contexto, passos, esperado vs. obtido, evidências) e cria task `[AJUSTE] CTxx.xx` vinculada à US no Azure DevOps.

---

## Slash Commands — PO

> Disponíveis quando o perfil `po` está instalado.

---

### `/oai-kit-po-document`

```
/oai-kit-po-document 54841
```

**Quando usar:** documentar uma nova demanda como User Story.

Cria US no Azure com critérios de aceite testáveis, regras de negócio e Definition of Ready. Garante rastreabilidade EPIC → FEATURE → US.

---

### `/oai-kit-po-prototype`

```
/oai-kit-po-prototype 54841
```

**Quando usar:** validar uma demanda antes da sprint com o cliente/squad.

Gera protótipo HTML interativo de página única, offline, fiel ao visual do sistema (usa base de conhecimento PO). Output: `.oai-flow/discovery/{ID}-prototype.html`.

---

### `/oai-kit-po-scan-visual`

```
/oai-kit-po-scan-visual [NOME_DO_SISTEMA]
```

**Quando usar:** ao iniciar o kit em um sistema existente.

Extrai padrões visuais de screenshots (paleta, tipografia, componentes, layout). Popula `.oai-kit/knowledge/po/visual-patterns/{sistema}-tokens.md` para uso pelos protótipos.

---

### `/oai-kit-po-refine-card`

```
/oai-kit-po-refine-card 54841
```

**Quando usar:** cerimônia de refinamento, perspectiva PO.

Verifica Definition of Ready — clareza de negócio, critérios de aceite, escopo delimitado. Propõe melhorias, atualiza descrição da US (com aprovação) e adiciona tag `refinado-po`.

---

## Extensão — Conversão de Sistemas Legados

`praxio-oai-kit-conversao` é um **pacote npm separado** (`packages/oai-kit-conversao/` neste monorepo), pensado para times fazendo migração assistida por IA de um sistema legado para uma arquitetura nova — ex: telas Delphi convertidas 1:1 para um sistema web moderno. Não é instalado por padrão; é uma extensão opcional sobre o kit base.

**Por que é um pacote separado, e não só mais um perfil:** o volume de trabalho de uma migração desse tipo (centenas de telas) faz esse fluxo iterar muito mais rápido que o ciclo normal de bug/feature do kit base — desacoplar o release faz sentido técnico, não só organizacional. Ainda assim, ele reaproveita 100% do mecanismo de perfis/adapters já existente — não duplica nada da infraestrutura do kit base.

### Instalação

```bash
npx praxio-oai-kit init                    # kit base, se ainda não instalado
npx praxio-oai-kit-conversao init          # extensão: perfil "conversao" + wizard
```

O wizard de `praxio-oai-kit-conversao init`:
- Deposita o perfil `conversao` (agentes/comandos/policy) dentro de `.oai-kit/` do repositório e reexecuta o adapter da IDE ativa.
- Pergunta o caminho local do repositório legado e de uma **base de conhecimento central** (um repositório git próprio, compartilhado por todos os módulos em conversão — não duplicado por repositório).
- Pergunta, de forma opcional, se você quer configurar MCPs auxiliares (ex: exploração de schema Oracle, indexação de código como grafo de conhecimento) — só usados quando a conversão realmente precisar, nunca por padrão.
- Salva tudo em `.claude/.local-config.json` (pessoal, gitignored), sob a chave `conversao`.

Para atualizar o perfil depois de uma nova versão do pacote, sem repetir o wizard:

```bash
npx praxio-oai-kit-conversao@latest update
```

### Uso

```
/oai-kit-documentar-tela {ID_AZURE ou --fontes ...}          # documenta uma tela adiantado, sem converter
/oai-kit-converter-tela {ID_AZURE}                          # Modo A — só Azure
/oai-kit-converter-tela --fontes [caminho1] [caminho2] ...  # Modo B — só fontes locais
/oai-kit-converter-tela {ID_AZURE} --fontes [...]           # Modo C — combinação
/oai-kit-registrar-gap                                       # registra um GAP a qualquer momento
```

O comando principal classifica a tela numa escala graduada (`N1`-`N5`, por sinais estruturais como grid/PK composta/master-detail/referências externas, ou `N-ESPECIAL` quando há procedure/integração/gravação em tabela não-relacionada/muitas regras de negócio) antes de implementar, decidindo quanto do fonte legado precisa ser lido e quantos checkpoints a conversão tem. Se uma especificação prévia já existir (via `/oai-kit-documentar-tela`), a leitura do fonte é pulada total ou parcialmente. Tudo que é descoberto numa conversão (padrões, armadilhas, schema, decisões em aberto) retroalimenta a base de conhecimento central, para nunca ser redescoberto na próxima tela. Os agentes nunca sobem/executam o projeto — no máximo compilam/lint — testar rodando é sempre trabalho do dev.

---

## Fluxos de trabalho

### Bug Flow (fluxo completo)

```
/oai-kit-analyze-bug {ID}
    └─ busca task + hierarquia Azure
    └─ consulta Speckit
    └─ root cause com arquivo:linha
    └─ blast radius + risco
    └─ ⚡ CHECKPOINT 1

/oai-kit-generate-fix {ID}
    └─ [architecture-agent se necessário]
    └─ propõe branch → RED → GREEN → VERIFY
    └─ commit no formato Praxio
    └─ ⚡ CHECKPOINT 2

/oai-kit-run-regression {ID}
    └─ RED→GREEN confirmado
    └─ testes complementares

/oai-kit-open-pr {ID}
    └─ PR no Azure com título/descrição padrão Praxio
    └─ linka tasks + preenche fechamento de dev
    └─ ⚡ CHECKPOINT 3 (review no Azure)

/oai-kit-release-check {ID}
    └─ quality gates
    └─ ⚡ CHECKPOINT 4 (confirme o deploy)
    └─ learning-agent → Speckit atualizado → task fechada
```

### Feature Flow

```
/oai-kit-feature {ID}
    └─ lê task + refinamento prévio
    └─ especificação + sizing (S/M/L)
    └─ ⚡ CHECKPOINT 1
    └─ [plano de tasks se L] → ⚡ CHECKPOINT 2
    └─ RED→GREEN por task
    └─ /oai-kit-open-pr → /oai-kit-release-check
```

### QA Flow

```
/oai-kit-qa-refine-card {ID}     ← pré-sprint, cerimônia de refinamento
    └─ análise de testabilidade
    └─ posta comentário + tag refinado-qa

/oai-kit-qa-plan {ID}            ← criação do plano (modo Refinamento)
    └─ Test Plan + Test Suite + Test Cases no Azure

/oai-kit-qa-regression {PR}      ← antes de validar o PR
    └─ mapeamento de suítes de regressão

/oai-kit-qa-validate {ID}        ← validação dos critérios de aceite
    └─ ✅ / ⚠️ / ❌ por critério

/oai-kit-qa-bug                  ← ao encontrar defeito
    └─ cria task [AJUSTE] no Azure
```

### Refinamento (cerimônia)

```
Para cada item da próxima sprint:

  Dev:  /oai-kit-refine-card {ID}
  QA:   /oai-kit-qa-refine-card {ID}
  PO:   /oai-kit-po-refine-card {ID}
```

---

## Padrões da Praxio

### Branch

| Origem | Formato | Exemplo |
|--------|---------|---------|
| `develop` / `feature` | `feature/{SIGLA}_{SIM\|PSE}_{N}` | `feature/FLP_SIM_94457` |
| `master` / `main` / `hotfix` | `hotfix/{SIGLA}_{SIM\|PSE}_{N}` | `hotfix/CGS_PSE_79548` |

- `SIGLA` — sigla do módulo em maiúsculas (ex: `FLP`, `CTR`, `CGS`). O agente sempre pergunta — nunca assume.
- `SIM` / `PSE` — tipo da solicitação do SAC.

### Commit

```
{feat|fix}: {SIGLA}_{SIM|PSE}_{numero} #{ID_USER_STORY}

{descrição breve do que foi feito}

US: #{ID_FEATURE}
```

### Pull Request

- **Título:** igual à primeira linha do commit — `feat: FLP_SIM_94457 #54841`
- **Descrição:** conteúdo completo do commit + arquivos alterados + passos para testar
- **Links:** PR linkado à USER STORY e à FEATURE no Azure DevOps

---

## Agentes disponíveis

Os agentes são ativados pelos slash commands. Você pode invocá-los diretamente para acionar um passo específico.

### Developer

| Agente | Ativado por | O que faz |
|--------|------------|-----------|
| `oai-kit-azure-card-refiner` | `/oai-kit-refine-card` | Analisa task no Azure e posta análise técnica |
| `oai-kit-bug-investigator` | `/oai-kit-analyze-bug` | Root cause com arquivo:linha obrigatório |
| `oai-kit-impact-analyzer` | `/oai-kit-analyze-bug` | Blast radius, risco, repos adicionais afetados |
| `oai-kit-architecture-agent` | `/oai-kit-generate-fix` (condicional) | Valida abordagem contra ADRs e policies |
| `oai-kit-builder-agent` | `/oai-kit-generate-fix`, `/oai-kit-feature` | Patch mínimo com RED→GREEN, branch e commit |
| `oai-kit-test-validator` | `/oai-kit-run-regression` | Confirma RED→GREEN, testes complementares |
| `oai-kit-pr-generator` | `/oai-kit-open-pr` | PR no Azure + fechamento de dev |
| `oai-kit-release-agent` | `/oai-kit-release-check` | Quality gates + release package |
| `oai-kit-learning-agent` | `/oai-kit-release-check` pós-deploy | Atualiza Speckit + fecha task |
| `oai-kit-pr-reviewer` | `/oai-kit-review-pr` | Revisão em 4 dimensões |

### QA

| Agente | Ativado por | O que faz |
|--------|------------|-----------|
| `oai-kit-qa-planner` | `/oai-kit-qa-plan` | Cria/atualiza plano de testes no Azure |
| `oai-kit-qa-refiner` | `/oai-kit-qa-refine-card` | Análise de testabilidade pré-sprint |
| `oai-kit-regression-planner` | `/oai-kit-qa-regression` | Mapeia suítes de regressão por PR |
| `oai-kit-acceptance-validator` | `/oai-kit-qa-validate` | Critérios de aceite vs. código do PR |
| `oai-kit-bug-analyzer` | `/oai-kit-qa-bug` | Estrutura defeito + cria task de ajuste |

### PO

| Agente | Ativado por | O que faz |
|--------|------------|-----------|
| `oai-kit-po-demand` | `/oai-kit-po-document` | Documenta demanda como US com critérios de aceite |
| `oai-kit-po-prototype` | `/oai-kit-po-prototype` | Protótipo HTML interativo fiel ao visual |
| `oai-kit-po-scan-visual` | `/oai-kit-po-scan-visual` | Extrai tokens visuais de screenshots |
| `oai-kit-po-refine-card` | `/oai-kit-po-refine-card` | Verifica DoR + posta análise no Azure |

---

## O Speckit — memória institucional

O Speckit é a pasta `.speckit/` — fica no repositório e cresce com cada ticket encerrado.

```
.speckit/
  domain/
    system-overview.md     ← módulos, integrações, repos relacionados
    naming-guide.md        ← nomes que enganam, glossário, enums críticos
    diagnostic-guide.md    ← tabela sintoma → suspeito imediato (cresce com cada bug)
  architecture/
    architecture-overview.md  ← padrão arquitetural, débito técnico
    risk-map.md               ← hotspots por risco (ALTO/MÉDIO/BAIXO)
  known-issues/
    known-issues.md       ← padrões de bug confirmados com fix padrão
    anti-patterns.md      ← o que não replicar (AP-001, AP-002...)
    gray-zones.md         ← ambiguidades sem resposta única
  decisions/
    adr-registry.md       ← índice de ADRs
  business-rules/
    business-rules.md     ← regras de negócio com impacto técnico
  incidents/
    metrics-feed.jsonl    ← métricas por ticket (append-only)
    speckit-updates.md    ← changelog de atualizações
```

**Como o Speckit cresce:**
- `/oai-kit-bootstrap-repo` → estrutura inicial com análise estática
- `learning-agent` → enriquece automaticamente após cada deploy
- `/oai-kit-update-speckit` → atualiza com mudanças recentes do repositório

---

## Múltiplos repositórios

Alguns cenários envolvem mais de um repositório — mudança de contrato de API que afeta o frontend, alteração em lib compartilhada. O kit lida com isso de forma **opcional e situacional**.

1. Verifica `knownRepos` em `.claude/.local-config.json` — se o repo estiver cadastrado, usa direto.
2. Se não estiver, pergunta: *"Identifiquei que [X] pode estar envolvido. Você tem o caminho local?"*
3. **Nunca** modifica outro repo sem confirmação explícita.

### Cadastrar repos relacionados

```json
// .claude/.local-config.json
"knownRepos": [
  {
    "name": "Frontend",
    "path": "C:\\Projetos\\App.Frontend",
    "type": "frontend",
    "description": "SPA React do módulo FLP"
  }
]
```

---

## Políticas e hard stops

As políticas em `.oai-kit/policies/` são regras que os agentes não podem ignorar.

### Hard stops absolutos

| Código | Regra | Consequência |
|--------|-------|-------------|
| AP-001 | Credencial hardcoded em qualquer arquivo | Bloqueado pelo architecture-agent |
| AP-002 | SQL construído por concatenação de string | Bloqueado pelo architecture-agent |
| AP-003 | `catch` vazio que engole exceção | Sinalizado como bloqueante |
| AP-004 | Commit direto em `main`/`master`/`develop` sem PR | Recusado pelo builder-agent |

### Janelas de release

| Dia | Janela | Observação |
|-----|--------|-----------|
| Segunda | 10h–16h | Evitar início do dia |
| Terça–Quinta | 09h–17h | Janela padrão |
| Sexta | 09h–12h | Apenas hotfix P1/P2 após 12h |
| Sábado–Domingo | ❌ | Sem deploy |

---

## Estrutura de arquivos

Após `npx praxio-oai-kit init`:

```
.oai-kit/                 ← fonte de verdade (kit-managed, commitado)
  agents/
    developer/            ← 10 agentes do perfil Developer
    qa/                   ← 5 agentes do perfil QA
    po/                   ← 4 agentes do perfil PO
    _shared/              ← protocolos compartilhados
  commands/
    developer/            ← 8 comandos Developer
    qa/                   ← 5 comandos QA
    po/                   ← 4 comandos PO
    shared/               ← comandos compartilhados (bootstrap, update-speckit)
  knowledge/
    qa/                   ← base de conhecimento QA (processos, suítes, docs)
    po/                   ← base de conhecimento PO (tokens visuais, templates)
  policies/               ← coding-principles, security-policy, release-policy
  oai-kit.md              ← instruções centrais

.claude/                  ← gerado pelo adapter Claude (commitado)
  oai-kit.md              ← cópia das instruções centrais
  agents/                 ← agentes dos perfis instalados
  commands/               ← slash commands dos perfis instalados

.cursor/rules/            ← gerado pelo adapter Cursor (commitado se Cursor for IDE ativa)
  oai-kit-workflow.mdc    ← regra always-on com padrões Praxio
  oai-kit-policies.mdc    ← políticas always-on
  *.mdc                   ← um arquivo por agente

.speckit/                 ← user-owned (nunca sobrescrito)
  domain/                 ← contexto do sistema
  architecture/           ← decisões e risk map
  known-issues/           ← bugs conhecidos e anti-patterns
  decisions/              ← ADRs
  business-rules/         ← regras de negócio
  incidents/              ← métricas e changelog

.oai-flow/               ← user-owned (artifacts dos tickets)
  analysis/              ← BugReports, ImpactReports
  design/                ← ArchGuidance
  delivery/              ← Patches, PRs, ReleasePackages
  discovery/             ← artifacts de features e protótipos

oai-kit.yaml             ← config do projeto (IDEs e perfis instalados)
CLAUDE.md                ← contém @.claude/oai-kit.md (injetado pelo init)
.mcp.json                ← configuração MCP Azure DevOps (gitignored)
```

---

## Configuração local

O arquivo `.claude/.local-config.json` (gitignored, por dev) centraliza a configuração pessoal:

```json
{
  "schemaVersion": 1,
  "provider": "azureDevOps",
  "azureDevOps": {
    "authMode": "pat",
    "org": "praxio",
    "project": "Desenvolvimento"
  },
  "knownRepos": [
    {
      "name": "Frontend",
      "path": "C:\\Projetos\\App.Frontend",
      "type": "frontend",
      "description": "SPA React do módulo FLP"
    }
  ]
}
```

Para reconfigurar: `npx praxio-oai-kit setup-mcp`

---

## Atualizar o kit

Quando uma nova versão for publicada:

```bash
npx praxio-oai-kit update
```

Lê `oai-kit.yaml` para saber quais IDEs e perfis estão instalados, atualiza `.oai-kit/` e re-executa os adapters. Seus dados em `.speckit/` e `.oai-flow/` são preservados.

---

## Perguntas frequentes

**O agente não encontrou o servidor MCP do Azure DevOps.**  
Isso é esperado se você não rodou o `setup-mcp` — o agente vai usar `az boards` CLI ou pedir que você cole o conteúdo da task. Se quiser o MCP automático: rode `npx praxio-oai-kit setup-mcp`, verifique se `.mcp.json` existe na raiz e reinicie o Claude Code.

**O `setup-mcp` é obrigatório para usar o kit?**  
Não. Os agentes têm fallback em cascata: MCP → `az boards` CLI → cole o conteúdo manualmente. O `setup-mcp` habilita o nível mais automático, mas o kit funciona sem ele. Veja [Configuração do MCP](#configuração-do-mcp).

**O agente está pedindo a sigla do módulo toda vez.**  
A sigla não é inferida automaticamente — o kit sempre confirma com você para evitar erros de branch/commit.

**Posso usar o kit em um repositório que já tem um `CLAUDE.md` com conteúdo?**  
Sim. O `init` apenas adiciona `@.claude/oai-kit.md` ao final do `CLAUDE.md` existente, sem sobrescrever o conteúdo anterior.

**O Speckit gerado pelo `/oai-kit-bootstrap-repo` está com muitos `[DRAFT]`.**  
Isso é esperado na primeira vez. Preencha `.speckit/domain/system-overview.md` junto com um dev sênior do projeto.

**Quero adicionar o perfil QA num repositório que já tem só o Developer.**  
```bash
npx praxio-oai-kit profile add qa
```
O comando instala os agentes QA e regenera os adapters. Nenhum agente Developer é removido.

**`.cursor/rules/` deve ser commitado?**  
Sim, se o Cursor for uma IDE ativa no repositório — assim todos os devs que usam Cursor têm as mesmas regras. Se o repositório não usa Cursor, esse diretório fica em `.gitignore`.

**Posso rodar `/oai-kit-refine-card` durante a execução, não apenas no refinamento?**  
Pode, mas na execução o dev usa `/oai-kit-analyze-bug` ou `/oai-kit-feature` — que já fazem suas próprias análises e leem os comentários postados pelo `/oai-kit-refine-card`. Usar ambos não é problema, mas é redundante.

---

## Licença

MIT — Praxio
