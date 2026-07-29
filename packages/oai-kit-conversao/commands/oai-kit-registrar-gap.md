# /oai-kit-registrar-gap

Registra um GAP/HUMAN DECISION na base central `GlobusEvo.Minerva` a qualquer momento, sem rodar o fluxo de conversão inteiro. Use quando travar no meio de uma conversão manual, ou quando encontrar uma ambiguidade que não pode ser resolvida na hora.

**Uso:** `/oai-kit-registrar-gap`

## Sequência de Execução

### PASSO 1 — Coletar o GAP

Pergunte ao dev (se não tiver sido dito já):
- Módulo/tela envolvida.
- Descrição do GAP (o que não pôde ser decidido/resolvido agora).
- Por que não pode ser resolvido pontualmente (risco a outros módulos? decisão de arquitetura? decisão de negócio?).

### PASSO 2 — Consultar o índice

Leia `{knowledgeBasePath}/minerva-index.json` para checar se um GAP equivalente já foi registrado — não duplique.

### PASSO 3 — Gate Pré-Commit no Minerva

```
═══════════════════════════════════════════
GAP A REGISTRAR EM GlobusEvo.Minerva
═══════════════════════════════════════════
Módulo: [sigla]
Descrição: [...]
Motivo (não resolvível pontualmente): [...]
═══════════════════════════════════════════
```

Pergunte: *"Posso registrar esse GAP em `gaps/gaps-log.md` e atualizar o índice? (sim/não)"* Se sim, faça o append (nunca sobrescreva o log) e atualize `gapsAbertos` em `minerva-index.json`. Pergunte separadamente antes de dar push (repositório compartilhado).

## Restrições Absolutas

- Nunca sobrescreva `gaps-log.md` — é append-only.
- Nunca registre um GAP duplicado sem checar o índice primeiro.
- Nunca commite/push no Minerva sem aprovação explícita.
