# Compras, cotacoes e WhatsApp

## Fluxo implementado

1. A aba **Cotacoes** lista automaticamente os itens cujo saldo esta abaixo do estoque minimo.
2. Uma cotacao pode conter varios produtos e varios fornecedores.
3. Cada fornecedor recebe um token aleatorio, exclusivo e com validade.
4. O WhatsApp e usado para enviar uma mensagem com o link do formulario. O sistema nao interpreta precos escritos livremente em mensagens.
5. O formulario publico funciona sem login e mostra somente a cotacao daquele fornecedor.
6. O fornecedor pode salvar rascunho, revisar, anexar documentos, enviar ou recusar a participacao.
7. Depois do envio, a proposta fica bloqueada. Um comprador pode gerar um novo link e uma nova versao quando precisar liberar edicao.
8. O comparativo destaca valores por produto e permite escolher fornecedores diferentes por item.
9. A finalizacao gera um pedido por fornecedor e armazena o PDF do pedido.
10. O recebimento registra mercadoria e nota fiscal sem alterar o estoque.
11. Somente **Confirmar entrada no estoque** soma os saldos, cria movimentacoes, atualiza custo medio, historico de precos e custos das receitas persistidas.
12. A confirmacao e idempotente: repetir a operacao nao duplica a entrada.

## Rotas publicas

- `GET /api/cotacoes-publicas/:token`
- `PATCH /api/cotacoes-publicas/:token/rascunho`
- `POST /api/cotacoes-publicas/:token/enviar`
- `POST /api/cotacoes-publicas/:token/recusar`

A pagina publica e servida em `/cotacao/:token`.

## WhatsApp

Quando as credenciais Meta nao estiverem configuradas, o ERP gera botoes `wa.me` com a mensagem e o link preenchidos. Quando estiverem configuradas, usa o template oficial e mantem os links manuais como contingencia.

Variaveis opcionais:

```env
WHATSAPP_ACCESS_TOKEN="..."
WHATSAPP_PHONE_NUMBER_ID="..."
WHATSAPP_GRAPH_VERSION="vXX.X"
WHATSAPP_COTACAO_TEMPLATE="cotacao_formulario"
WHATSAPP_VERIFY_TOKEN="..."
WHATSAPP_APP_SECRET="..."
PUBLIC_APP_URL="https://imperial-erp-alana.onrender.com"
COMPANY_NAME="Imperio das Parmegianas"
COMPANY_LOGO_URL="https://..."
```

O template deve receber nome do fornecedor, numero da cotacao, quantidade de itens, prazo e um botao de URL dinamica com o token.

## Seguranca e auditoria

- token nao previsivel de 256 bits;
- validade e cancelamento do link;
- isolamento de fornecedor e cotacao;
- registro de IP e agente do acesso quando disponiveis;
- bloqueio depois do envio;
- logs de criacao, resposta, recusa, finalizacao, recebimento e entrada;
- cancelamento logico de pedidos;
- entrada no estoque com trava atomica contra duplicidade.

## Banco de dados

A migration `20260720000500_cotacoes_whatsapp_compras` e somente aditiva. Ela preserva as tabelas e os registros anteriores, amplia `Cotacao`, `CotacaoFornecedor` e `PedidoCompra` e cria as estruturas de itens, respostas, acessos, recebimentos, historico de precos e auditoria.
