# Plano — Sinais de Alerta Arquitetural, `/oai-kit-avaliar-tela` e decisões persistidas

> Documento de planejamento (2026-08-05), registrando em detalhe tudo que foi desenhado em conversa antes de qualquer implementação. Objetivo explícito: servir de base para uma etapa futura de análise/consolidação — **nada aqui foi implementado ainda**, é o desenho fechado, pronto para execução quando decidido. Contexto motivador completo em `docs/avaliacao-limites-metodo-conversao.md` (4 estudos de caso reais que expuseram os limites do método atual).

## Resumo em uma frase

O fluxo de 2 comandos (`/oai-kit-documentar-tela` → `/oai-kit-converter-tela`) continua exatamente igual para telas simples. Para telas onde apareceu um "sinal de alerta arquitetural" real (achado nos 4 casos: motor de cálculo fora do Delphi, tela-hub com grafo de satélites, cascata não-atômica, schema EAV, achado de segurança, inconsistência do próprio legado), o mesmo gate que já existe hoje para `N-ESPECIAL` passa a trazer um menu de opções com trade-off e a reaproveitar decisões já tomadas antes — sem inventar um gate novo. Existe também um comando opcional (`/oai-kit-avaliar-tela`) para quando o dev já desconfia da complexidade antes de começar.

## Princípio de design (não negociável)

**Nada disso pode custar nada perceptível numa tela simples.** A maioria dos sinais só é detectável durante uma leitura profunda que hoje já só acontece em telas N4/N5/N-ESPECIAL (procedure chamada, cascata de gravação, múltiplas tabelas) — uma tela de 3-6 campos sem procedure estruturalmente não tem onde esses sinais aparecerem. A única verificação que roda sempre, mesmo em N1-N3, é a varredura de segurança — e essa é mecânica/rápida (grep-like num arquivo pequeno), silenciosa quando não acha nada.

---

## Peça 1 — Reforços pontuais em agentes que já existem (sem criar nada novo)

Correções concretas que fecham lacunas reais expostas pelos 4 casos, sem exigir nenhuma peça nova de arquitetura.

### 1.1 — Gatilho "procedure relacionada" (fecha a lacuna do Caso 4 — DIRF)

**Onde:** `agents/oai-kit-conversao-triagem.md` e `agents/oai-kit-conversao-especificador.md`, no passo de confirmação de schema Oracle (que já lê `tabelasConhecidas.json`).

**Regra nova:** se a descoberta de uma tabela envolvida lista procedure(s) na seção "Procedures/Functions relacionadas" **e** a tela chama ou depende de alguma delas para calcular um valor, isso vira gatilho automático de investigação profunda (`get_object_source` via MCP Oracle, AP-CONV-006) — não depende mais de o agente "perceber" que falta a fórmula, o próprio Minerva já aponta pra onde ir buscar (confirmado real no Caso 4: `FLP_TABIRF.md`/`FLP_DIRF.md` já listam `PR_DIRF`/`PR_INFORME` por nome).

### 1.2 — Varredura de segurança obrigatória e sempre visível (fecha o padrão dos Casos 1 e 3)

**Onde:** `especificacoes/_template-especificacao.md` (Minerva) ganha uma seção fixa nova, "Varredura de Segurança", e `oai-kit-conversao-especificador.md` passa a preenchê-la **sempre**, mesmo quando o resultado é "nada encontrado" — nunca condicional a "esta tela parece arriscada".

**O que procurar:** sequência de tecla oculta/backdoor, senha derivada de forma fraca (ex.: substring de CPF), concatenação de SQL com dado de entrada livre do usuário. Achado real → força classificação (ver gatilho novo na Peça 2).

### 1.3 — Inconsistência do próprio legado nunca se resolve sozinha (fecha o achado do Caso 3)

**Onde:** `oai-kit-conversao-especificador.md`, passo de classificação de regras de negócio.

**Regra nova:** encontrar duas regras aparentemente equivalentes com lógica/limite diferente nunca vira "uniformizar" nem "replicar as duas sem avisar" — sempre GAP explícito de decisão (já cabe no Critério de GAP existente: "decisão de arquitetura/negócio genuinamente pendente").

### 1.4 — Nota de housekeeping (observação, não ação imediata)

Achado real durante a discussão: `GlobusWeb.Manutencao/front-end/src/components/CadastroAreaManutencao/GruposServicoTransferList.tsx` reimplementa do zero o mesmo padrão do componente já catalogado `SelecaoAleatoria` (UIKit) — duplicação real que a AP-CONV-011 deveria ter evitado. Não é ação nossa consertar código de outro módulo unilateralmente; registrar como observação em `catalogo-reuso/componentes/SelecaoAleatoria.md` (Minerva) na próxima oportunidade, sinalizando a duplicação encontrada, para que quem mantém `GlobusWeb.Manutencao` decida se migra.

