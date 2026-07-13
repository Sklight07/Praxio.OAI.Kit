# /refine-card

Analisa e documenta uma task do Azure DevOps durante a cerimônia de refinamento. O resultado é postado como comentário na task para uso futuro na execução.

**Uso:** `/refine-card {ID_AZURE_TASK}`

O `{ID_AZURE_TASK}` é o ID da USER STORY ou FEATURE no Azure DevOps.

## Contexto de Uso

Este comando é usado **antes da sprint** na cerimônia de refinamento. O dev analisa as tasks que provavelmente entrarão na próxima sprint e documenta o entendimento técnico diretamente na task do Azure para que o dev executor já encontre a análise pronta.

## Sequência de Execução

### PASSO 1 — Invocar azure-card-refiner

O agente `azure-card-refiner`:
1. Busca a task pelo ID e navega toda a hierarquia (EPIC → FEATURE → USER STORY)
2. Lê todos os comentários, documentos e anotações
3. Extrai o contexto SIM/PSE
4. Analisa o código no `localAppsRoot` relacionado ao módulo da task
5. Gera análise técnica com: entendimento da solicitação, arquivos prováveis, riscos, estimativa, sugestões para QA

### PASSO 2 — Confirmação

Apresenta a análise ao dev para revisão antes de postar.

### PASSO 3 — Postar no Azure

Após aprovação:
- Posta como comentário na task (USER STORY ou FEATURE) via MCP
- Adiciona tag `refinado-oai`
- Salva briefing local em `briefingDir`
