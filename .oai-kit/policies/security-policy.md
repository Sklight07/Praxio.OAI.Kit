# Política: Security Policy

Verificações obrigatórias do `oai-kit-builder-agent` e `oai-kit-architecture-agent`. Violações são hard stops.

## Proibições Absolutas

### AP-001 — Credenciais Hardcoded
Nunca:
```csharp
var connectionString = "Server=prod;Password=123456;";
```
Sempre:
```csharp
var connectionString = _configuration.GetConnectionString("Default");
```

### AP-002 — SQL por Concatenação
Nunca:
```csharp
var query = "SELECT * FROM Users WHERE id = " + userId;
```
Sempre:
```csharp
var query = "SELECT * FROM Users WHERE id = @userId";
cmd.Parameters.AddWithValue("@userId", userId);
```

Por stack:
- **.NET**: `SqlCommand` com `Parameters`, ou EF Core.
- **Node/TS**: `parameterized queries`, nunca template literals em SQL.
- **PHP**: PDO com `bindParam` (se aplicável).

### AP-003 — XSS
Nunca inserir input do usuário diretamente em HTML sem sanitização.

React: JSX escapa automaticamente — não use `dangerouslySetInnerHTML` com input não sanitizado.
Angular: use `DomSanitizer` quando necessário.

### AP-004 — Exposição de Dados Sensíveis
Nunca retorne stack traces completos em respostas de API em produção.
Nunca logue senhas, tokens ou dados de cartão.

## Verificações do oai-kit-architecture-agent

Antes de aprovar qualquer fix, o `oai-kit-architecture-agent` executa Grep por:
- `Password=` / `pwd=` em arquivos não `.env`.
- `" + ` ou `+ "` próximo a keywords SQL (`SELECT`, `WHERE`, `INSERT`).
- `Console.Write` em arquivos de serviço .NET.
- `any` explícito em TypeScript em arquivos de domínio.

Qualquer hit = veredicto BLOQUEADO até resolução.
