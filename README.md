# Imperial ERP

MVP full-stack do sistema de gestão da **Império das Parmegianas**. O projeto mantém o protótipo visual validado e adiciona uma API NestJS com autenticação, RBAC e persistência PostgreSQL via Prisma.

## O que está pronto

- Frontend React responsivo, com tema claro/escuro e os módulos do protótipo.
- Login JWT + refresh token e perfis de acesso.
- Estoque e histórico de movimentações.
- Compras manual, por boleto e por XML de NF-e.
- Transações atômicas: entrada de compra atualiza estoque, cria movimentação e, quando necessário, cria contas a pagar.
- Financeiro com consulta de contas a pagar.
- Modelagem Prisma para estoque, compras, cotações, cozinha, pedidos e financeiro.
- Modo demonstração: a interface continua utilizável sem API; com `VITE_API_URL`, passa a sincronizar com o backend.

## Executar localmente

Requisitos: Node.js 22+, npm e Docker.

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000/api
- Saúde da API: http://localhost:3000/api/health

Usuário inicial: `admin@imperial.local`
Senha inicial: `Imperial@123`

Troque as credenciais e os segredos JWT antes de qualquer publicação.

## Endpoints principais

| Método | Rota | Uso |
| --- | --- | --- |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Renovar tokens |
| GET | `/api/estoque/insumos` | Listar insumos com filtros e paginação |
| GET | `/api/estoque/movimentacoes` | Rastreabilidade do estoque |
| POST | `/api/compras/manual` | Entrada manual sem NF |
| POST | `/api/compras/boleto` | Entrada + conta a pagar |
| POST | `/api/compras/xml` | NF-e com múltiplos itens e parcelas |
| GET | `/api/financeiro/contas-pagar` | Contas a pagar |

## Arquitetura

O backend está dividido em módulos por domínio. A classe `PurchaseEntryService` é o núcleo de integração: cada entrada executa dentro de uma única transação Prisma. Se qualquer etapa falhar, nenhuma alteração parcial é confirmada.

Consulte [docs/ARQUITETURA.md](docs/ARQUITETURA.md) para decisões e entidades, e [docs/REVISAO-DO-PROTOTIPO.md](docs/REVISAO-DO-PROTOTIPO.md) para a revisão técnica e os limites do MVP.
