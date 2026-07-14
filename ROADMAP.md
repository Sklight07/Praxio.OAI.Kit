# OAI Kit — Roadmap de Evolução

> Documento de planejamento estratégico gerado em 2026-07-14.
> Consolida análise comparativa com o ecossistema (aider, Cline, Linear AI, GitHub Copilot Workspace, continue.dev, Devin) e lacunas identificadas no kit v2.0.

---

## Visão para o próximo ciclo

O kit v2.0 estabelece a estrutura de agentes, perfis e checkpoints. O próximo ciclo tem um objetivo central:

> **O kit deve aprender com o trabalho que ajuda a fazer — e não apenas executar comandos.**

Hoje o kit *executa bem*. O que falta é o loop de retroalimentação: métricas reais de ciclo, Speckit que se atualiza sozinho, estimativas calibradas com histórico do time, e agentes que debatem entre si antes de agir. Cada fase abaixo avança nessa direção.

---

## Princípios para o próximo ciclo

- **Fechar loops antes de abrir novos** — Speckit automático antes de novos agentes.
- **Dados antes de inteligência** — métricas antes de estimativas inteligentes.
- **Integração real antes de promessa** — Cursor adapter real ou remoção da promessa.
- **Shift-left em tudo** — QA, arquitetura e métricas entram mais cedo no ciclo.
- **Stakeholder não-técnico como usuário** — release notes, dashboard e coach falam para além do dev.

---

## Fase 1 — Fechar o ciclo de aprendizado *(prioridade máxima)*

> Pré-requisito para Fase 2 e 3. Sem dados e sem automação do ciclo, as inovações das fases seguintes não têm base.

---

### F1.1 — `metrics-feed.jsonl` automático

**Motivação:** Hoje não é possível responder: qual agente é mais usado? O ciclo de bug fix leva quanto tempo? O root cause foi preciso? Sem dados, o kit não evolui baseado em evidência.

**O que fazer:**

Cada agente, ao concluir sua execução, deve acrescentar uma linha ao arquivo `.oai-flow/metrics/metrics-feed.jsonl` com o seguinte schema:

```json
{
  "ts": "2026-07-14T10:23:00Z",
  "comando": "/oai-kit-analyze-bug",
  "agente": "oai-kit-bug-investigator",
  "id_azure": "54841",
  "sim_pse": "SIM 954783",
  "modulo": "FLP",
  "sizing": null,
  "resultado": "root_cause_identificado",
  "duracao_min": null,
  "checkpoints_passados": 1,
  "observacoes": ""
}
```

Campos opcionais são `null` quando não aplicáveis. `resultado` segue um enum fixo por agente:
- bug-investigator: `root_cause_identificado` | `inconclusivo` | `fora_de_escopo`
- builder-agent: `patch_gerado` | `bloqueado_por_politica` | `aguardando_arquitetura`
- pr-generator: `pr_criado` | `pr_atualizado` | `falhou_mcp`
- qa-planner: `plano_criado` | `plano_atualizado`
- learning-agent: `speckit_atualizado` | `sem_novidade`

**Arquivos a criar/modificar:**
- `.oai-flow/metrics/.gitkeep` — garante que o diretório é commitado
- `.oai-flow/metrics/metrics-feed.jsonl` — gitignored (dados de runtime)
- Adicionar bloco de registro no final de cada agente (após o último gate)
- `oai-kit-learning-agent.md` — adicionar etapa de consolidação dos metrics

**Complexidade:** P  
**Dependência:** nenhuma  
**Critérios de aceite:**
- Cada comando invocado gera ao menos uma linha no jsonl
- O arquivo nunca sobrescreve linhas anteriores (append-only)
- O `oai-kit-learning-agent` consegue ler e sumarizar o feed ao ser invocado

---

### F1.2 — Git hook pós-merge → `learning-agent` automático

**Motivação:** O `oai-kit-learning-agent` hoje depende de o dev lembrar de rodar `/oai-kit-release-check` após o deploy. Na prática, o Speckit nunca é atualizado. O conhecimento se perde.

**O que fazer:**

Criar um script de git hook (`post-merge`) que:
1. Detecta se o merge é de uma branch `feature/*` ou `hotfix/*` para `main/master/develop`
2. Lê o ID Azure da mensagem do último commit mergeado (já está no padrão `#{ID}`)
3. Exibe aviso: *"OAI Kit detectou merge de [branch]. Deseja executar o learning-agent para atualizar o Speckit? (s/n)"*
4. Se confirmado, escreve um arquivo trigger `.oai-flow/triggers/learning-{ID}.trigger` para o dev ou CI executar o agente na próxima sessão