---

## Peça 2 — Novos gatilhos de exceção na Escala de Classificação

**Onde:** `policies/conversion-policy.md`, seção "Escala de Classificação (N1-N5 / N-ESPECIAL)", lista de "Gatilhos de exceção" (a mesma lista que já tem: procedure/function, integração externa, gravação em tabela não-relacionada, muitas regras Tipo 3, GAP cross-módulo).

**Decisão de design importante:** em vez de um mecanismo paralelo ("Gate de Estratégia" separado, ideia descartada), os sinais entram como **gatilhos de exceção novos** na mesma escala — o que significa que continuam forçando `N-ESPECIAL` e caindo no gate que **já existe hoje** ("PARE AQUI. Plano está correto?"). Nenhum gate novo é criado.

4 gatilhos novos a adicionar (os outros 3 sinais discutidos já são cobertos pelos gatilhos existentes — procedure chamada já força N-ESPECIAL, por exemplo):

1. **Achado de segurança confirmado** (backdoor, senha fraca, SQL concatenado — não suspeita, achado real via a varredura da Peça 1.2).
2. **Tela-hub com grafo de satélites** — N+ itens de menu (calibrar N, sugestão inicial: 8+) abrindo outras telas relacionadas à mesma entidade.
3. **Schema EAV ou descoberto só em runtime** — padrão tipo-valor genérico, ou SQL montado via introspecção de schema (`USER_TAB_COLUMNS` ou equivalente).
4. **Inconsistência confirmada no próprio legado** — duas regras equivalentes com lógica/limite diferente (ver Peça 1.3).

### Enriquecimento do gate de N-ESPECIAL (não um gate novo)

**Onde:** `agents/oai-kit-conversao-triagem.md`, template de output do plano (`## Arquétipo e Nível`, seção do gate `N-ESPECIAL`).

Quando um desses 4 gatilhos (ou o de procedure, quando aplicável ao caso de cálculo fiscal) estiver presente, o plano ganha uma seção nova, **"Sinais de Alerta Arquitetural"**, com este formato por sinal:

```
## Sinal: [nome]
**Onde apareceu:** [tela, arquivo:linha]
**O que significa:** [explicação em 2-3 linhas]
**Já existe decisão persistida?**
  → sim: [qual decisão, de onde — decisoes-arquiteturais/<sinal>.md] — aplicando automaticamente
  → não: opções abaixo, aguardando decisão do dev
**Opções (se não houver decisão prévia):**
1. [opção] — prós / contras
2. [opção] — prós / contras
3. [opção] — prós / contras
**Decisão:** [preenchida pelo dev no mesmo gate de "posso prosseguir?" que já existe]
**Escopo da decisão:** [só esta tela | módulo inteiro | sistema todo]
```

O gate de aprovação continua sendo a mesma pergunta de sempre ("O plano e a classificação estão corretos? Posso prosseguir?") — só que agora, quando aplicável, ela vem acompanhada dessa seção rica em vez de vazia.

---

## Peça 3 — Comando novo: `/oai-kit-avaliar-tela`

**Natureza:** opcional e proativo — nunca faz parte do caminho padrão. É a alternativa ao `/oai-kit-documentar-tela` para quando o dev **já desconfia** que a tela é das difíceis (tamanho, múltiplas abas, nome sugestivo de motor de cálculo) e quer entender o tamanho do problema antes de comprometer tempo.

**Modos de entrada:** os mesmos 3 já padronizados nos outros comandos (ID Azure / fontes locais / combinação).

### Fluxo em 2 fases

**Fase 1 — Diagnóstico rápido (sempre roda primeiro, barato):**
- Tamanho do(s) arquivo(s), contagem de abas/itens de menu no `.dfm`, quantas procedures são chamadas, varredura leve de segurança (grep de padrões de risco).
- Output curto: "Tela de X linhas, Y abas, chama N procedures, M itens de menu — candidata a sinais de alerta: [lista provável]. Quer a análise completa?"
- Se o dev disser não, ou os números não sugerirem nada de especial: encerra aqui, sugere `/oai-kit-documentar-tela` normal.

