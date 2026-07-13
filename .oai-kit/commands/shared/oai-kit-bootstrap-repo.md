# /oai-kit-bootstrap-repo

Onboarding completo de um repositório — gera o Speckit inicial e documenta o sistema.

**Uso:** `/oai-kit-bootstrap-repo NOME_DO_SISTEMA [--stack dotnet|node|react]`

## Sequência de Execução

### PASSO 1 — Gap Analysis
Verifique o que já existe:
- `.speckit/` já populado? Se sim, pergunte se quer atualizar ou criar do zero.
- `ARCHITECTURE.md` existe? `README.md` atualizado?

### PASSO 2 — Reconhecimento do Repositório
Execute análise estática via `scripts/bootstrap-speckit.sh` (ou equivalente):
- Estrutura de pastas (3 níveis)
- Extensões e manifests (*.csproj, package.json, angular.json)
- Hotspots do git (arquivos mais modificados)
- TODOs/FIXMEs/HACKs
- SQL concatenado, catches vazios, credenciais suspeitas
- Connection strings e endpoints (sem expor valores)

### PASSO 3 — Repositórios Relacionados (opcional)

Pergunte ao dev:

> *"Este repositório tem projetos complementares que fazem parte do mesmo sistema? (ex: um frontend separado, uma lib de contratos compartilhados, um serviço de integração)"*

Se sim:
1. Colete nome, caminho local e papel de cada repo relacionado (ex: `Frontend — C:\Projetos\App.Frontend — SPA React`).
2. Realize análise estática superficial em cada repo relacionado (estrutura de pastas, stack, manifests) se o caminho for fornecido.
3. Ofereça adicionar os repos a `knownRepos` em `.claude/.local-config.json` para uso futuro pelos agentes.
4. Inclua as informações na seção "Repositórios Relacionados" do `system-overview.md`.

Se não → prossiga normalmente.

### PASSO 4 — Popular Speckit
Gere ou atualize:
- `.speckit/domain/system-overview.md` (incluindo seção de repos relacionados se identificados)
- `.speckit/domain/naming-guide.md`
- `.speckit/domain/diagnostic-guide.md`
- `.speckit/architecture/architecture-overview.md`
- `.speckit/architecture/risk-map.md`
- `.speckit/known-issues/known-issues.md`
- `.speckit/known-issues/anti-patterns.md`

Campos não inferíveis → marcados como `[DRAFT]`.

### PASSO 5 — Relatório
Informe:
- Quantos `[DRAFT]` restaram.
- Se ≥ 10 DRAFTs → sugira uma sessão de 30min com dev sênior do projeto.
- Se repos relacionados foram identificados e ainda não estão em `knownRepos` → sugira adicioná-los via `setup-mcp` ou manualmente.
- Próximos passos recomendados.