O hook não pode invocar Claude diretamente (sem shell interativo), mas pode criar o trigger e exibir a instrução de retomada.

**Arquivos a criar/modificar:**
- `scripts/hooks/post-merge` — script bash
- `scripts/install-hooks.sh` — instala o hook em `.git/hooks/`
- `package.json` — adicionar `postinstall: "node scripts/install-hooks.js"` para repos que usam npm
- `.oai-kit/workflows/post-merge-learning.md` — documenta o fluxo
- `.oai-flow/triggers/.gitkeep`

**Complexidade:** M  
**Dependência:** F1.1 (para o learning-agent ter dados úteis)  
**Critérios de aceite:**
- Merge de feature branch gera aviso no terminal
- Arquivo trigger criado no path correto com o ID Azure extraído
- A instrução de retomada exibida é executável pelo dev sem lembrar a sintaxe

---

### F1.3 — Comando `/oai-kit-handoff {ID}`

**Motivação:** Dev sai no meio de um ticket (férias, emergência, rodízio). Hoje não existe forma padronizada de comunicar onde parou. O dev que assume perde horas reconstruindo o contexto.

**O que fazer:**

Novo agente `oai-kit-handoff-agent` que:

**Etapa 1 — Coletar estado atual:**
- Lê a task no Azure via MCP (hierarquia completa)
- Lê `.oai-flow/analysis/{ID}-*.md` e `.oai-flow/delivery/{ID}-*.md` se existirem
- Executa `git log --oneline -10` e `git status` na branch do ticket
- Pergunta ao dev: *"Qual o próximo passo que estava prestes a executar? Há algum bloqueio ou contexto não documentado?"*

**Etapa 2 — Gerar briefing de handoff:**

```markdown
## Handoff — Task #{ID} — {SIM/PSE}

**Estado atual:** [checkpoint atingido — ex: "Root cause identificado, patch ainda não gerado"]
**Branch:** feature/MOD_SIM_123456
**Último commit:** abc1234 — "..."
**Próximo passo:** [o que o dev informou]

### O que foi feito
- [lista dos artifacts gerados]

### O que falta
- [ ] Gerar patch (Gate de Plano pendente)
- [ ] Rodar testes RED→GREEN
- [ ] Abrir PR

### Contexto não-óbvio
[o que o dev informou que não está documentado em nenhum artifact]

### Como retomar
1. Abra a branch: `git checkout feature/MOD_SIM_123456`
2. Execute: `/oai-kit-generate-fix {ID}`
3. O OAI Kit vai carregar os artifacts já gerados automaticamente
```

**Etapa 3 — Gate e publicação:**
- Exibe o briefing completo
- Pergunta: posso postar como comentário na task #ID no Azure? (sim/não)
- Se sim: posta via MCP com tag `handoff`
- Salva em `.oai-flow/delivery/{ID}-handoff.md`

**Arquivos a criar:**
- `.oai-kit/agents/developer/oai-kit-handoff-agent.md`
- `.oai-kit/commands/developer/oai-kit-handoff.md`
- Atualizar tabelas de agentes e comandos em `.oai-kit/oai-kit.md` e `.claude/oai-kit.md`

**Complexidade:** M  
**Dependência:** nenhuma (funciona mesmo sem F1.1)  
**Critérios de aceite:**
- O briefing é compreensível por um dev que nunca viu o ticket
- O próximo passo é executável com um único comando
- O comentário no Azure é postado com tag `handoff` visível

---

### F1.4 — Adapter Cursor real ou remoção da promessa

**Motivação:** O kit promete suporte a Cursor (`adapter-claude.js`, `oai-kit.yaml` com profiles) mas isso nunca foi validado. É uma promessa sem entrega — e confunde quem tenta usar.

**Opção A — Implementar de verdade:**

O adapter precisa:
1. Ler `oai-kit.yaml` e os agents do profile ativo
2. Gerar `.cursorrules` consolidado com as instruções dos agentes relevantes
3. Gerar `docs/` com os prompts de cada agente para uso manual no Cursor

Script: `scripts/adapter-cursor.js`

Estrutura gerada:
```
.cursorrules              ← instruções globais + lista de agentes disponíveis
.cursor/
  agents/                 ← um arquivo .mdc por agente (formato Cursor)
    oai-kit-bug-investigator.mdc
    oai-kit-builder-agent.mdc
    ...
```

