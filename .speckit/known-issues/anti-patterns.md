# Anti-Patterns

Padrões a não replicar. O `architecture-agent` verifica este arquivo antes de aprovar qualquer fix.

## AP-001 — Credencial Hardcoded

- **Descrição:** Senhas, tokens ou connection strings diretamente no código.
- **Por que é ruim:** Exposição em repositório, impossibilidade de rotacionar sem deploy.
- **Correto:** Variáveis de ambiente / `appsettings.json` com override por env / Azure Key Vault.
- **Detectado em:** Adicionado na instalação do kit.

## AP-002 — SQL por Concatenação de String

- **Descrição:** Query SQL montada concatenando input do usuário.
- **Por que é ruim:** SQL Injection. Causa mais comum de breach de dados.
- **Correto:** Parâmetros SQL / ORM / Stored Procedures com bind variables.
- **Detectado em:** Adicionado na instalação do kit.

## AP-003 — Catch Vazio

- **Descrição:** `catch` que não loga nem relança a exceção.
- **Por que é ruim:** Engole erros silenciosamente, impossibilita diagnóstico.
- **Correto:** Sempre logue com contexto ou relance com informação adicional.
- **Detectado em:** Adicionado na instalação do kit.

## AP-004 — HttpClient Instanciado Manualmente (.NET)

- **Descrição:** `new HttpClient()` dentro de um serviço ou controller.
- **Por que é ruim:** Exaure sockets (TIME_WAIT), ignora DNS refresh.
- **Correto:** Injetar `IHttpClientFactory` e usar `CreateClient()`.
- **Detectado em:** Adicionado na instalação do kit.

---

> Novos anti-patterns são adicionados pelo `learning-agent` após cada ticket que revela um novo padrão problemático.
