# /oai-kit-documentar-tela

Documenta uma tela legada Delphi de forma exaustiva, **sem implementar nada** — gera uma especificação que `/oai-kit-converter-tela` pode reaproveitar depois para pular a leitura do fonte (quando o nível permitir). Pode ser rodado por qualquer dev, a qualquer momento, adiantado em relação à conversão real.

**Uso — mesmos 3 modos de entrada de `/oai-kit-converter-tela`:**

- **Modo A — só Azure**: `/oai-kit-documentar-tela {ID_AZURE}`
- **Modo B — só fontes locais**: `/oai-kit-documentar-tela --fontes [caminho1] [caminho2] ...`
- **Modo C — combinação**: `/oai-kit-documentar-tela {ID_AZURE} --fontes [caminho1] [caminho2] ...`

## Sequência de Execução

### PASSO 1 — Especificar

Invoque `oai-kit-conversao-especificador`:
- `git pull` obrigatório em `GlobusEvo.Minerva` antes de qualquer leitura.
- Determina o modo de entrada e localiza/lê **todos** os arquivos do conjunto da tela (clássica ou multi-arquivo moderna).
- Checa se já existe especificação para esta tela — se sim, pergunta antes de sobrescrever.
- Documenta campos, grid, tabela(s) (incluindo colunas com mais de um caminho de escrita, se houver), regras de negócio (contadas), e já resolve o de/para de componente Delphi→UIKit.
- Classifica elemento Delphi sem equivalente visual (procedure/timer/chamada externa) e comportamento do legado conscientemente não replicado (Critério de Descarte), quando aplicável.
- Detecta dependências cross-módulo (AP-CONV-012), campo sensível para LGPD (AP-CONV-016) e campo de referência com lupa/browser — combobox (AP-CONV-017), quando aplicável.
- Resolve menu e índice de permissão (AP-CONV-013).
- **Resolve o padrão de conversão de frontend** (Grid+Modal | Inline+Grid | Accordion+Índice Numerado) via AP-CONV-015: convenção de texto na task do Azure primeiro, senão inferência a partir dos sinais do legado (múltiplas `TabSheet` → accordion; cadastro simples com/sem grid → default inline-grid), senão pergunta ao dev — registrado na spec com a origem, para `oai-kit-conversao-triagem` reaproveitar sem decidir de novo.
- Calcula pontuação estrutural + verifica gatilhos de exceção → nível N1-N5 ou N-ESPECIAL (ver `.oai-kit/policies/conversion-policy.md` — arquivo local do projeto, depositado pelo kit; não fica no Minerva).
- Registra staleness (mtime/tamanho dos fontes lidos).
- Gera `especificacoes/<modulo>/<tela-slug>.md` e atualiza `minerva-index.json`.

### ⚡ CHECKPOINT — Gate Pré-Commit no Minerva

**PARADA OBRIGATÓRIA.** Apresenta a especificação gerada (ou o diff, se estiver sobrescrevendo) e pergunta: *"Posso commitar esta especificação no GlobusEvo.Minerva? (sim/não)"* Após aprovado, sempre tenta o push (com retry automático de `git pull --rebase` uma vez em caso de conflito de fast-forward — ver `.oai-kit/policies/conversion-policy.md`).

## Regra geral

Este comando **nunca** implementa código de produção — só documenta. A conversão de fato continua sendo `/oai-kit-converter-tela`, que decide se reaproveita esta especificação ou lê o fonte diretamente, dependendo do nível calculado aqui.
