# Prompt para o Claude Code — Imperial ERP (Império das Parmegianas)

Cole o texto abaixo no Claude Code junto com o arquivo `imperial-erp.jsx` (protótipo do frontend já validado).

---

Quero migrar o protótipo React em anexo (`imperial-erp.jsx`) para um sistema full-stack real e continuar construindo o **Imperial ERP**, um sistema de gestão para a **Império das Parmegianas**, uma empresa de delivery de parmegianas.

## Sobre o negócio

Delivery de parmegianas (frango e bovina) com produção própria em cozinha industrial. Vende direto (Pix, cartão, dinheiro) e por apps (iFood, Rappi). Precisa controlar: insumos (carnes, laticínios, molhos, embalagens), preparo/cozinha, pedidos, fornecedores, compras e financeiro — com rastreabilidade completa entre todos esses setores.

## Identidade visual (já implementada no protótipo, manter)

- Cor principal: bordô `#7A1420` (inspirado no brasão da marca — coroa, escudo, grinalda)
- Fundo sidebar: `#3D0007` (dark) / `#2B0005` (mais escuro ainda no dark mode)
- Neutros: branco, cinza claro (slate), cantos arredondados, visual minimalista
- Dark/light mode funcional
- Logo: brasão estilizado em SVG (componente `BrandCrest`), sem depender de arquivo de imagem externo

## Stack desejada

**Frontend:** React + TypeScript + TailwindCSS + Framer Motion (o protótipo atual é React puro com Tailwind + lucide-react + recharts — pode servir de base direta)
**Backend:** Node.js + NestJS + Prisma ORM
**Banco:** PostgreSQL
**Auth:** JWT + Refresh Token + RBAC (perfis: Administrador, Gerente, Cozinha, Compras, Financeiro, Estoque)
**Arquitetura:** DDD, SOLID, Repository Pattern, Service Layer, paginação, filtros, validações, tratamento de erros

## Módulos já prototipados no frontend (funcionais, com dados mockados em estado React)

1. **Dashboard** — cadeia de valor em tempo real (Compras → Estoque → Cozinha → Vendas → Financeiro), KPIs, gráfico receita x custo, margem, últimas movimentações, alertas de estoque baixo
2. **Estoque** — lista de insumos com busca, filtros, status (ok/atenção/baixo/crítico) calculado automaticamente por quantidade vs. estoque mínimo
3. **Cozinha / Preparo** (equivalente a "Produção") — kanban de ordens de preparo (aguardando / em preparo / concluídos), gráfico semanal de porções
4. **Vendas / Pedidos** — pedidos de delivery com cliente, endereço, forma de pagamento, status (em preparo, saiu para entrega, entregue, cancelado)
5. **Compras** — com 4 sub-abas:
   - **Pedidos de compra** — lista com status (recebido, parcial, pendente, cancelado)
   - **Cotações** — comparação automática de fornecedores (preço, prazo, frete, condições), destaque automático da melhor proposta por score (preço + frete rateado), botão para gerar pedido de compra a partir da cotação vencedora
   - **Compra manual (sem nota fiscal)** — formulário pra registrar compras avulsas (ex: comprado direto no açougue do bairro): insumo, quantidade, custo, fornecedor, forma de pagamento, observação. Ao registrar, dá entrada automática no estoque e gera uma movimentação
   - **Entrada por boleto** — formulário com insumo, quantidade, fornecedor, linha digitável, valor, vencimento. Ao registrar: dá entrada no estoque **e** cria automaticamente um título em Contas a Pagar
   - **Entrada por XML (NF-e)** — parser real de XML de NF-e feito no navegador com `DOMParser`, sem lib externa. Lê `<emit>` (fornecedor), `<det>/<prod>` (itens, quantidades, valores), `<dup>` (duplicatas/parcelas do boleto) e `<ICMSTot>` (valor total). Faz correspondência automática (fuzzy match por nome) entre o produto da nota e o insumo cadastrado no estoque, permite reajuste manual do vínculo, e ao confirmar: dá entrada em todos os itens marcados no estoque de uma vez e lança as parcelas (ou o valor total, se não houver duplicata) em Contas a Pagar
6. **Financeiro** — fluxo de caixa, contas a pagar/receber (abas), DRE resumido — já recebe automaticamente os lançamentos gerados pelas 3 formas de entrada de compra acima

## Regra de ouro já validada no protótipo (manter no backend)

**Compras, Estoque e Financeiro têm que "conversar" em tempo real.** Qualquer entrada de mercadoria (manual, boleto ou XML) precisa:
1. Atualizar a quantidade do insumo no estoque
2. Gerar um registro de movimentação (rastreabilidade / histórico)
3. Quando aplicável (boleto ou XML com duplicata), gerar automaticamente o título correspondente em Contas a Pagar

Essa integração hoje existe em memória (React state), via callbacks passados por prop entre os componentes `Compras`, `Estoque`, `Financeiro` e `Dashboard`. No backend, isso deve virar uma transação real no banco (ex: uma `PurchaseEntryService` que atualiza `Estoque`, `Movimentacao` e `ContaPagar` na mesma transação Prisma), com endpoints REST equivalentes.

## Módulos ainda não construídos no frontend (fazer depois, mesma qualidade visual)

Receitas / Ficha técnica, Fornecedores, Clientes, Relatórios (exportação Excel/PDF/CSV), Usuários (RBAC), Integrações (WhatsApp, Email SMTP, iFood, Rappi, Google Sheets), Configurações (empresa, tema, moeda, impostos, backup automático)

## Como quero que você comece

1. Leia o `imperial-erp.jsx` anexo pra entender a estrutura de componentes, nomenclatura e dados já usados
2. Proponha a modelagem do banco (schema Prisma) cobrindo as entidades já visíveis no protótipo: `Insumo`, `Movimentacao`, `OrdemPreparo`, `Pedido`, `PedidoCompra`, `Cotacao`, `CotacaoFornecedor`, `ContaPagar`, `ContaReceber`, `CompraManual`, `EntradaBoleto`, `NotaFiscalXml`
3. Depois, monte a estrutura do projeto (monorepo ou repos separados) e comece pelo backend: auth + módulo de Estoque + módulo de Compras (as 3 formas de entrada), já que é o núcleo testado
4. Em seguida, conecte o frontend real aos endpoints, mantendo a UI que já validamos

Pode ir fazendo perguntas conforme for encontrando decisões de arquitetura que dependam de mim.