**Opção B — Remover a promessa:**
- Remover menções a Cursor e IDE-agnóstico das docs
- Documentar claramente: "suporta Claude Code; Cursor planejado para v3.0"

**Recomendação:** Implementar Opção A. O mercado Cursor é grande e o kit tem tudo que precisa — só falta o adapter.

**Arquivos a criar/modificar:**
- `scripts/adapter-cursor.js` (Opção A)
- `oai-kit.yaml` — validar estrutura de profiles
- `README.md` — documentar os dois adapters
- `.oai-kit/oai-kit.md` — atualizar seção de IDEs suportadas

**Complexidade:** M (Opção A) / P (Opção B)  
**Dependência:** nenhuma  
**Critérios de aceite (Opção A):**
- `node scripts/adapter-cursor.js` gera `.cursorrules` válido e arquivos `.mdc`
- Um dev consegue usar os agentes no Cursor sem ler o código-fonte do kit

---

### F1.5 — PR comments diretos via MCP no Azure

**Motivação:** O `oai-kit-pr-reviewer` analisa o PR e gera um relatório, mas o dev precisa copiar e colar manualmente. O `oai-kit-pr-generator` cria o PR mas não posta a descrição estruturada como comentário. O loop não fecha sozinho.

**O que fazer:**

Nos agentes `oai-kit-pr-reviewer` e `oai-kit-pr-generator`:

1. Após gerar o output final, exibir Gate Pré-Azure
2. Se aprovado, chamar:
   ```
   mcp__azure-devops__wit_add_comment(
     id: {ID_PR_ou_US},
     text: {conteúdo formatado}
   )
   ```
3. Confirmar ao dev o ID do comentário criado

Adicionalmente, o `oai-kit-pr-reviewer` deve postar os findings diretamente no PR como thread de comentário, não apenas no terminal do dev.

**Arquivos a modificar:**
- `.oai-kit/agents/developer/oai-kit-pr-generator.md`
- `.oai-kit/agents/developer/oai-kit-pr-reviewer.md`

**Complexidade:** P  
**Dependência:** nenhuma (só depende do MCP estar disponível na sessão)  
**Critérios de aceite:**
- Review postado como comentário no Azure sem intervenção manual do dev
- Gate exibido antes de qualquer ação no Azure

---

## Fase 2 — Elevar a precisão dos agentes *(médio prazo)*

> Depende de F1.1 para os itens de dados, mas F2.2, F2.3 e F2.4 são independentes.

---

### F2.1 — Speckit index estruturado (`speckit-index.json`)

**Motivação:** O Speckit hoje é uma coleção de markdowns — útil para leitura humana, mas frágil para busca dos agentes. Em repos grandes, cada agente carrega todo o Speckit no contexto, desperdiçando tokens e perdendo precisão.

**O que fazer:**

O `oai-kit-learning-agent` passa a manter, além dos markdowns existentes, um arquivo `.speckit/speckit-index.json`:

```json
{
  "versao": "1.0",
  "ultima_atualizacao": "2026-07-14",
  "modulos": {
    "FLP": {
      "descricao": "Módulo de frete e logística",
      "arquivos_principais": ["src/FLP/Services/FreteService.cs"],
      "regras_negocio": ["RN-001", "RN-007"],
      "bugs_conhecidos": ["KI-003", "KI-011"],
      "adrs_relevantes": ["ADR-002"],
      "risk_level": "alto"
    }
  },
  "regras_negocio": {
    "RN-001": {
      "descricao": "Frete grátis acima de R$150",
      "arquivo": "business-rules/regras-frete.md",
      "modulos_afetados": ["FLP", "ESO"],
      "ultima_alteracao": "2026-05-10"
    }
  },
  "bugs_conhecidos": {
    "KI-003": {
      "descricao": "Race condition no recálculo de frete em checkout simultâneo",
      "arquivo": "known-issues/known-issues.md",
      "modulos_afetados": ["FLP"],
      "workaround": true
    }
  }
}
```

Os agentes passam a fazer lookup no index *antes* de ler os markdowns completos — só carregam a seção relevante para o ticket em mãos.

**Arquivos a criar/modificar:**
- `.speckit/speckit-index.json` — gerado e mantido pelo learning-agent
- `.oai-kit/agents/developer/oai-kit-learning-agent.md` — adicionar etapa de atualização do index
- `oai-kit-ticket-fetch.md` (shared protocol) — adicionar etapa de lookup no index
- `.oai-kit/agents/developer/oai-kit-bug-investigator.md` — usar index para filtrar contexto

