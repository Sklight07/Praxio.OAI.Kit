# Padrões Visuais — Base de Conhecimento PO

Este diretório armazena os padrões visuais, componentes de UI e guias de estilo dos sistemas da Torre Mobilidade. São usados pelo agente `oai-kit-po-prototype` para gerar protótipos HTML fiéis ao visual dos sistemas reais.

## Como usar

Ao solicitar um protótipo, o agente consulta este diretório para extrair:
- Paleta de cores dos sistemas
- Tipografia usada
- Padrões de componentes (botões, tabelas, formulários, cards)
- Layout padrão de páginas

## O que documentar aqui

### Capturas de tela de referência
Salve screenshots das principais telas do sistema em `screenshots/`:
- Nomeie como `{modulo}-{funcionalidade}.png`
- Inclua estado normal, hover, erro e vazio (empty state)

### Tokens de design
```markdown
# Tokens de Design — [Nome do Sistema]

## Cores
- Primária: #XXXXXX
- Secundária: #XXXXXX
- Fundo: #XXXXXX
- Texto: #XXXXXX
- Sucesso / Alerta / Erro: #XX / #XX / #XX

## Tipografia
- Família: [fonte]
- Tamanhos: título (Xpx), corpo (Xpx), caption (Xpx)

## Componentes principais
- Botão primário: [descrição visual]
- Botão secundário: [descrição visual]
- Tabela: [descrição visual]
- Card: [descrição visual]
```

## Instruções para a equipe de PO

Ao trabalhar em uma nova funcionalidade, o protótipo ficará muito mais próximo do sistema real se houver referências visuais aqui. Tire screenshots das telas relacionadas e salve neste diretório.
