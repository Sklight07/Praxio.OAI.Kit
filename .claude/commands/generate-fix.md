# /generate-fix

Gera o patch mínimo para a task. Requer Checkpoint 1 aprovado.

**Uso:** `/generate-fix {ID_AZURE_TASK}`

## Sequência de Execução

### PASSO 1 — Verificar pré-condições
- `.oai-flow/analysis/{ID}-bugreport.md` existe?
- `.oai-flow/analysis/{ID}-impact.md` existe?
- Dev confirmou Checkpoint 1?

Se qualquer pré-condição falhar → PARE e informe.

### PASSO 2 — Validar políticas
Leia `.claude/policies/coding-principles.md` e `security-policy.md`.

### PASSO 3 — Architecture Agent (condicional)
Acione `architecture-agent` se qualquer uma das condições:
- Arquivo está no risk-map como ALTO.
- Fix afeta múltiplos módulos.
- Fix altera interface pública (endpoint, event schema).
- Fix contradiz ADR existente.

Se veredicto BLOQUEADO → PARE. Se APROVADO COM RESSALVAS → passe as ressalvas ao builder-agent.

### PASSO 4 — Builder Agent
Acione `builder-agent`. O agente:
1. Coleta sigla do módulo, SIM/PSE e IDs Azure (do ticket context ou perguntando ao dev)
2. Verifica e propõe branch no formato Praxio
3. Declara plano atômico com commits no formato Praxio
4. Executa RED → GREEN → VERIFY
5. Commita com formato: `{tipo}: SIGLA_SIM_NUMERO #{ID_US}\n\ndesc\n\nUS: #{ID_FEATURE}`

### ⚡ CHECKPOINT 2 — PARE AQUI
Apresente o patch ao dev para revisão.
**Aguarde aprovação antes de prosseguir para `/run-regression {ID}`.**
