# Guia do Dev — OAI Kit

Bem-vindo ao **praxio-oai-kit**. Este guia cobre o que você precisa saber para usar o kit no dia a dia.

## O que é este kit?

Um framework de IA para devs da Praxio que:
- **Refina cards** do Azure DevOps com contexto técnico real do código.
- **Investiga bugs** com root cause baseada em evidências de código.
- **Gera patches mínimos** com testes RED→GREEN.
- **Abre PRs** com descrição completa e rollback plan.
- **Aprende** com cada ticket, melhorando o Speckit progressivamente.

## Instalação em um Novo Repositório

```bash
# 1. Instale o kit
npx praxio-oai-kit init

# 2. Configure o Azure DevOps
npx praxio-oai-kit setup-mcp

# 3. Faça o onboarding do repositório
# (dentro do Claude Code)
/bootstrap-repo NOME_DO_SISTEMA
```

## Comandos do Dia a Dia

### Refinar um card antes de pegar
```
/refine-card ADO-842
```
O kit lê o card no ADO, analisa o código do repositório e adiciona contexto técnico: arquivos a alterar, riscos, estimativa.

### Trabalhar em um bug
```
/analyze-bug ADO-842       # investiga root cause
# → revise o BugReport e aprove
/generate-fix ADO-842      # gera o patch
# → revise o patch e aprove
/run-regression ADO-842    # valida testes
/open-pr ADO-842           # cria o PR
# → aguarde aprovação no ADO
/release-check ADO-842     # verifica gates + autoriza deploy
```

### Trabalhar em uma feature
```
/feature ADO-901
```
O kit auto-dimensiona pelo tamanho e guia todo o fluxo.

### Atualizar o Speckit (semanal recomendado)
```
/update-speckit
```

## O que é o Speckit?

A pasta `.speckit/` é a **memória institucional do sistema**. Ela contém:
- Módulos e integrações (`domain/system-overview.md`)
- Bugs já vistos e seus fixes (`known-issues/known-issues.md`)
- Padrões a evitar (`known-issues/anti-patterns.md`)
- Hotspots de risco (`architecture/risk-map.md`)
- Regras de negócio (`business-rules/`)

O Speckit melhora automaticamente a cada ticket encerrado via o `learning-agent`.

## Configuração Local

O arquivo `.claude/.local-config.json` (gitignored) contém suas configurações pessoais:
- `localAppsRoot`: onde seus projetos ficam localmente
- `briefingDir`: onde os briefings de cards são salvos
- Credenciais do Azure DevOps

Para reconfigurar: `npx praxio-oai-kit setup-mcp`

## Dúvidas?

Procure o responsável pelo kit ou abra um card no ADO com a tag `oai-kit`.
