# Política: Coding Principles

Princípios que os agentes `oai-kit-builder-agent` e `oai-kit-test-validator` não podem violar.

## Antes de Codar

- Declare hipóteses e interpretações múltiplas antes de escolher uma abordagem.
- Discorde honestamente se a abordagem proposta estiver errada — apresente alternativa.
- Leia integralmente cada arquivo a modificar antes de editar.

## Durante a Implementação

- **Zero features além do pedido.** Discoveries fora do escopo → state file como Deferred.
- **Zero abstrações desnecessárias.** 3 linhas similares não justificam uma abstração.
- **Mudanças cirúrgicas.** Altere apenas o mínimo necessário.
- **Integridade total dos testes.** Nunca delete ou enfraqueça testes existentes.
- **Padrões do arquivo.** Use o estilo e convenções já presentes no arquivo editado.

## Padrão de Commit (Obrigatório)

Formato Conventional Commits com contexto da Praxio:

```
{tipo}: {SIGLA_MODULO}_{SIM|PSE}_{numero_solicitacao} #{id_user_story_azure}

{breve descrição do que foi alterado}

US: #{id_feature_azure}
```

**Componentes:**
- `tipo` — `feat` para feature/melhoria, `fix` para correção de bug
- `SIGLA_MODULO` — sigla do módulo em maiúsculas (ex: FLP, CGS, CTR)
- `SIM|PSE` — tipo da solicitação
- `numero_solicitacao` — número do SAC
- `id_user_story_azure` — ID numérico da USER STORY no Azure DevOps
- `id_feature_azure` — ID numérico da FEATURE pai no Azure DevOps

**Exemplos:**

```
feat: FLP_SIM_94457 #54841

Adicionado novo método na controller de pagamentos

US: #54840
```

```
fix: CGS_SIM_94457 #54841

Corrigido cálculo de juros no boleto vencido

US: #54840
```

**Regras:**
- Linha 1 (título): máximo 72 caracteres.
- Linha 2: obrigatoriamente em branco.
- Linha 3 (descrição): o que foi feito, sem detalhes técnicos excessivos.
- Linha em branco.
- Última linha: `US: #{id_feature}`.
- Um commit por passo lógico — não aglomerar múltiplas mudanças.

## Padrões Obrigatórios por Stack

### .NET Core
- `async/await` em toda cadeia assíncrona — nunca `.Result` ou `.Wait()`.
- Injeção de dependência via interface — nunca `new` direto de serviços.
- `ILogger<T>` para logging — nunca `Console.WriteLine` em produção.
- Entity Framework: use migrations para qualquer mudança de schema.
- Nunca `SqlCommand` com string concatenada — sempre parâmetros.

### Node.js / TypeScript
- Tipagem estrita — nunca `any` explícito.
- `async/await` — nunca callbacks aninhados desnecessariamente.
- Variáveis de ambiente via `process.env` com validação na inicialização.
- Nunca query SQL construída por concatenação de string.

### React / Angular / Vue
- Componentes puros — sem side effects diretos em render/template.
- Estado centralizado em store quando compartilhado entre componentes.
- Nunca manipule o DOM diretamente em componentes React/Angular.

## Hard Stops (bloqueiam o pipeline)

- **AP-001:** Credencial hardcoded em qualquer arquivo.
- **AP-002:** SQL construído por concatenação de string.
- **AP-003:** `catch` vazio que engole exceção sem log.
- **AP-004:** Commit direto em `main`/`master`/`develop` sem PR.
