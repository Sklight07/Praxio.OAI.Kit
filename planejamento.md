# POAI 2.0 - Planejamento Técnico da Arquitetura Multi-IDE

## Objetivo

Evoluir o POAI de uma solução exclusiva para Claude Code para uma plataforma de Engenharia de Software Assistida por IA, capaz de funcionar em diferentes IDEs e atender diferentes perfis dentro da equipe de tecnologia.

O objetivo não é apenas suportar Cursor, mas tornar o POAI independente da ferramenta utilizada.

No futuro, Claude Code, Cursor, VS Code, Windsurf, Gemini CLI, Codex CLI ou qualquer outra ferramenta deverão ser apenas clientes (adaptadores) da plataforma.

---

# Visão Geral da Nova Arquitetura

O conhecimento do POAI não deverá mais ficar acoplado ao Claude.

Hoje, de forma simplificada, a arquitetura é semelhante a:

```
POAI

↓

.claude/

↓

commands/

↓

Agentes
```

Na nova arquitetura, o conhecimento ficará centralizado em uma estrutura própria do POAI.

```
                 POAI Core
                     │
      ┌──────────────┼──────────────┐
      │              │              │
   Claude        Cursor         Futuras IDEs
   Adapter       Adapter         Adapter
      │              │
  .claude/       .cursor/
```

Dessa forma:

* os agentes passam a ser independentes da IDE;
* Claude e Cursor deixam de ser o centro da solução;
* o POAI passa a ser a única fonte de verdade.

---

# Separação em Camadas

## 1. Core

Responsável por armazenar todo o conhecimento da plataforma.

Exemplo:

```
.poai/

    agents/

    workflows/

    templates/

    knowledge/

    checklists/

    prompts/

    config/
```

Nenhum arquivo desta camada deve conhecer Claude, Cursor ou qualquer outra IDE.

Ela representa a inteligência da plataforma.

---

## 2. Adaptadores

Cada IDE possuirá um adaptador responsável por converter os agentes para o formato esperado.

Exemplo:

```
adapters/

    claude/

    cursor/

    vscode/

    windsurf/

    future/
```

Cada adaptador deverá conhecer exclusivamente sua IDE.

---

## 3. Artefatos Gerados

Durante a instalação, o POAI gera apenas as estruturas necessárias para cada ambiente.

Exemplo:

```
.claude/

.cursor/
```

Essas estruturas passam a ser artefatos gerados.

O código-fonte do conhecimento continua dentro da pasta `.poai`.

---

# Nova Estrutura do Projeto

Após a instalação, um repositório poderá ficar semelhante a:

```
Projeto

src/

tests/

.poai/

    agents/

    workflows/

    templates/

    knowledge/

    config/

.claude/

.cursor/
```

A pasta `.poai` será a fonte de verdade.

As demais pastas serão apenas adaptações para cada IDE.

---

# Processo de Instalação

Ao executar:

```
poai install
```

O instalador deverá solicitar:

## IDEs utilizadas no projeto

Exemplo:

```
Quais IDEs utilizarão este projeto?

[X] Claude Code

[X] Cursor

[ ] VS Code

[ ] Windsurf
```

A partir dessa escolha, serão gerados apenas os adaptadores necessários.

---

## Perfis que utilizarão o projeto

Exemplo:

```
Quais perfis utilizarão este projeto?

[X] Desenvolvedor

[X] QA

[ ] Product Owner

[ ] DevOps

[ ] Arquiteto

[ ] UX
```

O objetivo é instalar apenas os agentes necessários.

---

## Capacidades

Em vez de pensar apenas em agentes, o POAI deverá trabalhar com o conceito de capacidades.

Exemplo:

```
Capacidades

[X] Desenvolvimento

[X] Arquitetura

[X] Revisão de Código

[X] QA

[ ] Documentação

[ ] DevOps

[ ] Product Discovery
```

Cada capacidade instala um conjunto de agentes relacionados.

Essa abordagem facilita a evolução da plataforma e reduz a complexidade para o usuário.

---

# Configuração Persistente

Após a instalação, o POAI deverá criar um arquivo de configuração.

Exemplo:

```yaml
project: Sistema RH

version: 2.0

ides:
  - claude
  - cursor

profiles:
  - developer
  - qa

capabilities:
  - development
  - architecture
  - review
  - qa
```

Esse arquivo permitirá futuras atualizações automáticas.

---

# Processo de Atualização

Ao executar:

