# praxio-oai-kit-conversao

Extensão do [`praxio-oai-kit`](https://www.npmjs.com/package/praxio-oai-kit) para **migração assistida por IA de telas de um sistema legado para uma arquitetura nova** — caso de uso original: telas Delphi (Globus) convertidas para o GlobusWeb (NestJS/React/Apollo Federation), módulo por módulo.

> Requer o `praxio-oai-kit` (kit base) já instalado no repositório. Esta extensão adiciona o perfil `conversao` por cima dele — não substitui nem duplica a infraestrutura do kit base.

---

## Por que uma extensão separada

O volume de trabalho de uma migração desse tipo (centenas de telas) itera muito mais rápido que o ciclo normal de bug/feature do kit base — desacoplar o release faz sentido técnico, não só organizacional. Ainda assim, reaproveita 100% do mecanismo de perfis/adapters já existente no `praxio-oai-kit`.

## Pré-requisitos

- `praxio-oai-kit` já instalado no repositório (`npx praxio-oai-kit init`).
- Acesso local ao repositório do sistema legado.
- Uma **base de conhecimento central** — um repositório git próprio, compartilhado por todos os módulos em conversão (não duplicada por repositório). É onde arquétipos, cheatsheets, catálogo de componentes reutilizáveis, descobertas de schema e métricas se acumulam entre conversões.

## Instalação

```bash
npx praxio-oai-kit-conversao init
```

O wizard interativo:
- Deposita o perfil `conversao` (agentes/comandos/policy) dentro de `.oai-kit/` do repositório e reexecuta o adapter da IDE ativa (Claude Code e/ou Cursor).
- Pergunta o caminho local do repositório legado e da base de conhecimento central.
- Pergunta, de forma opcional, se você quer configurar MCPs auxiliares (ex.: exploração de schema Oracle via `praxio-oracle-discover-mcp`, indexação de código como grafo de conhecimento via Graphify) — só usados quando a conversão realmente precisar, nunca por padrão.
- Salva tudo em `.claude/.local-config.json` (pessoal, gitignored), sob a chave `conversao`.

## Atualização

Quando uma nova versão for publicada, **não repita o wizard** — use `update`:

```bash
npx praxio-oai-kit-conversao@latest update
```

Regrava `.oai-kit/agents/conversao`, `.oai-kit/commands/conversao` e `.oai-kit/policies` com a versão mais recente do pacote, sem tocar em `.claude/.local-config.json` (seus paths pessoais continuam os mesmos) e sem repetir nenhuma pergunta do wizard. Use `init` apenas na primeira vez que configurar a extensão num repositório.

Ver [`CHANGELOG.md`](./CHANGELOG.md) para o que muda em cada versão.

## Uso

Dentro do Claude Code (ou Cursor), no repositório onde a extensão foi instalada:

```
/oai-kit-documentar-tela {ID_AZURE ou --fontes ...}          # documenta uma tela adiantado, sem converter
/oai-kit-converter-tela {ID_AZURE}                          # Modo A — só Azure
/oai-kit-converter-tela --fontes [caminho1] [caminho2] ...  # Modo B — só fontes locais
/oai-kit-converter-tela {ID_AZURE} --fontes [...]           # Modo C — combinação
/oai-kit-registrar-gap                                       # registra um GAP a qualquer momento
```

`/oai-kit-converter-tela` classifica a tela numa escala graduada (`N1`-`N5`, por sinais estruturais como grid/PK composta/master-detail/referências externas, ou `N-ESPECIAL` quando há procedure/integração/gravação em tabela não-relacionada/muitas regras de negócio) antes de implementar, decidindo quanto do fonte legado precisa ser lido e quantos checkpoints a conversão tem. Se uma especificação prévia já existir (via `/oai-kit-documentar-tela`), a leitura do fonte é pulada total ou parcialmente.

### Sequência de execução

```
PASSO 1 — Triagem       → classifica arquétipo/nível, gera plano
⚡ CHECKPOINT (proporcional ao nível)
PASSO 2 — Backend        → implementa NestJS seguindo a receita do arquétipo
PASSO 3 — Frontend       → implementa React consumindo o contrato já validado
PASSO 4 — Paridade       → verificação estática + checklist de teste manual
⚡ CHECKPOINT FINAL — espera você testar, nunca assume sucesso
PASSO 5 — Aprendizado    → retroalimenta a base de conhecimento central
```

Os agentes **nunca sobem/executam o projeto** — no máximo compilam/lint/typecheck. Testar rodando é sempre trabalho do dev, e o commit final só acontece depois que você confirma explicitamente que testou e passou.

## O que retroalimenta a base de conhecimento central

Toda conversão devolve o que aprendeu, para nunca ser redescoberto na próxima tela:
- Arquétipos e padrões estruturais reutilizáveis (ex.: Grid+Modal para telas CRUD).
- Armadilhas confirmadas contra o código-fonte real (não suposições) — comportamento não-óbvio de componentes, incompatibilidades de versão, bugs de biblioteca de terceiros.
- Schema Oracle descoberto (tabelas, procedures, views).
- GAPs não resolvíveis na conversão pontual, para decisão humana.
- Métricas por tela convertida (nível, checkpoints, duração aproximada, bugs de conversão corrigidos) — usadas para calibrar estimativas futuras.

## Políticas

`policies/conversion-policy.md` reúne as regras que os agentes desta extensão não podem ignorar (AP-CONV-001 a AP-CONV-015+) — cobrem desde nunca adivinhar nome de tabela/objeto por aproximação até a escolha do padrão de frontend para telas CRUD (Grid+Modal, Inline+Grid ou Accordion+Índice Numerado, conforme AP-CONV-015) e as regras de branch/commit no gate final de paridade. São bloqueadores, não sugestões.

## Agentes

| Agente | Acionado por | Responsabilidade |
|---|---|---|
| `oai-kit-conversao-triagem` | `/oai-kit-converter-tela`, `/oai-kit-documentar-tela` | Classifica arquétipo/nível, gera o plano de conversão |
| `oai-kit-conversao-backend` | PASSO 2 | Implementa o back-end NestJS seguindo a receita do arquétipo |
| `oai-kit-conversao-frontend` | PASSO 3 | Implementa a feature React consumindo o contrato já validado |
| `oai-kit-conversao-paridade` | PASSO 4 | Verificação estática + checklist de teste manual proporcional ao nível |
| `oai-kit-conversao-aprendizado` | PASSO 5 | Retroalimenta a base de conhecimento central |

## Licença

MIT — Praxio
