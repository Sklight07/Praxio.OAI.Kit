# /oai-kit-registrar-gap

Registra um GAP/HUMAN DECISION ou um Descarte consciente na base central `GlobusEvo.Minerva` a qualquer momento, sem rodar o fluxo de conversão inteiro. Use quando travar no meio de uma conversão manual, quando encontrar uma ambiguidade que não pode ser resolvida na hora, ou quando decidir conscientemente não replicar um comportamento do legado.

**Uso:** `/oai-kit-registrar-gap`

## Sequência de Execução

### PASSO 0 — Sincronizar o Minerva

`git pull` obrigatório em `knowledgeBasePath` antes de qualquer leitura (política de sincronismo, ver `.oai-kit/policies/conversion-policy.md` — arquivo local do projeto, não fica no Minerva). Se falhar, pare e informe o dev — não prossiga sobre uma base desatualizada.

### PASSO 1 — Triagem: isso é GAP, Descarte, ou nem um nem outro?

**Antes de coletar qualquer coisa**, aplique os critérios de `.oai-kit/policies/conversion-policy.md` ("Critério de GAP" e "Critério de Descarte"):

- **Dado já contornado, convenção de processo já seguida corretamente, ou consequência estrutural já decidida** (ex.: índice de menu divergente na task mas já corrigido; SIM/PSE ausente mas a convenção de ID da Task já resolveu; lupa/browser da própria PK, substituída pelo grid embutido — AP-CONV-014/015/017) → **não registre em lugar nenhum**. Explique ao dev por que, e sugira anotar no output da conversão em andamento (`.oai-flow/delivery/`) se ele quiser manter o registro.
- **Decisão/ação genuinamente pendente** (alguém ainda precisa decidir/agir no futuro para desbloquear algo) → é **GAP** — prossiga para coletar:
  - Módulo/tela envolvida.
  - Descrição do GAP (o que não pôde ser decidido/resolvido agora).
  - Por que não pode ser resolvido pontualmente (risco a outros módulos? decisão de arquitetura? decisão de negócio?).
- **Decisão já tomada de não replicar um comportamento real do legado**, com risco/trade-off que vale documentar (ex.: falha de segurança, bug conhecido, incompatibilidade arquitetural) → é **Descarte** — prossiga para coletar:
  - Módulo/tela envolvida.
  - Origem no legado (arquivo:linha).
  - Descrição do comportamento não replicado.
  - Justificativa (por que não replicar).
  - Vínculo a mudança de padrão/arquitetura (o que substitui, se houver).
  - Risco de descartar (o que pode dar errado se a decisão estiver equivocada).

### PASSO 2 — Consultar o índice/log existente

**GAP**: leia `{knowledgeBasePath}/minerva-index.json` → `gapsAbertos` para checar se um GAP equivalente já foi registrado — não duplique.
**Descarte**: `descartes-log.md` não é indexado em `minerva-index.json` — grep direto pelo assunto em `{knowledgeBasePath}/gaps/descartes-log.md` antes de registrar.

### PASSO 3 — Gate Pré-Commit no Minerva

**Se for GAP**:
```
═══════════════════════════════════════════
GAP A REGISTRAR EM GlobusEvo.Minerva
═══════════════════════════════════════════
Módulo: [sigla]
Descrição: [...]
Motivo (não resolvível pontualmente): [...]
═══════════════════════════════════════════
```
Pergunte: *"Posso registrar esse GAP em `gaps/gaps-log.md`, atualizar o índice, e subir (push) para o Azure DevOps? (sim/não)"* Se sim, faça o append (nunca sobrescreva o log), atualize `gapsAbertos` em `minerva-index.json`.

**Se for Descarte**:
```
═══════════════════════════════════════════
DESCARTE A REGISTRAR EM GlobusEvo.Minerva
═══════════════════════════════════════════
Módulo: [sigla]
Origem no legado: [arquivo:linha]
Descrição: [...]
Justificativa: [...]
O que substitui: [...]
Risco de descartar: [...]
═══════════════════════════════════════════
```
Pergunte: *"Posso registrar esse Descarte em `gaps/descartes-log.md`? (sim/não)"* Se sim, faça o append (nunca sobrescreva o arquivo) — sem entrada correspondente em `minerva-index.json`.

**Nos dois casos**: uma vez aprovado, commite e **sempre tente o push em seguida** (não é uma pergunta separada). Se rejeitado por non-fast-forward, tente `git pull --rebase` + push uma vez; se ainda conflitar, pare e mostre ao dev.

## Restrições Absolutas

- Nunca pule o `git pull` inicial no Minerva.
- Nunca sobrescreva `gaps-log.md` ou `descartes-log.md` — são append-only.
- Nunca registre um GAP duplicado sem checar o índice primeiro; nunca registre um Descarte duplicado sem grepar `descartes-log.md` primeiro.
- Nunca registre um GAP que não passe o teste do PASSO 1 — dado do Azure já corrigido/contornado ou convenção de processo já seguida corretamente não são GAP (ver "Critério de GAP" em `conversion-policy.md`).
- Nunca registre um Descarte que não passe o Critério de Descarte — ausência de algo que o legado nunca teve, ou comportamento que ainda vira regra normal replicada, não são Descarte (ver "Critério de Descarte" em `conversion-policy.md`).
- Nunca commite/push no Minerva sem aprovação explícita — mas, uma vez aprovado, sempre tente o push (commit sem push não ajuda ninguém além de você).