**Complexidade:** G  
**Dependência:** learning-agent bem alimentado (F1.1 ajuda, mas não é bloqueante)  
**Critérios de aceite:**
- bug-investigator carrega apenas os módulos relevantes ao ticket, não o Speckit inteiro
- learning-agent atualiza o index após cada ciclo completado
- O index é válido como JSON a qualquer momento

---

### F2.2 — QA shift-left integrado ao refinamento

**Motivação:** O QA hoje entra após a implementação. Critérios de aceite não-testáveis chegam para o dev já comprometido com uma abordagem. Isso gera ciclos de retorno caros.

**O que fazer:**

Modificar o fluxo de refinamento para que o `oai-kit-azure-card-refiner` (Dev) e o `oai-kit-qa-refiner` (QA) rodem **em paralelo** como parte do mesmo `/oai-kit-refine-card`:

**Novo fluxo de `/oai-kit-refine-card {ID}`:**

1. `oai-kit-azure-card-refiner` analisa o item — contexto técnico, impacto, hipóteses
2. `oai-kit-qa-refiner` analisa os mesmos critérios de aceite — testabilidade, cenários de borda, cobertura
3. Os dois outputs são consolidados em um único comentário no Azure, com seções separadas:
   - `### Análise Técnica (Dev)`
   - `### Análise de Testabilidade (QA)`
   - `### Critérios de Aceite revisados` ← novo: CAs reescritos pelo QA já integrados
4. Gate único antes de postar o comentário consolidado

Isso não elimina o `/oai-kit-qa-refine-card` separado — que continua existindo para o QA rodar sozinho. É um modo integrado do refinamento Dev.

**Arquivos a modificar:**
- `.oai-kit/commands/developer/oai-kit-refine-card.md` — adicionar orquestração do QA refiner
- `.oai-kit/agents/developer/oai-kit-azure-card-refiner.md` — adaptar output para composição

**Complexidade:** M  
**Dependência:** nenhuma  
**Critérios de aceite:**
- Um único `/oai-kit-refine-card` produz análise técnica + testabilidade em um comentário unificado
- CAs reescritos pelo QA são claramente identificados como `[revisado-qa]`
- O Dev pode invocar `/oai-kit-refine-card --only-dev` para rodar apenas o agente Dev (compatibilidade)

---

### F2.3 — Agente `/oai-kit-onboard-dev`

**Motivação:** `/oai-kit-bootstrap-repo` gera o Speckit inicial mas não existe o fluxo para um dev novo que chega em um repo que *já tem* o kit configurado e o Speckit populado. Esse dev perde dias descobrindo o que já está documentado.

**O que fazer:**

Novo agente `oai-kit-onboard-dev` que lê o estado atual do repo e gera um briefing personalizado:

**Etapa 1 — Coleta de contexto:**
- Lê `.speckit/domain/system-overview.md`
- Lê `.speckit/architecture/risk-map.md`
- Lê `.speckit/known-issues/` completo
- Lê `.speckit/known-issues/anti-patterns.md`
- Lê `metrics-feed.jsonl` (se existir) para identificar módulos mais problemáticos
- Pergunta ao dev: *"Qual é o seu perfil principal (Dev/QA/PO)? Há algum módulo específico que você vai trabalhar primeiro?"*

**Etapa 2 — Gerar briefing personalizado:**

```markdown
# Onboarding — {Nome do Sistema}

## O que este sistema faz
[resumo do system-overview em 3-5 linhas]

## Onde você vai trabalhar
Módulo: {módulo informado pelo dev}
- Arquivos principais: [lista]
- Regras de negócio que você PRECISA conhecer: [lista das RNs do módulo]
- Bugs conhecidos neste módulo: [lista dos KIs relevantes]
- Nível de risco: [high/medium/low] — [justificativa]

## Anti-patterns críticos (evite isso)
[top 3 anti-patterns mais relevantes para o módulo]

## Primeiros comandos para usar
1. Para pegar um bug: `/oai-kit-analyze-bug {ID}`
2. Para pegar uma feature: `/oai-kit-feature {ID}`
3. Para entender uma task antes do refinamento: `/oai-kit-refine-card {ID}`

## Histórico recente do módulo
[últimos 5 tickets concluídos com o kit — se metrics-feed existir]
```

