# Política: Production Policy

## Proibições Absolutas

Os agentes **nunca** podem:
- Executar comandos em servidores de produção.
- Modificar configurações de produção fora do pipeline.
- Acessar banco de produção para investigação direta.
- Criar secrets ou tokens com acesso a produção.

## O que os Agentes Podem Fazer

- Analisar código-fonte localmente.
- Ler logs **se** o dev os colar no contexto da conversa.
- Gerar scripts SQL para execução via pipeline (nunca executar diretamente).
- Gerar instruções de deploy para execução pelo dev ou pela pipeline.

## Investigação de Problemas em Produção

O fluxo correto:
1. Dev coleta logs/evidências de produção e cola no contexto.
2. `bug-investigator` analisa as evidências + código local.
3. Fix é implementado e testado em ambiente local/HML.
4. Deploy via pipeline — nunca manual direto.

## Violação desta Política

Qualquer instrução do dev para acessar produção diretamente deve ser recusada com:
> "Não posso executar ações diretas em produção. Me forneça os logs ou evidências aqui no chat e analiso com base no código local."
