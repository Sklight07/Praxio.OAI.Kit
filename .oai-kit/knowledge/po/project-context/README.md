# Contexto do Projeto — Base de Conhecimento PO

Este diretório armazena o contexto de produto e negócio necessário para os agentes de PO gerarem documentação precisa e alinhada com os objetivos do time.

## Como usar

O agente `oai-kit-po-demand` consulta este diretório para entender o produto, os usuários, as regras de negócio críticas e o roadmap, permitindo gerar User Stories com contexto real ao invés de genérico.

## O que documentar aqui

### Personas e usuários
```markdown
# Personas

## [Nome da Persona]
- **Papel:** [ex: Operador de Faturamento]
- **Necessidades principais:** [o que mais importa para ela]
- **Frustrações atuais:** [o que dificulta o trabalho hoje]
- **Frequência de uso:** [diário / semanal / eventual]
```

### Glossário de produto
```markdown
# Glossário — [Nome do Sistema/Módulo]

| Termo | Definição |
|-------|-----------|
| [Termo] | [O que significa no contexto do produto] |
```

### Roadmap e contexto estratégico
```markdown
# Contexto Estratégico

**Período:** [ex: Q3 2026]
**Foco:** [ex: Melhoria de performance no módulo de faturamento]
**Iniciativas prioritárias:**
1. [Iniciativa 1]
2. [Iniciativa 2]
```

### Regras de negócio críticas
```markdown
# Regras de Negócio — [Módulo]

| ID | Regra | Impacto se violada |
|----|-------|-------------------|
| RN001 | [regra] | [consequência] |
```

## Instruções para a equipe de PO

Mantenha este diretório atualizado com informações que você usaria para explicar o produto a um novo membro do time. Os agentes usarão estes documentos para gerar User Stories com contexto de negócio real.
