# Documentação de QA — Base de Conhecimento

Este diretório armazena documentação técnica e funcional relevante para a equipe de QA: manuais, especificações de sistemas integrados, glossários e guias de ambiente de teste.

## Como usar

Os agentes de QA consultam esta documentação para contextualizar cenários de teste, entender comportamentos esperados de integrações e identificar restrições de ambiente.

## Estrutura sugerida

- `ambiente-{nome}.md` — configuração e restrições de cada ambiente de teste
- `integracao-{sistema}.md` — documentação de sistemas integrados (comportamento esperado, dados de mock)
- `glossario.md` — termos de negócio e técnicos do domínio
- `dados-de-teste.md` — guia de criação e uso de dados de teste

## Formato recomendado

```markdown
# Documentação: [Título]

**Tipo:** Ambiente / Integração / Glossário / Dados
**Mantido por:** [nome do responsável]
**Última atualização:** [data]

## Conteúdo
[Documentação aqui]

## Restrições / Limitações Conhecidas
[O que não funciona ou tem comportamento diferente do esperado]
```

## Instruções para a equipe de QA

Coloque aqui qualquer documentação que você consulta antes de criar um plano de teste. Exemplos:
- Especificações de APIs de integração
- Comportamento esperado de sistemas de terceiros
- Configurações específicas de ambiente de homologação
- Massas de dados disponíveis para testes
