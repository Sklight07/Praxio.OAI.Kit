# Processos de QA — Base de Conhecimento

Este diretório contém os processos, fluxos e procedimentos seguidos pela equipe de QA da Torre Mobilidade.

## Como usar

Os agentes de QA consultam esta base antes de criar planos de teste, permitindo que cenários e fluxos conhecidos do negócio sejam incorporados automaticamente.

## Estrutura sugerida

- `{modulo}-fluxo-principal.md` — fluxo principal do módulo com passos, pré-condições e estados esperados
- `{modulo}-regras-negocio.md` — regras de negócio críticas que impactam os testes
- `integracao-{sistema}.md` — pontos de integração com sistemas externos e como testá-los

## Formato recomendado para processos

```markdown
# Processo: [Nome do Processo]

**Módulo:** [ex: FLP — Faturamento e Lançamentos]
**Versão:** [data da última atualização]

## Descrição
[O que o processo faz e por que existe]

## Pré-condições
- [O que deve existir antes de iniciar]

## Fluxo Principal
1. [Passo 1]
2. [Passo 2]

## Fluxos Alternativos
- [Quando X ocorre → fluxo alternativo]

## Pontos de Atenção para QA
- [Cenários que costumam falhar]
- [Integrações críticas]
- [Dados de teste necessários]
```

## Instruções para a equipe de QA

Adicione neste diretório qualquer processo que vocês já conhecem de memória — quanto mais rico este acervo, mais precisos e contextualizados serão os planos de teste gerados automaticamente.