```
poai update
```

O instalador deverá:

* ler a configuração existente;
* identificar IDEs instaladas;
* identificar perfis instalados;
* identificar capacidades instaladas;
* atualizar somente os componentes necessários.

Não será necessário responder novamente todas as perguntas.

---

# Inclusão de Novas IDEs

Também deverá existir um comando específico para adicionar suporte a uma nova IDE.

Exemplo:

```
poai ide add cursor
```

ou

```
poai ide add claude
```

Nesse caso apenas o novo adaptador será criado.

Todo o restante da plataforma permanece inalterado.

---

# Inclusão de Novos Perfis

Da mesma forma:

```
poai profile add qa
```

ou

```
poai capability add devops
```

A instalação passa a ser incremental.

---

# Agentes

Cada agente deverá possuir identidade própria.

Exemplo:

```
Developer

Architect

Reviewer

QA Planner

Regression Planner

Acceptance Validator

Exploratory Tester

Bug Analyzer

Test Data Generator

Documentation Writer

DevOps Assistant
```

Cada agente deverá possuir:

* objetivo;
* responsabilidades;
* contexto;
* limitações;
* templates;
* exemplos;
* workflows recomendados;
* conhecimento específico.

---

# Agentes de QA

O POAI passa a atender também analistas de QA.

Inicialmente poderão existir:

## QA Planner

Entrada:

* Azure DevOps Task
* Pull Request
* Código

Saída:

Plano completo de testes.

---

## Regression Planner

Entrada:

Arquivos alterados.

Saída:

Lista de funcionalidades potencialmente impactadas.

---

## Acceptance Validator

Entrada:

Critérios de aceite.

Pull Request.

Código.

Saída:

Validação dos critérios implementados.

---

## Test Case Generator

Entrada:

Task.

Código.

Saída:

* Casos positivos;
* Casos negativos;
* Casos de exceção;
* Casos de regressão.

---

## Bug Analyzer

Entrada:

Bug.

Logs.

Stack Trace.

Código.

Saída:

Hipóteses e pontos prováveis da falha.

---

# Utilização do Código-Fonte

Diferentemente do modelo atual utilizado pelos QAs, os agentes deverão utilizar também o código do projeto como contexto.

Fluxo esperado:

```
Task Azure DevOps

↓

Critérios de Aceite

↓

Pull Request

↓

Arquivos Alterados

↓

Dependências

↓

Controllers

↓

Serviços

↓

Banco de Dados

↓

Fluxos impactados

↓

Plano de Testes
```

Essa abordagem produz análises muito mais completas do que utilizar apenas a descrição da tarefa.

---

# Adaptador Claude

Responsabilidades:

* gerar Slash Commands;
* gerar estrutura `.claude`;
* registrar comandos;
* mapear agentes para comandos.

---

# Adaptador Cursor

Responsabilidades:

* gerar estrutura `.cursor`;
* converter agentes para Rules, Agents ou Skills conforme a versão do Cursor;
* disponibilizar formas naturais de utilização.

Importante:

Nenhum agente deverá depender exclusivamente de Slash Commands.

---

# Roadmap

## Fase 1

Separação do Core.

---

## Fase 2

Criação da pasta `.poai`.

---

## Fase 3

Refatoração dos agentes atuais.

---

## Fase 4

Implementação do sistema de Adaptadores.

---

## Fase 5

Suporte oficial ao Cursor.

---

## Fase 6

Criação dos agentes de QA.

---

## Fase 7

Sistema de Capacidades.

---

## Fase 8

Sistema de Perfis.

---

## Fase 9

Instalação incremental.

---

## Fase 10

Suporte a novas IDEs.

---

# Objetivo Final

Transformar o POAI em uma plataforma de Engenharia de Software Assistida por IA, onde:

* todo o conhecimento fica centralizado em um único local (`.poai`);
* Claude, Cursor e futuras IDEs atuam apenas como adaptadores;
* desenvolvedores, QAs, arquitetos, Product Owners e DevOps utilizam a mesma base de conhecimento;
* novas IDEs podem ser suportadas sem alterar os agentes existentes;
* o POAI deixa de ser uma ferramenta específica para Claude Code e passa a ser uma plataforma corporativa de IA para todo o ciclo de desenvolvimento de software.

Essa arquitetura garante maior reutilização, menor custo de manutenção, padronização entre equipes e prepara o POAI para evoluir independentemente das mudanças no ecossistema de ferramentas de IA.