**Arquivos a criar:**
- `.oai-kit/agents/developer/oai-kit-onboard-dev.md`
- `.oai-kit/commands/shared/oai-kit-onboard-dev.md`
- Atualizar tabelas em `.oai-kit/oai-kit.md` e `.claude/oai-kit.md`

**Complexidade:** M  
**Dependência:** Speckit bem populado (não depende de F1.1, mas fica melhor com ele)  
**Critérios de aceite:**
- Um dev novo consegue entender o sistema e seus riscos sem ler nenhum arquivo manualmente
- O briefing é gerado em menos de 2 minutos (sem perguntas desnecessárias)
- O conteúdo é específico ao módulo informado, não genérico

---

### F2.4 — Retrospectiva de incidente automática

**Motivação:** Bug em produção rastreado a um PR recente é o cenário mais custoso. Hoje o dev abre uma post-mortem do zero, sem template, sem rastreabilidade automática para o ticket original. O aprendizado se perde.

**O que fazer:**

Novo agente `oai-kit-incident-retro` ativado por `/oai-kit-incident {ID_DO_BUG_OU_PR}`:

**Etapa 1 — Rastreamento:**
- Busca o item no Azure via MCP (pode ser uma task de bug ou o número do PR)
- Navega a hierarquia para encontrar o PR que introduziu o problema
- Lê o artifact `.oai-flow/analysis/{ID}-bugreport.md` se existir
- Lê o diff do PR (via MCP) para identificar os arquivos alterados

**Etapa 2 — Gerar post-mortem pré-preenchido:**

```markdown
## Post-Mortem — Incidente #{ID}

**Data do incidente:** {data}
**Severidade:** [preencher]
**Sistemas afetados:** {módulos do PR}

### Timeline
| Evento | Timestamp |
|--------|-----------|
| PR mergeado | {data do merge} |
| Incidente reportado | {data} |
| Root cause identificado | [preencher] |
| Fix publicado | [preencher] |

### Root cause
[extraído do BugReport se existir; caso contrário: campo em branco com instrução]

### Commit causador
`{hash}` — {mensagem do commit}
**Arquivos alterados:** {lista}

### Impacto
[blast radius estimado pelo impact-analyzer na época, se artifact existir]

### O que falhou no processo
- O teste que teria capturado isso: [sugestão baseada no tipo de bug]
- Checkpoint que poderia ter detectado: [baseado no tipo de mudança]

### Ações preventivas
- [ ] [sugestão 1 — específica ao tipo de falha]
- [ ] [sugestão 2]

### Atualização do Speckit
- [ ] Adicionar em known-issues: [descrição do padrão]
- [ ] Adicionar em anti-patterns: [o que evitar]
```

**Etapa 3 — Gate e publicação:**
- Exibe o draft completo
- Gate: posso salvar em `.oai-flow/delivery/{ID}-postmortem.md` e postar como comentário no Azure? (sim/não)
- Se sim: salva e posta
- Pergunta: "Deseja que eu chame o `oai-kit-learning-agent` agora para atualizar o Speckit com este incidente?" (sim/não)

**Arquivos a criar:**
- `.oai-kit/agents/developer/oai-kit-incident-retro.md`
- `.oai-kit/commands/developer/oai-kit-incident.md`
- Atualizar tabelas em `.oai-kit/oai-kit.md` e `.claude/oai-kit.md`

**Complexidade:** M  
**Dependência:** nenhuma (funciona melhor com artifacts de análise anteriores)  
**Critérios de aceite:**
- Post-mortem gerado em menos de 3 minutos com contexto real do PR
- O template nunca fica completamente em branco — campos não encontrados recebem instrução explícita de preenchimento
- A sugestão de atualização do Speckit é específica, não genérica

---

### F2.5 — Speckit health check

**Motivação:** O Speckit pode ficar desatualizado sem que ninguém perceba. Uma regra de negócio que mudou há 3 meses ainda está documentada como era antes. Agentes tomam decisões com base em informação obsoleta.

**O que fazer:**

Adicionar ao `oai-kit-learning-agent` uma etapa periódica de health check. Também expor via `/oai-kit-speckit-health`:

Para cada arquivo no `.speckit/`:
1. Verificar data da última modificação vs `ultima_atualizacao` no index
2. Cruzar com o `metrics-feed.jsonl`: tickets dos últimos 90 dias que tocaram módulos cobertos por essa seção do Speckit
3. Sinalizar como `stale` se: mais de 90 dias sem atualização E houve tickets no módulo no período

Output:

