# Política: Branch Naming

## Formato Canônico

O formato depende da **branch de origem**:

| Branch de Origem | Prefixo | Exemplo |
|-----------------|---------|---------|
| `develop` ou `feature` | `feature/` | `feature/FLP_SIM_954783` |
| `master`, `main` ou `hotfix` | `hotfix/` | `hotfix/CGS_PSE_79548` |

**Estrutura:**
```
{prefixo}/{SIGLA_MODULO}_{SIM|PSE}_{numero_solicitacao}
```

**Componentes:**
- `SIGLA_MODULO` — sigla do módulo em maiúsculas (ex: FLP, CTR, CGS, FIN, RH)
- `SIM` ou `PSE` — tipo da solicitação
- `numero_solicitacao` — número gerado pelo SAC (ex: 954783)

## Exemplos Válidos

```
feature/FLP_SIM_9546
feature/CTR_SIM_49734
feature/CGS_PSE_79548
hotfix/FLP_SIM_9546
hotfix/CTR_PSE_49734
```

## Regex de Validação

```
^(feature|hotfix)\/[A-Z]{2,6}_(SIM|PSE)_\d+$
```

## Responsabilidade do Builder Agent

Antes do primeiro commit, o `builder-agent` deve:

1. Verificar o branch atual.
2. Se não seguir o padrão → coletar as informações necessárias:
   - **Sigla do módulo** (ex: FLP) — sempre perguntar, não inferir.
   - **Tipo da solicitação** — SIM ou PSE.
   - **Número da solicitação** — número do SAC.
   - **Branch de origem** — develop/feature → `feature/`; master/main/hotfix → `hotfix/`.
3. Propor o nome correto e aguardar o dev criar o branch.
4. Nunca commitar em branch com nome inválido.

> O agente nunca assume a sigla do módulo — sempre pergunta ao dev antes de propor o nome do branch.