**Fase 2 — Leitura exaustiva multi-frente (só roda com confirmação do dev, ou se ele já pediu direto):**
- Mesmo desenho usado nos 4 estudos de caso: estrutura visual / dados e integração / regras de negócio / segurança — dividido em sub-leituras quando o arquivo é grande (mesmo critério de tamanho que guiou a divisão em 2-3 agentes nos casos reais).
- **Produz o mesmo tipo de artefato que `/oai-kit-documentar-tela` produziria** — uma especificação completa em `especificacoes/<modulo>/<tela-slug>.md` — só que com a seção "Sinais de Alerta Arquitetural" já preenchida e resolvida (decisão reaproveitada ou decidida ali mesmo com o dev).
- As decisões novas tomadas ficam persistidas em `decisoes-arquiteturais/` (Peça 5), reutilizáveis por qualquer tela futura, não só esta.

### Como se encaixa depois — sem mecanismo de conexão novo

Depois de rodar `/oai-kit-avaliar-tela`, o dev roda `/oai-kit-converter-tela {mesma tela}` normalmente. A triagem **já hoje** checa `minerva-index.json → especificacoes` por uma especificação prévia (staleness por mtime/tamanho) antes de ler o fonte de novo — esse mecanismo existente é reaproveitado sem alteração. A especificação gerada pelo `avaliar-tela` é encontrada, as decisões já resolvidas não são reabertas, e o fluxo segue direto para backend/frontend já informado pela estratégia escolhida.

```
/oai-kit-documentar-tela   → especificação normal (sem sinais, ou sinais reaproveitados automaticamente)
/oai-kit-avaliar-tela      → MESMO tipo de especificação, com a fase de diagnóstico e a
                             discussão de sinais embutida no meio do processo
                             (usar no lugar de "documentar-tela" quando desconfiar da tela)
                                        ↓
/oai-kit-converter-tela    → sempre o mesmo próximo passo, não importa qual dos dois gerou a especificação
```

---

## Peça 4 — Agente novo: `oai-kit-conversao-consultor-arquitetural`

**Dois pontos de entrada** (mesma lógica, dois lugares que o chamam):
1. Diretamente pelo comando `/oai-kit-avaliar-tela` (uso proativo).
2. Internamente por `oai-kit-conversao-triagem`, quando ela detecta um dos 4 gatilhos novos (ou o de procedure) durante o fluxo normal de `/oai-kit-converter-tela`/`/oai-kit-documentar-tela` — sem precisar o dev trocar de comando.

**Faz:** a leitura profunda multi-frente (Fase 2 da Peça 3) e a montagem da seção "Sinais de Alerta Arquitetural" com opções e trade-offs.

**Restrições absolutas:**
- Nunca decide sozinho qual opção seguir — sempre apresenta 2-3 caminhos com trade-off explícito e para, aguardando o dev.
- Nunca gera código de produção.
- Nunca gera plano de conversão mecânico por conta própria — o que ele produz é a análise + as opções; a decisão final e a execução continuam sendo do fluxo normal (triagem decide nível, backend/frontend implementam).
- Sempre consulta `decisoes-arquiteturais/` antes de montar as opções — nunca reabre uma discussão já resolvida pra um sinal do mesmo tipo (mesmo escopo).

---

## Peça 5 — Persistência das decisões: `decisoes-arquiteturais/` (novo diretório no Minerva)

**Estrutura**, paralela a `archetypes/`/`gaps/`:
```
decisoes-arquiteturais/
  README.md                          — explica o mecanismo (mesmo estilo dos outros READMEs de pasta)
  _template-decisao.md
  motor-calculo-fora-delphi.md       — um arquivo por TIPO de sinal
  tela-hub-satelites.md
  cascata-nao-atomica.md
  schema-eav-runtime.md
  achado-seguranca.md
  inconsistencia-legado.md
```

Cada arquivo **acumula ocorrências ao longo do tempo** (log, não valor único) — porque o mesmo tipo de sinal pode ter decisão diferente em módulos diferentes (ex.: Folha decide empacotar o cálculo fiscal, outro módulo pode decidir diferente pra um caso parecido). Formato de entrada dentro de cada arquivo, uma seção por ocorrência:

```
## Ocorrência — [tela, data]
**Sinal:** [nome]
**Onde:** [arquivo:linha do legado]
**Opções apresentadas:** [lista]
**Decisão:** [o que foi escolhido]
**Escopo:** [só esta tela | módulo <X> | sistema todo]
**Justificativa:** [por que essa opção]
```

**Índice novo em `minerva-index.json`** → `decisoesArquiteturais` (mesmo padrão ponteiro-só de todo índice já existente): nome do sinal → arquivo + contagem de ocorrências.