```
Speckit Health Check — 2026-07-14
══════════════════════════════════
✅ domain/system-overview.md — atualizado em 2026-06-20 (24 dias)
✅ architecture/risk-map.md — atualizado em 2026-05-15 (60 dias)
⚠️  known-issues/known-issues.md — 95 dias sem atualização
    └─ 3 tickets de hotfix no módulo FLP neste período
⚠️  business-rules/regras-frete.md — 102 dias sem atualização
    └─ SIM 961234 alterou lógica de frete em junho — seção pode estar desatualizada
❌  decisions/ADR-002.md — 180 dias sem atualização (CRÍTICO)
```

**Arquivos a modificar:**
- `.oai-kit/agents/developer/oai-kit-learning-agent.md` — adicionar etapa de health check
- `.oai-kit/commands/shared/oai-kit-update-speckit.md` — adicionar health check ao início

**Complexidade:** P  
**Dependência:** F1.1 (para o cruzamento com tickets recentes ser possível)  
**Critérios de aceite:**
- Health check executável via comando, sem precisar invocar o learning-agent completo
- Arquivos `stale` identificados com o motivo específico (não apenas "velho")
- Status crítico (>120 dias) diferenciado visualmente do status de aviso

---

## Fase 3 — Inovação e diferencial competitivo *(longo prazo)*

> Estes itens dependem das Fases 1 e 2 como base. São o que distingue o kit de qualquer ferramenta comercial disponível hoje.

---

### F3.1 — Debate entre agentes para decisões arquiteturais

**Motivação:** O `oai-kit-architecture-agent` hoje é chamado condicionalmente e dá uma opinião. Pesquisas com SWE-bench e Devin mostram que múltiplas perspectivas independentes aumentam precisão em 30-40% em decisões de design.

**O que fazer:**

Para tickets com impacto arquitetural (detectado pelo impact-analyzer como risco `alto` ou `crítico`), o `/oai-kit-generate-fix` passa a orquestrar um debate antes de gerar o patch:

**Rodada 1 — Proposta:**
- `oai-kit-builder-agent` gera a proposta de solução (sem implementar ainda)

**Rodada 2 — Análise independente (paralela):**
- `oai-kit-architecture-agent` — valida contra ADRs e policies
- `oai-kit-devil-advocate` (novo) — tenta refutar a proposta: "por que isso vai falhar?"

**Rodada 3 — Síntese:**
- Um agente de síntese consolida os dois feedbacks e propõe ajustes à solução original
- Gate de plano exibe: proposta original + críticas + solução ajustada
- Dev aprova ou pede nova rodada

Este fluxo só é ativado quando impact-analyzer classifica risco como `alto` ou `crítico`. Para patches simples, o fluxo padrão continua.

**Arquivos a criar/modificar:**
- `.oai-kit/agents/developer/oai-kit-devil-advocate.md` (novo)
- `.oai-kit/commands/developer/oai-kit-generate-fix.md` — adicionar lógica condicional de debate
- `.oai-kit/agents/developer/oai-kit-impact-analyzer.md` — garantir que risco é sempre classificado

**Complexidade:** G  
**Dependência:** F2.1 (index do Speckit melhora muito a qualidade do debate)  
**Critérios de aceite:**
- Debate só ativa para risco alto/crítico — sem overhead em tickets simples
- Os dois agentes (architecture + devil-advocate) têm prompts independentes que não se influenciam
- A síntese sempre produz uma proposta ajustada, não "escolhe um lado"

---

### F3.2 — Estimativa calibrada com histórico do time

**Motivação:** POs estimam sizing (P/M/G) baseados em experiência subjetiva. Nenhuma ferramenta de AI considera o histórico real *daquele time*, *naquele módulo*, *com aquele tipo de ticket*.

**O que fazer:**

Após F1.1 ter acumulado dados por 60+ dias, adicionar ao `oai-kit-po-refine-card` uma etapa de estimativa calibrada:

1. Ao classificar o sizing, buscar no `metrics-feed.jsonl` tickets similares:
   - Mesmo módulo
   - Mesmo tipo (bug/feature/hotfix)
   - Sizing similar ao estimado pelo PO

2. Apresentar ao PO:

```
Estimativa sugerida: M
Histórico do time para tickets similares (FLP, feature, M):
  • SIM 951200 — estimado M, concluído em 3 dias
  • SIM 944800 — estimado M, concluído em 5 dias (bloqueio externo)
  • SIM 938100 — estimado M, concluído em 2 dias
Média histórica: 3,3 dias
Desvio: SIM 944800 teve bloqueio de API externa (registrado no handoff)

Deseja ajustar o sizing com base nesse histórico?
```

