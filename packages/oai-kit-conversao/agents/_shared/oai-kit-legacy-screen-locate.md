# Shared: Legacy Screen Locate Protocol — OAI Kit Conversão

Protocolo reutilizado por `oai-kit-conversao-triagem` (Modo A) quando a task do Azure não traz os arquivos Delphi da tela anexados. Localiza o conjunto completo de arquivos da tela no repositório legado (`conversao.legacyRepoPath`) a partir do nome da tela/menu citado na task.

## Contexto — dois estilos coexistem no legado

- **Clássico**: 1 `.pas` + 1 `.dfm`, prefixo de sigla (`BGM_`, `CTR_`, `ARR`, etc.).
- **Moderno (Clean Architecture)**: namespace `Modulo.Submodulo.Funcionalidade.Camada.pas` (ex: `Ctr.Cadastro.Empresa.View.pas`), com View/Presenter/Service/Repository/UseCase **em arquivos separados**.

**Nunca assuma qual estilo a tela usa antes de procurar** — o resultado da busca é que determina isso.

## Processo de Busca

### 1. Buscar pelo nome da tela/menu

Use `Grep`/`Glob` no `legacyRepoPath` pelo nome ou termo da tela citado na task (título, menu, ou termo de negócio). Procure em:
- Arquivos `.dfm` com `Caption` correspondente.
- Arquivos de menu (`*MenuPrincipal.pas/.dfm`) que referenciem a tela por item de menu.
- Nome de arquivo/classe que corresponda ao termo (considerando siglas e variações — mas **nunca** por aproximação/fuzzy match; se não achar por nome exato ou correspondência clara, é `GAP`, não uma adivinhação).

### 2. Identificar o entrypoint e navegar de forma controlada

A partir do arquivo mais provável (a View, ou o `.pas` clássico):
- Se **clássico**: o `.pas` + `.dfm` geralmente é suficiente. Verifique `uses` para dependências relevantes (DataModules, `Componentes10/`, `Utilitarios/`) — registre-as como contexto, não como escopo da tela.
- Se **moderno**: siga o namespace (`Modulo.Submodulo.Funcionalidade.*`) para achar os arquivos irmãos (`.View.pas`, `.Service.pas`, `.Repository.pas`, `.UseCase.pas`, etc.) — **todos pertencem ao mesmo conjunto da tela**, leia todos antes de considerar a busca concluída.
- Se `conversao.graphifyConfigured` for `true`, prefira `graphify path "<EntidadeA>" "<EntidadeB>"` / `graphify explain "<Conceito>"` para traçar essas conexões automaticamente em vez de seguir `uses` manualmente — especialmente útil no estilo moderno multi-arquivo. Ainda não está confirmado que o parser cobre Object Pascal por completo; se o resultado parecer incompleto ou incoerente, volte para a busca manual por `uses`.

### 3. Regra anti-scope-creep

Não transforme uma tela de módulo irmão em escopo desta conversão só porque ela aparece referenciada (`uses`, mesmo DataModule, mesmo menu). Arquivos de módulos irmãos são contexto/dependência, não escopo — a menos que o dev confirme explicitamente que também fazem parte desta tela.

### 4. Confirmação obrigatória com o dev

**Antes de prosseguir para a classificação de arquétipo**, apresente o conjunto de arquivos encontrado e pergunte:

```
Localizei os seguintes arquivos para a tela "[nome/menu citado na task]":
  • [caminho1] — [papel: View/Service/Repository/UseCase/clássico]
  • [caminho2] — ...

Está correto? (sim/não)
```

Errar a identificação da tela aqui invalida todo o resto da conversão — não pule esta confirmação mesmo em telas aparentemente óbvias.

### 5. Se não encontrar

Se a busca não encontrar nenhum candidato claro (nome exato ou correspondência inequívoca de menu/caption), **não adivinhe**. Informe ao dev:

```
⚠️ TELA NÃO LOCALIZADA NO REPOSITÓRIO LEGADO
═══════════════════════════════════════════
Busquei por "[termo]" em [legacyRepoPath] e não encontrei um candidato claro.

Para continuar, escolha:
  a) Informe o caminho exato do(s) arquivo(s) da tela
  b) Informe outro termo de busca (nome de menu, caption, classe)
  c) "não sei localizar" — registro como GAP e paro aqui
═══════════════════════════════════════════
```

## Restrições Absolutas

- Nunca adivinhe por aproximação de nome — nome exato/correspondência inequívoca, ou `GAP`.
- Nunca prossiga para a triagem sem a confirmação explícita do PASSO 4.
- Nunca amplie o escopo da conversão para telas de módulos irmãos sem confirmação do dev.
- Nunca dependa do Graphify como única fonte — se configurado e o resultado parecer incompleto, valide com busca manual.
