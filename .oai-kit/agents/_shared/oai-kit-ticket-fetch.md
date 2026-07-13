# Shared: Task Context Protocol — OAI Kit

Protocolo reutilizado por todos os agentes que precisam buscar dados de tasks do Azure DevOps.

## Contexto da Hierarquia Praxio

As tasks no Azure seguem a estrutura:
```
EPIC (ou FEATURE)
  └── FEATURE (ou USER STORY)
        └── USER STORY
              ├── Task Dev (lançamento de horas)
              ├── Task QA
              ├── Task Fechamento Dev
              └── Task Fechamento QA
```

O SIM/PSE (ex: `SIM 954783`) é o ticket do sistema SAC externo e está registrado no conteúdo da FEATURE ou USER STORY — não é o ID do Azure.

## Processo de Busca

### 1. Buscar a task pelo ID Azure fornecido

```
mcp__azure-devops__wit_get_work_item(id: {ID})
```

Se MCP indisponível → `az boards work-item show --id {ID} --org https://dev.azure.com/{org}`

Se CLI também indisponível → solicite ao dev que cole o conteúdo da task.

### 2. Navegar para a hierarquia completa

Após buscar a task principal, busque:
- **Parents** (FEATURE, EPIC acima) para obter o contexto da solicitação SIM/PSE e mais contexto de negócio.
- **Children** (tasks filhas: dev, QA, fechamento) para identificar a task de fechamento de desenvolvimento quando necessário.

Use `mcp__azure-devops__wit_get_work_item_relations` ou `mcp__azure-devops__wit_get_work_items_batch` para navegar a hierarquia.

### 3. Extrair informações SIM/PSE

Procure no título, descrição ou campos customizados da FEATURE/USER STORY por padrões como:
- `SIM 954783` / `SIM_954783`
- `PSE 79548` / `PSE_79548`

Se não encontrar automaticamente, pergunte ao dev: "Qual o tipo (SIM/PSE) e número da solicitação?"

### 4. Identificar task de fechamento de desenvolvimento

A task de fechamento de dev é uma task filha da USER STORY ou FEATURE, tipicamente com "fechamento" ou "fechamento dev" no nome. Use para preencher ao final da implementação.

### 5. Detectar sinais de múltiplos repositórios

Durante a leitura da hierarquia, observe sinais que indicam envolvimento de mais de um repositório:
- Menção a "frontend", "backend", "API", "app mobile", "portal", "lib compartilhada" no contexto da task.
- Referência a contratos, DTOs ou interfaces que podem estar em outro repo.
- Módulos distintos com stacks diferentes (ex: backend .NET + frontend React separados).

Se detectar esses sinais, registre em `relatedRepos` no JSON de saída. O agente que consumir esses dados decidirá se precisa solicitar os caminhos locais ao dev.

### 6. Lidar com Anexos

Após buscar a task e navegar a hierarquia, verifique se há anexos em qualquer task encontrada (US, FEATURE, EPIC).

**Se não houver anexos em nenhuma task da hierarquia:** continue normalmente — não pergunte sobre anexos ao usuário.

**Se houver anexos:**
1. Tente acessar cada anexo via MCP.
2. Se conseguir ler → inclua o conteúdo no contexto.
3. Se **não** conseguir (qualquer motivo: timeout, permissão negada, tipo não suportado, MCP indisponível):

```
⚠️ ANEXO NÃO ACESSÍVEL — aguardando ação do usuário
═══════════════════════════════════════════
Encontrei o(s) seguinte(s) anexo(s) na task #<ID> que não foi(ram) possível(is) ler:
  • <nome do arquivo>
  • <nome do arquivo 2> (se houver mais)

Para continuar com o contexto completo, escolha:
  a) Cole o conteúdo do anexo diretamente na conversa
  b) Informe o caminho local do arquivo no seu sistema
  c) "não tenho anexo para fornecer" — continuar sem o conteúdo do anexo
═══════════════════════════════════════════
```

⚡ **PARADA OBRIGATÓRIA — Aguarde resposta antes de prosseguir.**

- Se fornecer conteúdo ou caminho → inclua no contexto e continue.
- Se disser "não tenho anexo para fornecer" → continue sem o conteúdo e registre `"status": "not_accessible"` no campo `attachments` do JSON de saída.
- Nunca assuma o conteúdo de um anexo — use apenas o que foi lido com sucesso ou fornecido explicitamente.

## Cache

Se `.oai-flow/analysis/{ID}-ticket.json` existir com menos de 24h → use o cache.

## Formato de Saída Normalizado

Grave em `.oai-flow/analysis/{ID}-ticket.json`:
```json
{
  "azure_task_id": 54841,
  "type": "User Story",
  "title": "...",
  "description": "...",
  "acceptance_criteria": "...",
  "sim_pse": { "type": "SIM", "number": "94457" },
  "module_sigla": null,
  "parent_feature_id": 54840,
  "parent_feature_title": "...",
  "closure_task_id": 54843,
  "relatedRepos": ["Frontend", "SharedLib"],
  "attachments": [
    { "name": "especificacao.pdf", "status": "read" }
  ],
  "fetched_at": "ISO-8601"
}
```

- `module_sigla` é sempre `null` na busca — o agente deve perguntar ao dev se precisar criar branch ou commit.
- `relatedRepos` lista nomes de repos detectados no contexto da task. Pode ser vazio `[]` quando não há sinais de multi-repo.
- `attachments` lista os anexos encontrados. Status possíveis: `"read"` (lido com sucesso), `"not_accessible"` (tentou, não conseguiu — usuário disse "não tenho"), `"user_provided"` (conteúdo fornecido manualmente pelo usuário). Campo omitido ou vazio quando não há anexos.