**Arquivos a modificar:**
- `.oai-kit/agents/po/oai-kit-po-refine-card.md` — adicionar etapa de lookup histórico
- `oai-kit-learning-agent.md` — garantir que sizing real (tempo de conclusão) é registrado no metrics-feed

**Complexidade:** G  
**Dependência:** F1.1 com pelo menos 60 dias de dados acumulados  
**Critérios de aceite:**
- Estimativa só é apresentada quando há ao menos 3 tickets similares no histórico
- Se não há histórico suficiente, o agente informa explicitamente em vez de omitir
- O PO pode ignorar o histórico sem que o agente insista

---

### F3.3 — Release notes automáticas para stakeholders

**Motivação:** Após cada release, alguém precisa escrever um resumo para stakeholders não-técnicos. Isso é feito manualmente, com linguagem técnica, tarde e incompleto. POs e gestores não conseguem responder "o que foi entregue essa semana?"

**O que fazer:**

Novo agente `oai-kit-release-notes` ativado por `/oai-kit-release-notes {sprint|periodo}`:

1. Busca no Azure todos os tickets mergeados no período (via MCP)
2. Para cada ticket, extrai: título da US, módulo, SIM/PSE, tipo (bug/feature)
3. Agrupa por módulo e tipo
4. Gera dois formatos:

**Formato técnico** (para o time):
```
## Release — Sprint 42 (2026-07-01 a 2026-07-14)

### FLP — Frete e Logística
- ✅ [SIM 951200] Correção no cálculo de frete para zonas especiais
- ✅ [SIM 944800] Nova integração com transportadora XYZ

### ESO — Estoque
- ✅ [PSE 78001] Relatório de inventário por categoria
```

**Formato executivo** (para stakeholders):
```
## O que foi entregue — 1ª quinzena de julho

**Frete:** Corrigimos um erro que afetava clientes de zonas especiais.
Adicionamos suporte a uma nova transportadora parceira.

**Estoque:** Gestores agora podem exportar relatórios de inventário
agrupados por categoria de produto.

Total: 3 entregas | 0 incidentes neste período
```

5. Gate: posso salvar o release notes em `.oai-flow/delivery/release-notes-{periodo}.md`? (sim/não)

**Arquivos a criar:**
- `.oai-kit/agents/developer/oai-kit-release-notes.md`
- `.oai-kit/commands/shared/oai-kit-release-notes.md`
- `.oai-kit/knowledge/po/release-notes-template.md` — templates dos dois formatos

**Complexidade:** M  
**Dependência:** F1.1 (tickets bem rastreados no metrics-feed)  
**Critérios de aceite:**
- O formato executivo não contém jargão técnico (IDs de arquivo, nomes de classe, etc.)
- Funciona mesmo sem o metrics-feed — buscando diretamente no Azure via MCP
- O período é flexível: sprint, semana, quinzena, mês

---

### F3.4 — `oai-kit-coach` — padrões de comportamento do time

**Motivação:** Nenhuma ferramenta de AI para devs olha para o *padrão de trabalho do time* e sugere melhorias proativamente. O coach faz o que um tech lead experiente faz: percebe antes de virar problema.

**O que fazer:**

Novo agente `oai-kit-coach` ativado por `/oai-kit-coach` (rodado semanalmente pelo tech lead):

Lê `metrics-feed.jsonl` e identifica padrões:

**Padrões detectáveis:**
- `hotfix_cluster`: 3+ hotfixes no mesmo módulo em 30 dias → sugere ticket de refactor
- `qa_retorno_frequente`: PR com review reprovado 2+ vezes pelo mesmo motivo → sugere treinamento ou checklist
- `overrun_sizing`: tickets M que levam mais de 5 dias → reavaliação de critérios de sizing
- `speckit_stale_on_incident`: bug em módulo com Speckit desatualizado → prioriza health check
- `checkpoint_skipping`: agente registrou gate pulado (se detectável via metrics) → alerta

**Output:**

```
OAI Kit Coach — Relatório Semanal (2026-07-14)
═══════════════════════════════════════════════

🔴 ATENÇÃO — Módulo FLP
   3 hotfixes em 28 dias (SIM 951200, 952100, 953400)
   Padrão: todos envolvem a classe FreteCalculator.cs
   Sugestão: abrir task de refactor preventivo antes do próximo hotfix

🟡 SIZING — Tickets M com overrun
   SIM 944800 e SIM 948100 estimados M, concluídos com +3 dias cada
   Padrão: ambos envolviam integração com API externa
   Sugestão: tickets com integração externa → sizing G por padrão

🟢 SEM PROBLEMAS
   Módulos ESO, GBW: ciclos dentro do esperado
```

