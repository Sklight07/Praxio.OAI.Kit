# /oai-kit-feature

Fluxo de desenvolvimento de feature. Auto-dimensionado por complexidade.

**Uso:** `/oai-kit-feature {ID_AZURE_TASK}`

O `{ID_AZURE_TASK}` é o ID da USER STORY ou FEATURE no Azure DevOps.

## Sizing

| Tamanho | Critério | Fluxo |
|---------|---------|-------|
| Small (S) | < 4h, 1 módulo, sem banco | CP1 + Execute direto |
| Medium (M) | 4–16h, até 3 módulos | CP1 → Execute |
| Large (L) | > 16h ou múltiplos módulos com dependências | CP1 → Plano → CP2 → Execute |

## Sequência de Execução

### PASSO 1 — Buscar contexto completo

Execute `_shared/oai-kit-ticket-fetch.md`:
- Busca a task e navega a hierarquia (parents e children)
- Lê comentários, documentos e análise de refinamento (se disponível)
- Extrai SIM/PSE e contexto de negócio

### PASSO 2 — Especificação e sizing

Consulte `.speckit/` para contexto relevante e apresente ao dev:

```
═══════════════════════════════════════════
ESPECIFICAÇÃO — aguardando aprovação do escopo
═══════════════════════════════════════════
Entendimento: [o que foi solicitado em linguagem técnica]

Arquivos a criar/alterar:
  • [caminho/arquivo] — [motivo]
  • ...

Sizing: S / M / L
Justificativa: [por quê]

Riscos identificados: [lista ou "nenhum"]
Dependências: [lista ou "nenhuma"]
═══════════════════════════════════════════
```

### ⚡ CHECKPOINT 1 — ESCOPO APROVADO

⚡ **PARADA OBRIGATÓRIA — Não avance sem resposta explícita.**

Pergunte: *"O entendimento e o escopo estão corretos? Posso prosseguir? (sim/não)"*

- Só avance após resposta explícita de aprovação.
- Se o dev ajustar o escopo → revise e confirme novamente.
- Silêncio não é aprovação.

### PASSO 3 — Plano de tasks (apenas L)

Se Large: decomponha em tasks atômicas com dependências. Apresente ao dev com estimativas e ordem de execução.

### ⚡ CHECKPOINT 2 — PLANO APROVADO (apenas L)

⚡ **PARADA OBRIGATÓRIA.**

Pergunte: *"O plano de tasks está correto? Posso iniciar a implementação? (sim/não)"*

Só avance após aprovação explícita.

### PASSO 4 — Execute

Para cada task, o `oai-kit-builder-agent`:
1. Coleta sigla do módulo e dados para commit (se não informados, pergunta ao dev uma vez)
2. Propõe branch no padrão Praxio
3. **Exibe plano da task e aguarda aprovação explícita antes de escrever código**
4. RED → GREEN → VERIFY
5. **Exibe Gate Pré-Commit (arquivos alterados + mensagem) e aguarda aprovação explícita antes de commitar**
6. Commit no formato: `feat: SIGLA_SIM_NUMERO #{ID_US}\n\ndesc\n\nUS: #{ID_FEATURE}`
7. Discoveries fora do escopo → Deferred

> O builder-agent NUNCA escreve código ou commita sem confirmação explícita do dev em cada um desses gates. Isso vale para features Small, Medium e Large.

### ⚡ GATE PÓS-IMPLEMENTAÇÃO (antes de prosseguir para PR)

Após concluir todas as tasks do PASSO 4, exiba um resumo completo:

```
═══════════════════════════════════════════
IMPLEMENTAÇÃO CONCLUÍDA — aguardando autorização para abrir PR
═══════════════════════════════════════════
Commits realizados:
  • [hash curto] feat: SIGLA_SIM_NUMERO #ID — [descrição]
  • [hash curto] feat: SIGLA_SIM_NUMERO #ID — [descrição] (se houver mais)

Arquivos alterados no total:
  • [arquivo1] — [o que mudou]
  • [arquivo2] — [o que mudou]

Items Deferred (fora do escopo, não implementados):
  • [item] ou "nenhum"
═══════════════════════════════════════════
```

⚡ **PARADA OBRIGATÓRIA.**

Pergunte: *"A implementação está completa e correta? Posso prosseguir com regressão e PR? (sim/não)"*

Só avance para PASSO 5 após aprovação explícita.

### PASSO 5 — PR e fechamento de dev

`/oai-kit-run-regression {ID}` → `/oai-kit-open-pr {ID}`

O `oai-kit-pr-generator` exibe a prévia do PR (título + descrição) e aguarda aprovação antes de criar no Azure.

### PASSO 6 — Release

`/oai-kit-release-check {ID}` → oai-kit-learning-agent → task fechada no Azure.
