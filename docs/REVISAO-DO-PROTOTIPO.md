# Revisão do protótipo original

## Pontos fortes preservados

- Identidade visual consistente e responsiva.
- Navegação simples para um produto operacional complexo.
- Boa representação da cadeia Compras → Estoque → Cozinha → Vendas → Financeiro.
- Parser de NF-e útil para pré-visualização e vínculo manual de itens.
- Regras de status de estoque fáceis de entender.

## Riscos encontrados e tratamento no MVP

| Risco do protótipo | Tratamento implementado |
| --- | --- |
| Dados desaparecem ao recarregar | API + PostgreSQL |
| Atualizações por callbacks podem ficar parciais | Transação Prisma única |
| Mesma NF-e pode entrar duas vezes | Chave de acesso única e resposta de conflito |
| Sem autenticação/autorização | JWT, refresh token e RBAC |
| Valores monetários em ponto flutuante | `Decimal` no banco |
| Sem rastreabilidade durável | Movimentação com saldo anterior/posterior, origem e referência |
| Formulários aceitam payload livre | DTOs com validação e whitelist global |
| Backend indisponível quebra a demonstração | Modo local com aviso de status |

## Limites conscientes desta entrega

- O frontend usa login automático apenas para facilitar o ambiente inicial; a tela de login deve ser a próxima história antes de produção.
- O XML é interpretado no navegador para manter a experiência do protótipo. Em produção, o servidor deve validar schema, assinatura, CNPJ e autorização de uso da NF-e.
- Os módulos futuros continuam sinalizados na interface; a modelagem já prepara cozinha, vendas, pedidos de compra e cotações.
- O estoque mantém o saldo materializado e o histórico. Uma evolução recomendada é reconciliação periódica e bloqueio otimista para operações de alto volume.