**Arquivos a criar:**
- `.oai-kit/agents/_shared/oai-kit-coach.md`
- `.oai-kit/commands/shared/oai-kit-coach.md`

**Complexidade:** G  
**Dependência:** F1.1 com 30+ dias de dados  
**Critérios de aceite:**
- Coach identifica no mínimo os 4 padrões listados acima
- Cada alerta inclui evidências específicas (IDs dos tickets), não apenas afirmações gerais
- O relatório é acionável: cada ponto termina com uma sugestão concreta

---

## Tabela de prioridades

| Item | Fase | Complexidade | Dependências | Impacto |
|------|------|-------------|--------------|---------|
| F1.1 — metrics-feed.jsonl | 1 | P | nenhuma | ⭐⭐⭐⭐⭐ |
| F1.3 — /oai-kit-handoff | 1 | M | nenhuma | ⭐⭐⭐⭐⭐ |
| F1.5 — PR comments via MCP | 1 | P | nenhuma | ⭐⭐⭐⭐ |
| F1.4 — Cursor adapter real | 1 | M | nenhuma | ⭐⭐⭐⭐ |
| F1.2 — Git hook pós-merge | 1 | M | F1.1 | ⭐⭐⭐⭐ |
| F2.2 — QA shift-left | 2 | M | nenhuma | ⭐⭐⭐⭐⭐ |
| F2.3 — /oai-kit-onboard-dev | 2 | M | Speckit populado | ⭐⭐⭐⭐ |
| F2.4 — Retrospectiva incidente | 2 | M | nenhuma | ⭐⭐⭐⭐ |
| F2.5 — Speckit health check | 2 | P | F1.1 | ⭐⭐⭐ |
| F2.1 — Speckit index JSON | 2 | G | learning-agent | ⭐⭐⭐⭐ |
| F3.3 — Release notes | 3 | M | F1.1 | ⭐⭐⭐⭐ |
| F3.1 — Debate entre agentes | 3 | G | F2.1 | ⭐⭐⭐⭐ |
| F3.2 — Estimativa histórica | 3 | G | F1.1 (60 dias) | ⭐⭐⭐⭐ |
| F3.4 — oai-kit-coach | 3 | G | F1.1 (30 dias) | ⭐⭐⭐⭐⭐ |

---

## O que fazer primeiro (sequência recomendada)

```
Semana 1-2:
  F1.1 — metrics-feed.jsonl       ← base de tudo
  F1.3 — /oai-kit-handoff         ← dor imediata, independente
  F1.5 — PR comments via MCP      ← pequeno, alto retorno

Semana 3-4:
  F1.4 — Cursor adapter           ← amplia alcance do kit
  F2.2 — QA shift-left            ← muda o ciclo, sem pré-req
  F2.4 — Retrospectiva incidente  ← independente, fecha o loop

Semana 5-6:
  F1.2 — Git hook pós-merge       ← depende de F1.1 estar rodando
  F2.3 — /oai-kit-onboard-dev     ← Speckit já terá dados reais
  F2.5 — Speckit health check     ← F1.1 já acumulou dados

Mês 2+:
  F2.1 — Speckit index JSON       ← requer mais esforço, mais impacto
  F3.3 — Release notes            ← F1.1 com dados suficientes
  F3.4 — oai-kit-coach            ← F1.1 com 30+ dias
  F3.1 — Debate entre agentes     ← após F2.1
  F3.2 — Estimativa histórica     ← F1.1 com 60+ dias
```

---

## Pendências de versões anteriores (não esquecer)

- [ ] `git rm --cached praxio-onboardingai-kit-1.0.0.tgz planejamento.md` — arquivos já commitados que devem ser removidos do tracking
- [ ] Deletar `po-refinamento-card.md` e `po-discovery.md` da raiz — arquivos de referência incorporados nas melhorias M1/M2
- [ ] Publicar npm v2.0.0 — versão atual do kit ainda não publicada
- [ ] Ativar profile PO no `oai-kit.yaml` — agentes PO não estão em `.claude/agents/` ainda

---

*Documento mantido por: leandro.peres@nstech.com.br*
*Próxima revisão sugerida: após conclusão da Fase 1*
