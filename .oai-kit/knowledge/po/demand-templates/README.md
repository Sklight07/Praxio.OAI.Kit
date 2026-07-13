# Templates de Demanda — Base de Conhecimento PO

Este diretório armazena templates e exemplos de documentação de demandas usados pelo agente `oai-kit-po-demand` para gerar User Stories, critérios de aceite e documentos de especificação.

## Como usar

O agente `oai-kit-po-demand` consulta os templates deste diretório ao gerar documentação de demanda, garantindo consistência com o padrão adotado pelo time.

## Templates disponíveis

### Template de User Story
```markdown
# User Story: [Título]

**Como** [quem]
**Quero** [o quê]
**Para que** [por quê / valor de negócio]

## Critérios de Aceite
- [ ] [Critério 1 — verificável e testável]
- [ ] [Critério 2]
- [ ] [Critério 3 — cenário de erro]

## Notas de Negócio
[Regras, restrições ou contexto adicional]

## Dependências
- [Outros sistemas ou times envolvidos]

## Fora do Escopo
- [O que explicitamente não será feito nesta US]
```

### Template de Especificação Funcional
```markdown
# Especificação: [Nome da Funcionalidade]

**Versão:** [x.x]
**Solicitante:** [SIM/PSE número]
**Módulo:** [sigla e nome]

## Objetivo
[O que esta funcionalidade resolve]

## Fluxo Principal
1. [Passo]
2. [Passo]

## Fluxos Alternativos / Exceções
[Descrição]

## Regras de Negócio
- [RN001] [regra]

## Interface / Telas
[Referências ao protótipo ou capturas de tela]
```

## Instruções para a equipe de PO

Personalize os templates aqui de acordo com o que seu time usa. Quanto mais refinados, mais consistente será a documentação gerada pelos agentes.
