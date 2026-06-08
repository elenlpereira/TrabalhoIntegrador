# Trabalho Integrador - Programação II

Sistema de gerenciamento de bar para controle operacional e financeiro.

## Funcionalidades

- CRUD de usuário
- CRUD de cliente
- CRUD de fornecedores
- CRUD de produto
- Compras (entrada de estoque com rastreamento de fornecedor e NF)
- Saída manual do estoque (devolução, quebra, vencimento, erro operacional)
- Saída automática por venda
- Comanda (conta): abertura, adição/edição/remoção de itens, fechamento e cancelamento
- Controle de estoque com reserva por comandas abertas
- Registro automático de saídas ao fechar comanda

## Regras de negócio

- **Usuários** possuem perfil `Atendente` ou `Gerente`. A senha é armazenada com hash bcrypt.
- **Clientes** são identificados por CPF único. O registro `id=1 / Consumidor Final` é reservado e não pode ser editado nem removido — é usado como cliente padrão nas comandas quando nenhum cliente é informado.
- **Fornecedores** são cadastrados por CNPJ único e vinculados a uma categoria de produto (`bebidas`, `alimentos`, `mercearia`, `outros`).
- **Produtos** pertencem a um fornecedor e possuem estoque mínimo. 
- **Compras** registram a entrada de mercadorias: incrementam o estoque do produto e preservam os dados do fornecedor e do produto de forma desnormalizada (nome salvo no registro), garantindo histórico mesmo que o produto ou fornecedor seja alterado.
- **Saídas** são feitas de forma automática pelo sistema ou inseridas manualmente.
	- Saídas manuais registram perdas fora do fluxo de vendas (quebra, vencimento, devolução, erro operacional) e decrementam o estoque imediatamente.
	- Saída automática por venda: gerada ao fechar uma comanda — uma saída `origem=venda` é criada para cada item da comanda
	- Saídas por venda não podem ser removidas manualmente; o estorno só ocorre via cancelamento ou edição da comanda antes do fechamento
- Ao **remover ou editar a quantidade** de um item em uma comanda ainda aberta, um registro de `estorno_venda` é criado automaticamente e o estoque é devolvido


- **Comandas** controlam o pedido em mesa ou balcão. Enquanto abertas, os produtos ficam reservados sem baixar o estoque físico. O estoque só é deduzido no **fechamento** da comanda. Comandas canceladas não movimentam estoque.
- Uma comanda não pode ser fechada sem itens. Após fechada ou cancelada, não pode ser alterada.
- A quantidade disponível de um produto considera o estoque físico menos o total reservado em todas as **outras** comandas abertas.

## Perfis e permissões (a serem aplicadas)
 
O sistema possui dois perfis de acesso: **Atendente** e **Gerente**.
 
#### Atendente
 
- Consultar e gerenciar clientes
- Abrir, editar e cancelar comandas
- Adicionar, editar e remover itens de uma comanda
- Fechar comandas
- Registrar pagamentos
- Consultar fichas
#### Gerente
 
Possui todas as permissões do Atendente, além de:
 
- Gerenciar usuários (criar, editar, remover)
- Gerenciar fornecedores
- Gerenciar produtos (criar, editar, remover)
- Registrar e estornar compras
- Registrar saídas manuais de estoque
- Quitar fichas de clientes


## Stack: 
- **Sequelize**: ORM para mapeamento objeto-relacional e execução de queries.
- **PostgreSQL**: banco de dados relacional.
- **dotenv**: gerenciamento de variáveis de ambiente.
- **bcryptjs**: hash de senhas de usuários.

## Estrutura do projeto

```
config/
  localConnection.js   # instância Sequelize (lê variáveis do .env)
  config.json          # credenciais para o sequelize-cli 
migrations/            # DDL versionado — cria/remove as tabelas
seeders/               # dados iniciais (ex.: Consumidor Final)
src/
  app.js               # configuração do Express e rotas
  controllers/         # recebem req/res e delegam ao model
  models/
    index.js           # carrega todos os models e define associações
    *.js               # cada model define o schema Sequelize e funções async
  routes/              # mapeamento de URL → controller
```

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- `npx` disponível (incluso no npm 5.2+)

## Configuração e conexão com o banco de dados

### 1. Instalar as dependências

```bash
npm install
```

### 2. Criar o arquivo `.env`

Copie o template e preencha com as suas credenciais:

```bash
cp .env.example .env
```

### 3. Criar o banco de dados no PostgreSQL

```bash
createdb -U postgres prog2
# ou via psql:
psql -U postgres -c "CREATE DATABASE prog2;"
```

### 4. Criar o `config/config.json` (necessário para o sequelize-cli)

Este arquivo já está criado nesse projeto. Altere para suas credencias. 

### 5. Executar as migrations (cria as tabelas)

```bash
npx sequelize-cli db:migrate
```

Tabelas criadas: `usuario`, `cliente`, `fornecedor`, `produto`, `compra`, `saida`, `comanda`, `comanda_item`.

### 6. Inserir dados no banco

```bash
npx sequelize-cli db:seed:all
```

Isso insere o registro `id=1 / Consumidor Final` na tabela `cliente` (obrigatório para o funcionamento das comandas) e popula todas as tabelas com 5 registros de teste cada — fornecedores, usuários, clientes, produtos, compras, saídas manuais, comandas e itens de comanda — mantendo coerência entre as chaves estrangeiras.

Para desfazer os seeds:

```bash
npx sequelize-cli db:seed:undo:all
```

### Acessar o DB 

```bash
psql -h 127.0.0.1 -U postgres -d prog2
```

## Inicialização do servidor

Iniciar em desenvolvimento (com reinicialização automática):

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT`).

## Rotas disponíveis

| Prefixo               | Recurso      |
|-----------------------|--------------|
| `/api/usuarios`       | Usuários     |
| `/api/clientes`       | Clientes     |
| `/api/fornecedores`   | Fornecedores |
| `/api/produtos`       | Produtos     |
| `/api/compras`        | Compras      |
| `/api/saidas`         | Saídas       |
| `/api/comandas`       | Comandas     |
| `/api/pagamentos`     | Pagamentos   |
| `/api/ficha`          | Fichas       |