**Diferença em relação a `gaps-log.md`** (importante deixar explícito em qualquer implementação futura): GAP é "algo que ficou pendente, exige ação de alguém"; decisão arquitetural é "algo que **já foi decidido** e virou política reutilizável". Categorias adjacentes, não a mesma coisa — mas um GAP antigo pode "virar" uma decisão registrada quando alguém finalmente resolve (nesse caso, referenciar de um lado para o outro).

---

## Peça 6 — Novo(s) AP-CONV em `conversion-policy.md`

Pelo menos dois números novos (a confirmar exato na hora de implementar, dado que já estamos em AP-CONV-015):
- **AP-CONV-016** — os 4 gatilhos de exceção novos (Peça 2) + a regra "procedure relacionada" (Peça 1.1) + a obrigatoriedade da varredura de segurança em toda tela, independente de nível (Peça 1.2).
- **AP-CONV-017** — o mecanismo de `decisoes-arquiteturais/`: decisão-uma-vez-reaproveitada-sempre, escopo (tela/módulo/sistema), e a regra de nunca reabrir uma decisão já persistida sem motivo novo.

---

## Fluxos de uso concretos (o que muda de verdade, cenário a cenário)

**Fluxo 1 — Tela simples (a maioria), como hoje:** `/oai-kit-documentar-tela` (opcional) → `/oai-kit-converter-tela`. Zero mudança perceptível — nenhum dos 4 gatilhos novos tem onde aparecer numa tela pequena sem procedure.

**Fluxo 2 — Tela N-ESPECIAL "tradicional" (já existe hoje), sem sinal novo:** mesmo gate de sempre, sem mudança de conteúdo.

**Fluxo 3 — Tela N-ESPECIAL com 1+ sinal novo:** mesmo comando, mesmo gate — só que agora com a seção "Sinais de Alerta Arquitetural" preenchida, decisão reaproveitada automaticamente se já existir, ou opções apresentadas se for a primeira vez.

**Fluxo 4 — Dev já desconfia antes de começar:** `/oai-kit-avaliar-tela` — único comando novo, opcional, produz o mesmo tipo de especificação que alimenta o `/oai-kit-converter-tela` de sempre.

---

## Arquivos a tocar quando isto for implementado (mapa de execução)

**`Praxio.OAI.Kit` (`packages/oai-kit-conversao`):**
- `policies/conversion-policy.md` — Peças 2 e 6 (gatilhos novos, AP-CONV-016/017).
- `agents/oai-kit-conversao-triagem.md` — Peças 1.1, 2 (detecção + enriquecimento do gate N-ESPECIAL).
- `agents/oai-kit-conversao-especificador.md` — Peças 1.1, 1.2, 1.3.
- `agents/oai-kit-conversao-paridade.md` — checklist espelhando a varredura de segurança e a não-uniformização de inconsistência.
- **Novo:** `agents/oai-kit-conversao-consultor-arquitetural.md` — Peça 4.
- **Novo:** `commands/oai-kit-avaliar-tela.md` — Peça 3.
- `CHANGELOG.md` + bump de versão, quando fechado.

**`GlobusEvo.Minerva`:**
- **Novo diretório:** `decisoes-arquiteturais/` (README, template, 1 arquivo por sinal — semeados vazios) — Peça 5.
- `especificacoes/_template-especificacao.md` — nova seção "Varredura de Segurança" (sempre) + "Sinais de Alerta Arquitetural" (condicional) — Peças 1.2 e 2.
- `minerva-index.json` — novo índice `decisoesArquiteturais` — Peça 5.
- `README.md` — mencionar o novo diretório na seção Estrutura.
- `catalogo-reuso/componentes/SelecaoAleatoria.md` — nota de observação sobre a duplicação encontrada em `GlobusWeb.Manutencao` (Peça 1.4).

## Pontos abertos para a próxima rodada de análise

- Confirmar o valor de N (contagem de itens de menu) que dispara o gatilho "tela-hub com grafo de satélites" — sugestão inicial de 8+ não foi validada contra mais exemplos além do Caso 3.
- Confirmar se `decisoesArquiteturais` deve ficar restrito por módulo por padrão, ou se o escopo "sistema todo" deveria ser o default e módulo a exceção — hoje o desenho deixa a escolha de escopo pro dev a cada decisão, sem um default definido.
- Definir o nome exato dos arquivos dentro de `decisoes-arquiteturais/` (os 6 sugeridos na Peça 5 são provisórios, baseados só nos 4 casos já vistos — mais casos reais provavelmente vão sugerir nomes melhores ou uma categoria adicional).
