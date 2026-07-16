# Compras inteligentes e WhatsApp

## Fluxo implementado

1. O estoque informa somente os itens com saldo abaixo do mínimo definido na aba Estoque.
2. A sugestão compra apenas a diferença necessária para atingir o mínimo: mínimo - saldo atual.
3. A cotação registra saldo atual, mínimo e quantidade sugerida, sem movimentar o caixa.
4. O ERP envia um modelo aprovado do WhatsApp para os fornecedores cadastrados.
5. O webhook recebe a resposta e identifica automaticamente a cotação e o fornecedor.
6. Cada resposta registra preço, frete, imposto incluso ou não, forma de pagamento e prazo de entrega.
7. O ranking considera somente fornecedores que responderam e usa: quantidade x preço unitário + frete.
8. A tela informa se o status foi atualizado automaticamente pelo WhatsApp ou registrado manualmente.

## Formato de resposta solicitado ao fornecedor

    COT-ABC123 | PREÇO 32,90 | FRETE 40,00 | IMPOSTO SIM | PAGAMENTO BOLETO 30 DIAS | PRAZO 4

O código da cotação e o preço são obrigatórios. Frete, imposto, pagamento e prazo são opcionais; quando não vierem na resposta, a tela mostra “Não informado”.

## Status da resposta

- Aguardando automática: o fornecedor ainda não respondeu.
- Respondido automático: resposta recebida e processada pelo webhook do WhatsApp.
- Respondido manual: resposta registrada por um usuário do ERP.

## Variáveis necessárias

    WHATSAPP_ACCESS_TOKEN="token com whatsapp_business_messaging"
    WHATSAPP_PHONE_NUMBER_ID="id do telefone registrado"
    WHATSAPP_GRAPH_VERSION="versão ativa configurada no app Meta"
    WHATSAPP_COTACAO_TEMPLATE="cotacao_fornecedor"
    WHATSAPP_VERIFY_TOKEN="segredo usado no handshake do webhook"
    WHATSAPP_APP_SECRET="segredo do aplicativo Meta"

O modelo cotacao_fornecedor deve ser aprovado em pt_BR e possuir quatro parâmetros no corpo, nesta ordem:

1. Código da cotação
2. Nome do item
3. Quantidade
4. Unidade

## Webhook

Callback público HTTPS:

    https://SEU-DOMINIO/api/webhooks/whatsapp

A aplicação valida X-Hub-Signature-256, registra cada mensagem uma única vez e não executa compras automaticamente. A seleção final e a geração do pedido continuam sob controle do usuário.

## Banco de dados

Depois de disponibilizar PostgreSQL e configurar DATABASE_URL:

    npm.cmd run db:migrate
    npm.cmd run db:seed

## Estado atual

Nenhuma mensagem real foi enviada. Sem API, a interface funciona em modo local e mostra dados de demonstração.