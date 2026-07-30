# /oai-kit-registrar-gap

Registra um GAP/HUMAN DECISION na base central `GlobusEvo.Minerva` a qualquer momento, sem rodar o fluxo de conversão inteiro. Use quando travar no meio de uma conversão manual, ou quando encontrar uma ambiguidade que não pode ser resolvida na hora.

**Uso:** `/oai-kit-registrar-gap`

## Sequência de Execução

### PASSO 0 — Sincronizar o Minerva

`git pull` obrigatório em `knowledgeBasePath` antes de qualquer leitura (política de sincronismo, ver `.oai-kit/policies/conversion-policy.md` — arquivo local do projeto, não fica no Minerva). Se falhar, pare e informe o dev — não prossiga sobre uma base desatualizada.

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

Pergunte: *"Posso registrar esse GAP em `gaps/gaps-log.md`, atualizar o índice, e subir (push) para o Azure DevOps? (sim/não)"* Se sim, faça o append (nunca sobrescreva o log), atualize `gapsAbertos` em `minerva-index.json`, commite e **sempre tente o push em seguida** (não é uma pergunta separada). Se rejeitado por non-fast-forward, tente `git pull --rebase` + push uma vez; se ainda conflitar, pare e mostre ao dev.

## Restrições Absolutas

- Nunca pule o `git pull` inicial no Minerva.
- Nunca sobrescreva `gaps-log.md` — é append-only.
- Nunca registre um GAP duplicado sem checar o índice primeiro.
- Nunca commite/push no Minerva sem aprovação explícita — mas, uma vez aprovado, sempre tente o push (commit sem push não ajuda ninguém além de você).
