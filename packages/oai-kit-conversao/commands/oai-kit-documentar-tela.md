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
- Documenta campos, grid, tabela(s), regras de negócio (contadas), e já resolve o de/para de componente Delphi→UIKit.
- Calcula pontuação estrutural + verifica gatilhos de exceção → nível N1-N5 ou N-ESPECIAL (ver `.oai-kit/policies/conversion-policy.md` — arquivo local do projeto, depositado pelo kit; não fica no Minerva).
- Registra staleness (mtime/tamanho dos fontes lidos).
- Gera `especificacoes/<modulo>/<tela-slug>.md` e atualiza `minerva-index.json`.

### ⚡ CHECKPOINT — Gate Pré-Commit no Minerva

**PARADA OBRIGATÓRIA.** Apresenta a especificação gerada (ou o diff, se estiver sobrescrevendo) e pergunta: *"Posso commitar esta especificação no GlobusEvo.Minerva? (sim/não)"* Após aprovado, sempre tenta o push (com retry automático de `git pull --rebase` uma vez em caso de conflito de fast-forward — ver `.oai-kit/policies/conversion-policy.md`).

## Regra geral

Este comando **nunca** implementa código de produção — só documenta. A conversão de fato continua sendo `/oai-kit-converter-tela`, que decide se reaproveita esta especificação ou lê o fonte diretamente, dependendo do nível calculado aqui.
