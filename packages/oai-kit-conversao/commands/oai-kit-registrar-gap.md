# /oai-kit-registrar-gap

Registra um GAP/HUMAN DECISION na base central `GlobusEvo.Minerva` a qualquer momento, sem rodar o fluxo de conversão inteiro. Use quando travar no meio de uma conversão manual, ou quando encontrar uma ambiguidade que não pode ser resolvida na hora.

**Uso:** `/oai-kit-registrar-gap`

## Sequência de Execução

### PASSO 0 — Sincronizar o Minerva

`git pull` obrigatório em `knowledgeBasePath` antes de qualquer leitura (política de sincronismo, ver `.oai-kit/policies/conversion-policy.md` — arquivo local do projeto, não fica no Minerva). Se falhar, pare e informe o dev — não prossiga sobre uma base desatualizada.

### PASSO 1 — Triagem: isso é genuinamente um GAP?

**Antes de coletar qualquer coisa**, aplique o critério de `.oai-kit/policies/conversion-policy.md` ("Critério de GAP"): isso exige que alguém tome uma decisão/ação futura para desbloquear algo, ou é só uma nota de que um dado estava errado e já foi contornado (ex.: índice de menu divergente na task, mas o valor correto já foi usado; SIM/PSE ausente, mas a convenção de branch com ID da Task já resolveu)?

- **Se for só uma nota de dado já contornado ou convenção já seguida** → **não registre**. Explique ao dev por que isso não é um GAP e sugira, se ele quiser manter o registro, anotar no output da conversão em andamento (`.oai-flow/delivery/`) em vez de `gaps-log.md`.
- **Se for uma decisão/ação genuinamente pendente** → prossiga para coletar:
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
- Nunca registre um GAP que não passe o teste do PASSO 1 — dado do Azure já corrigido/contornado ou convenção de processo já seguida corretamente não são GAP (ver "Critério de GAP" em `conversion-policy.md`).
- Nunca commite/push no Minerva sem aprovação explícita — mas, uma vez aprovado, sempre tente o push (commit sem push não ajuda ninguém além de você).
