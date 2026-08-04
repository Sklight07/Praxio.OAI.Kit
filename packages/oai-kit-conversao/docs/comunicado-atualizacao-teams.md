# Comunicado de atualização — modelo para o Teams

Mensagem padrão para avisar o time sempre que `praxio-oai-kit-conversao` for publicado numa nova versão e a `develop` de um repo GlobusWeb (via `praxio-oai-kit-conversao@latest update`) e a `master` do `GlobusEvo.Minerva` já tiverem sido sincronizadas.

## Modelo

```
Boa tarde, pessoal! Atualizei os seguintes pacotes e projetos:

📦 praxio-oai-kit-conversao: [versão anterior] → [versão nova]
[resumo de 1-2 linhas do que mudou nesta versão]

✅ Já rodei o update e atualizei a branch DEVELOP de: [repo1, repo2, ...]
✅ GlobusEvo.Minerva: branch MASTER atualizada com as novas diretrizes desta versão

👉 Por favor, sincronizem a develop desses repos (e a master do Minerva) para seguir com o fluxo de trabalho mais atual.

Obs: se você já tem uma branch aberta agora, não precisa atualizar com a develop — só em casos excepcionais que realmente precisem das novidades desta versão.
```

## Como preencher

- **Resumo**: 1-2 linhas, foco no que muda no dia a dia do dev (não é o changelog inteiro — para detalhe completo, apontar para `CHANGELOG.md` do pacote).
- **Lista de repos**: só os que você já rodou `update` e sincronizou de fato antes de mandar a mensagem.
- **Obs final**: manter sempre — evita que devs no meio de uma feature rebasem à toa.

## Histórico de comunicados enviados

### 0.1.10 — 2026-08-03

```
Boa tarde, pessoal! Atualizei os seguintes pacotes e projetos:

📦 praxio-oai-kit-conversao: 0.1.9 → 0.1.10
Ajustes no padrão Grid+Modal: checagem cross-repo de referência estrutural, verificação de props do DataGridSearchServer (evita filtro de coluna morto), e regra de branch/commit no gate final de paridade (nunca commitar direto em develop/master/main).

✅ Já rodei o update e atualizei a branch DEVELOP de: GlobusWeb.Folha
✅ GlobusEvo.Minerva: branch MASTER atualizada com as novas diretrizes desta versão

👉 Por favor, sincronizem a develop desses repos (e a master do Minerva) para seguir com o fluxo de trabalho mais atual.

Obs: se você já tem uma branch aberta agora, não precisa atualizar com a develop — só em casos excepcionais que realmente precisem das novidades desta versão.
```

### 0.1.9 — 2026-08-03

```
Boa tarde pessoal atualizei os seguintes pacotes e projetos:

praxio-oai-kit-conversao: 0.1.8 > 0.1.9
com a atualizacao acima ja atualizei a branch DEVELOP do projeto GlobusWeb.Folha, por favor sincronizem a branch develop para obter as atualizoes e seguirem com o fluxo de trabalho mais atual. (obs: Se voce ja tem um branch aberta no momento nao é necessario atualizar sua branch com a develop, somente em casos excepcionais, que precisem das novas atualizacoes  oai-kit)
GlobusEvo.Minerva branch MASTER atualizada com novas diretrizes em acordo com a versão 0.1.9 do praxio-oai-kit-conversao. Bastar sincronizar a master.
```
