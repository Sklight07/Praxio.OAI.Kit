# Diagnostic Guide — [DRAFT]

Tabela sintoma → suspeito imediato. Alimentada pelo `bootstrap-speckit.sh` e enriquecida pelo `learning-agent` após cada ticket.

## Como Usar

O `bug-investigator` lê este arquivo antes de qualquer Grep. Se o sintoma bater com uma entrada aqui, a hipótese H1 já está pré-definida.

## Tabela de Diagnóstico

| Sintoma | Suspeito Imediato | Módulo/Arquivo | Confirmado em |
|---------|------------------|----------------|---------------|
| [DRAFT] | [DRAFT] | [DRAFT] | - |

## Padrões Comuns por Stack

### .NET Core
| Sintoma | Suspeito |
|---------|---------|
| `NullReferenceException` sem stack trace claro | Objeto não injetado no DI container |
| `DbUpdateException` em cascata | Migration pendente ou constraint violada |
| Timeout em chamada HTTP | `HttpClient` instanciado manualmente (sem factory) |
| Deadlock em banco | Transações aninhadas sem `NOLOCK` ou `ReadCommitted` |

### Node.js / TypeScript
| Sintoma | Suspeito |
|---------|---------|
| `Cannot read property of undefined` | Await faltando em operação assíncrona |
| Memory leak gradual | Event listener não removido |
| Timeout em query | N+1 queries em loop |

### React / Angular
| Sintoma | Suspeito |
|---------|---------|
| Re-renders excessivos | Objeto/array criado em render sem `useMemo`/`useCallback` |
| Memory leak em SPA | Subscription não cancelada no destroy |
