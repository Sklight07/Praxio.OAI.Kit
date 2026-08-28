# Perfil conversao — Conversão Delphi → GlobusWeb

Este overview é anexado a `.claude/oai-kit.md` quando o perfil `conversao` está ativo (`oai-kit.yaml`), para que o agente saiba que esta extensão existe mesmo em sessões que não tocam nela diretamente.

## Fonte de verdade

- **`GlobusEvo.Minerva`** (repositório git próprio, compartilhado por todos os módulos GlobusWeb.*) — arquétipos, cheatsheets, padrões de backend/frontend, catálogo de reuso, descobertas de schema Oracle, métricas. Consultado por todo agente `oai-kit-conversao-*`, nunca duplicado localmente.
- **`.oai-kit/policies/conversion-policy.md`** (local, depositado por este perfil) — hard stops `AP-CONV-001` em diante. Bloqueadores absolutos, não sugestões.
- O `.speckit/` do repositório-alvo (fonte de verdade do perfil `developer` base) **não** é a fonte de verdade para conversão — pode estar desatualizado ou genérico demais para o padrão GraphQL decorator-driven específico do GlobusWeb.

## Agentes

`oai-kit-conversao-{triagem,especificador,backend,guardiao,frontend,e2e,paridade,aprendizado}` — cada um com responsabilidade única, acionados em sequência pelo comando principal. Nenhum agente do perfil `conversao` deve ser substituído por um agente genérico do perfil `developer` durante o fluxo de conversão (exceção condicional documentada: `oai-kit-architecture-agent`, só em `N-ESPECIAL`, sempre com contexto AP-CONV explícito passado no prompt).

## Comando principal

`/oai-kit-converter-tela` — ver `commands/conversao/oai-kit-converter-tela.md` para a sequência completa (Triagem → Backend → Guardião de padrão → Frontend → E2E opcional → Paridade → Aprendizado).

## Padrão arquitetural (resumo — nunca substitui o arquétipo/cheatsheet real)

GraphQL decorator-driven (`NestjsQueryGraphQLModule.forFeature`) é o padrão. REST, resolver manual, transação/repository/integração manual são exceções que exigem justificativa documentada — nunca hábito ou "mais simples". Ver AP-CONV-020/021 e `backend-pattern.md`/`armadilhas-comuns.md` #92 no Minerva.
