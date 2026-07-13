# Suítes de Teste — Base de Conhecimento

Este diretório armazena suítes de teste de referência, casos de teste padrão por módulo e cenários de regressão recorrentes.

## Como usar

O agente `oai-kit-qa-planner` consulta este diretório para identificar casos de teste existentes que podem ser reaproveitados ou expandidos para a nova US em análise.

## Estrutura sugerida

- `{modulo}/suite-{funcionalidade}.md` — casos de teste agrupados por funcionalidade
- `regressao-{modulo}.md` — checklist de regressão do módulo

## Formato recomendado para suítes de referência

```markdown
# Suíte: [Nome da Funcionalidade]

**Módulo:** [sigla e nome]
**Prioridade:** Alta / Média / Baixa
**Última revisão:** [data]

## Casos de Teste

### CT01.01 — [Título do caso]
- **Tipo:** Funcional / Regressão / Smoke
- **Pré-condição:** [o que deve existir]
- **Passos:**
  1. [Passo]
  2. [Passo]
- **Resultado Esperado:** [o que deve acontecer]
- **Dados de Teste:** [exemplo de dados]

### CT01.02 — [Título]
...
```

## Instruções para a equipe de QA

Documente aqui suítes de teste que você já usa regularmente. Ao referenciar um caso de teste existente em um novo plano, o agente conseguirá citá-lo e reutilizá-lo ao invés de criar do zero.
