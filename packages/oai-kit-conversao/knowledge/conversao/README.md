# Knowledge — Perfil Conversão

Esta pasta **não contém** a base de conhecimento de conversão em si — ela vive centralizada e versionada em `GlobusEvo.Minerva`, compartilhada por todos os módulos `GlobusWeb.*` (Folha, Acidentes, Manutenção, Trafego, etc.), para que o que é aprendido convertendo uma tela num módulo beneficie a conversão em qualquer outro módulo.

## Onde está a base real

O caminho local do `GlobusEvo.Minerva` clonado é configurado em `.claude/.local-config.json`, chave `conversao.knowledgeBasePath`, preenchida pelo wizard de `npx praxio-oai-kit-conversao init`.

```
GlobusEvo.Minerva/
  minerva-index.json      — índice único, consultado primeiro por qualquer agente
  archetypes/              — receitas de conversão por arquétipo de tela
  cheatsheets/              — Delphi→NestJS, Delphi→React, armadilhas conhecidas
  catalogo-reuso/           — componentes/hooks/services já prontos, para nunca recriar
  descobertas-oracle/       — cache de tabelas/procedures Oracle já descritas
  gaps/                     — GAPs/HUMAN DECISIONs não resolvíveis pontualmente
  modulos/                  — notas específicas por módulo GlobusWeb
  metrics/                  — conversoes.jsonl, para calibrar estimativas futuras
```

## Se o path não estiver configurado

Os agentes de conversão (`oai-kit-conversao-triagem` em diante) perguntam ao dev na Etapa 0 e oferecem salvar em `.claude/.local-config.json` — nunca assumem um caminho, e nunca duplicam o conteúdo do Minerva localmente neste repositório.

## Por que centralizado, e não por repositório

Um `.oai-kit/knowledge/conversao/` por módulo (como QA e PO já fazem hoje para suas próprias bases) faria cada módulo GlobusWeb redescobrir os mesmos arquétipos, armadilhas e tabelas Oracle já resolvidos em outro módulo — exatamente o problema que motivou este perfil. Por isso a base real é um repositório git próprio (`GlobusEvo.Minerva`), não uma pasta local por repo.
