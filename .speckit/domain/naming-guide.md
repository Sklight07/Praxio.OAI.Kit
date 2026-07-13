# Naming Guide — [DRAFT]

Nomes que enganam, glossário de domínio e enums críticos. Lido pelo `bug-investigator` antes de qualquer busca.

## Nomes que Mentem

> Classes, métodos ou variáveis cujo nome não representa bem o que fazem.

| Nome | O que realmente faz | Onde fica |
|------|--------------------|----|
| [DRAFT] | [DRAFT] | [DRAFT] |

## Glossário de Domínio

| Termo no Código | Significado de Negócio | Observação |
|----------------|----------------------|-----------|
| [DRAFT] | [DRAFT] | [DRAFT] |

## Enums e Constantes Críticos

| Nome | Valores | Impacto se Errado |
|------|---------|------------------|
| [DRAFT] | [DRAFT] | [DRAFT] |

## Convenções de Nomenclatura do Projeto

### .NET
- Controllers: `{Entidade}Controller`
- Services: `{Entidade}Service` / `I{Entidade}Service`
- Repositories: `{Entidade}Repository` / `I{Entidade}Repository`
- DTOs: `{Entidade}Dto` / `{Entidade}Request` / `{Entidade}Response`

### Node.js / NestJS
- Módulos: `{feature}.module.ts`
- Controllers: `{feature}.controller.ts`
- Services: `{feature}.service.ts`
- Entities: `{feature}.entity.ts`

### React
- Componentes: PascalCase (`UserCard.tsx`)
- Hooks customizados: `use{Nome}.ts`
- Stores (Zustand/Redux): `{feature}Store.ts`
