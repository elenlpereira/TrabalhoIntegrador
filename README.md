# Sistema de Gerenciamento de Bar — Trabalho Integrador

Sistema web para gerenciamento operacional e financeiro de bar, desenvolvido como trabalho integrador da disciplina GEX613 — Programação II (UFFS).

## Funcionalidades implementadas

### Autenticação e controle de acesso
- Login com e-mail e senha (JWT, validade de 8 horas)
- Dois perfis: Atendente e Gerente
- Rotas protegidas no backend (middleware JWT) e no frontend (componente `RotaProtegida`)
- Botão Sair limpa sessão e redireciona para login

### Comandas
- Abertura de comanda com identificação livre (mesa, nome, etc.)
- Adição, edição e remoção de produtos com atualização automática do estoque
- Fechamento com escolha de forma de pagamento (dinheiro, pix, débito, crédito, a prazo)
- Cancelamento — devolve todos os itens ao estoque
- Histórico de comandas fechadas/canceladas com filtro por status
- Pagamento "à prazo" vincula um cliente e gera débito na ficha

### Estoque
- CRUD de produtos (nome, categoria, preço de custo/venda, estoque mínimo)
- Estoque decrementado automaticamente ao **adicionar** item em comanda
- Estoque devolvido ao **remover** item ou **cancelar** comanda
- Alerta visual para produtos com estoque abaixo do mínimo
- Filtro por categoria e ordenação por qualquer coluna

### Compras (Entrada de estoque)
- Registro de compra vincula produto + fornecedor + quantidade + custo unitário + data
- Incrementa o estoque do produto imediatamente
- Estorno de compra reverte a entrada do estoque

### Clientes e Fornecedores
- CRUD de clientes com CPF único; "Consumidor Final" (id=1) é protegido
- CRUD de fornecedores com CNPJ único e categoria de produtos fornecidos
- Busca por nome, CPF/CNPJ

### Fichas (Débitos a prazo)
- Geração automática de débito ao fechar comanda com pagamento "a prazo"
- Quitação total ou parcial com registro de valor pago e saldo devedor
- Extrato por cliente (histórico de débitos e pagamentos)

### Usuários
- CRUD de usuários restrito a Gerentes
- Senha armazenada com hash bcrypt; confirmação obrigatória no cadastro
- Restrição para não deletar o próprio usuário nem alterar o próprio perfil

### Dashboard e Relatórios
- Cards de resumo: comandas abertas, fechadas hoje, fichas pendentes, ações de auditoria
- Comandas abertas em tempo real (atualização automática a cada 30s)
- Produtos com estoque abaixo do mínimo
- Vendas por produto e forma de pagamento (filtro por período)
- Clientes com fiado pendente e saldo devedor real

### Auditoria (Logs)
- Registro automático de todas as ações relevantes: login, cadastros, edições, remoções, movimentações de estoque e comandas
- Filtro por período (UTC-3) e por tipo de ação (checkboxes múltiplos)
- Clique em `#id_comanda` abre a comanda diretamente

## Regras de negócio

### Estoque
- Ao **adicionar** produto em comanda aberta → estoque físico decrementado imediatamente
- Ao **editar quantidade** de item (aumentar) → desconta a diferença do estoque
- Ao **editar quantidade** (diminuir) ou **remover item** → devolve ao estoque
- Ao **cancelar** comanda → devolve todos os itens ao estoque
- Ao **fechar** comanda → nenhuma movimentação adicional (já foi decrementado na adição)
- Ao **registrar compra** → incrementa o estoque do produto
- Ao **estornar compra** → decrementa o estoque na mesma quantidade

### Comandas
- Podem ser abertas sem vínculo de cliente (usa "Consumidor Final" como padrão)
- Não podem ser fechadas sem nenhum item
- Após fechadas ou canceladas, não podem ser alteradas
- Pagamento "a prazo" exige vínculo com cliente cadastrado (diferente de Consumidor Final) e gera débito na ficha

### Clientes
- O registro `id=1 / Consumidor Final` é protegido — não pode ser editado nem removido
- CPF deve ser único; e-mail é opcional mas também deve ser único quando informado
- Não é possível remover cliente com comandas vinculadas

### Usuários
- Perfis válidos: `Atendente` e `Gerente`
- Senha mínima de 6 caracteres, armazenada com bcrypt
- Gerente não pode remover a própria conta nem alterar o próprio perfil de acesso

### Fichas
- Criadas automaticamente ao fechar comanda com forma "a prazo"
- Status: `pendente` → `pago_parcial` → `pago`
- O saldo devedor é calculado campo a campo na tabela `divida`

## Perfis e permissões

| Módulo | Atendente | Gerente |
|--------|-----------|---------|
| Dashboard | ✅ | ✅ |
| Consumo (comandas) | ✅ | ✅ |
| Clientes | ✅ | ✅ |
| Estoque (visualizar/editar) | ✅ | ✅ |
| Fichas / Débitos | ✅ | ✅ |
| Compras | ❌ | ✅ |
| Fornecedores | ❌ | ✅ |
| Usuários | ❌ | ✅ |
| Logs de auditoria | ❌ | ✅ |

## Stack

### Backend
- **Node.js + Express 5**: servidor HTTP e roteamento.
- **Sequelize 6**: ORM para mapeamento objeto-relacional e queries.
- **PostgreSQL**: banco de dados relacional.
- **jsonwebtoken**: geração e validação de tokens JWT.
- **bcryptjs**: hash de senhas.
- **dotenv**: variáveis de ambiente.
- **cors**: habilitação de CORS para o frontend.

### Frontend
- **React 19**: biblioteca de interface.
- **Vite**: bundler e servidor de desenvolvimento.
- **React Router DOM 7**: navegação entre páginas.
- **Axios**: cliente HTTP com interceptor JWT automático.

## Estrutura do projeto

```
config/
  localConnection.js      # instância Sequelize (lê .env)
  config.json             # credenciais para o sequelize-cli
docs/
  autenticacao.md         # documentação do sistema de auth e credenciais padrão
migrations/               # DDL versionado — cria/remove tabelas
seeders/                  # dados iniciais (Consumidor Final + dados de teste)
src/
  app.js                  # Express: middlewares, CORS, rotas, error handler
  middlewares/
    autenticar.js         # verifica JWT em todas as rotas protegidas
    autorizarGerente.js   # bloqueia não-Gerentes com 403
  controllers/            # recebem req/res e delegam ao model
  models/
    index.js              # carrega todos os models e define associações
    *.js                  # schema Sequelize + funções de serviço async
  routes/                 # mapeamento URL → controller
frontend/
  index.html
  vite.config.js
  src/
    App.jsx               # rotas com AuthProvider e RotaProtegida
    contexts/
      AuthContext.jsx     # estado global de autenticação
    components/
      Header.jsx          # cabeçalho compartilhado (nome, perfil, Sair)
      RotaProtegida.jsx   # redireciona para /login se não autenticado
    hooks/
      useOrdenacao.jsx    # hook de ordenação por coluna para tabelas
    pages/                # componentes de página
    services/
      api.js              # instância Axios com interceptor de token
```

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- `npx` disponível (incluso no npm 5.2+)

## Configuração

### 1. Instalar dependências do backend

```bash
npm install
```

### 2. Criar o arquivo `.env`

```bash
cp .env.exemple .env
```

Preencha as variáveis:

```env
DB_NAME=sistema_bar
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
PORT=3000
JWT_SECRET=seu_segredo_jwt
```

### 3. Criar o banco de dados

```bash
sudo -u postgres psql -c "CREATE DATABASE sistema_bar;"
# ou, se configurado com senha via TCP:
psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE sistema_bar;"
```

### 4. Ajustar `config/config.json`

Certifique-se de que as credenciais em `config/config.json` (usadas pelo sequelize-cli) correspondem ao banco criado.

### 5. Executar as migrations

```bash
npx sequelize-cli db:migrate
```

Tabelas criadas: `usuario`, `cliente`, `fornecedor`, `produto`, `compra`, `nota_fiscal`, `saida`, `comanda`, `consumo`, `log`, `divida`.

### 6. Inserir dados iniciais

```bash
npx sequelize-cli db:seed:all
```

Insere o registro obrigatório `Consumidor Final` (id=1) e dados de teste (5 registros por entidade).

Para desfazer:

```bash
npx sequelize-cli db:seed:undo:all
```

## Inicialização

### Backend

```bash
npm run dev
```

Sobe em `http://localhost:3000`.

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Sobe em `http://localhost:5173`.

> O backend deve estar rodando antes de abrir o frontend.

## Credenciais padrão (seeds)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Gerente | `admin@bar.com` | `123456` |
| Atendente | `maria@bar.com` | `123456` |

> Todos os usuários do seed usam a senha `123456`.

## Rotas disponíveis

### API — `http://localhost:3000`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `POST` | `/api/auth/login` | Pública | Login — retorna JWT |
| `GET/POST` | `/api/usuarios` | Gerente | Listar / criar usuários |
| `PUT/PATCH/DELETE` | `/api/usuarios/:id` | Gerente | Editar / remover usuário |
| `GET/POST` | `/api/clientes` | Autenticado | Listar / criar clientes |
| `GET` | `/api/clientes/busca?nome=` | Autenticado | Busca por nome |
| `GET` | `/api/clientes/cpf/:cpf` | Autenticado | Busca por CPF |
| `PUT/PATCH/DELETE` | `/api/clientes/:id` | Autenticado | Editar / remover cliente |
| `GET` | `/api/fornecedores` | Autenticado | Listar fornecedores |
| `POST/PUT/PATCH/DELETE` | `/api/fornecedores` | Gerente | Criar / editar / remover |
| `GET/POST` | `/api/produtos` | Autenticado | Listar / criar produtos |
| `PUT/PATCH/DELETE` | `/api/produtos/:id` | Autenticado | Editar / remover produto |
| `GET/POST` | `/api/compras` | Gerente | Listar / registrar compras |
| `DELETE` | `/api/compras/:id` | Gerente | Estornar compra |
| `GET/POST` | `/api/comandas` | Autenticado | Listar / abrir comandas |
| `PATCH` | `/api/comandas/:id` | Autenticado | Atualizar cabeçalho |
| `POST` | `/api/comandas/:id/fechar` | Autenticado | Fechar comanda |
| `DELETE` | `/api/comandas/:id` | Autenticado | Cancelar comanda |
| `POST` | `/api/comandas/:id/consumos` | Autenticado | Adicionar item |
| `PATCH/DELETE` | `/api/comandas/:id/consumos/:cid` | Autenticado | Editar / remover item |
| `GET` | `/api/fichas` | Autenticado | Listar fichas |
| `POST` | `/api/fichas/:clienteId/quitar` | Autenticado | Quitar débito |
| `GET` | `/api/logs` | Autenticado | Logs de auditoria |
| `GET` | `/api/dashboard` | Autenticado | Resumo (cards) |
| `GET` | `/api/dashboard/analise` | Autenticado | Análise por período |

### Frontend — `http://localhost:5173`

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/login` | Pública | Tela de login |
| `/` | Autenticado | Home — menu de módulos |
| `/dashboard` | Autenticado | Dashboard com análises |
| `/consumo` | Autenticado | Comandas abertas |
| `/consumo/nova` | Autenticado | Nova comanda |
| `/consumo/:id` | Autenticado | Editar comanda |
| `/historico` | Autenticado | Comandas fechadas/canceladas |
| `/pagamento/:id` | Autenticado | Pagamento de comanda |
| `/clientes` | Autenticado | Listagem de clientes |
| `/clientes/novo` | Autenticado | Cadastrar cliente |
| `/clientes/:id` | Autenticado | Editar cliente |
| `/estoque` | Autenticado | Listagem de produtos |
| `/estoque/novo` | Autenticado | Cadastrar produto |
| `/estoque/:id` | Autenticado | Editar produto |
| `/fornecedores` | Gerente | Listagem de fornecedores |
| `/fornecedores/novo` | Gerente | Cadastrar fornecedor |
| `/fornecedores/:id` | Gerente | Editar fornecedor |
| `/compras/nova` | Gerente | Registrar compra |
| `/usuarios` | Gerente | Listagem de usuários |
| `/usuarios/novo` | Gerente | Cadastrar usuário |
| `/usuarios/:id` | Gerente | Editar usuário |
| `/logs` | Gerente | Auditoria de ações |


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


## Stack

### Backend
- **Node.js + Express 5**: servidor HTTP e roteamento.
- **Sequelize 6**: ORM para mapeamento objeto-relacional e execução de queries.
- **PostgreSQL**: banco de dados relacional.
- **dotenv**: gerenciamento de variáveis de ambiente.
- **bcryptjs**: hash de senhas de usuários.

### Frontend
- **React 19**: biblioteca de interface.
- **Vite**: bundler e servidor de desenvolvimento.
- **React Router DOM 7**: navegação entre páginas.
- **Axios**: cliente HTTP para consumo da API.

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
frontend/
  index.html           # ponto de entrada HTML
  vite.config.js       # configuração do Vite
  src/
    main.jsx           # montagem do React
    App.jsx            # rotas da aplicação
    pages/             # componentes de página
    services/
      api.js           # instância Axios apontando para http://localhost:3000/api
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
createdb -U postgres sistema_bar 
// sudo -u postgres psql -c "CREATE DATABASE sistema_bar;"
# ou via psql:
psql -U postgres -c "CREATE DATABASE sistema_bar;"
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

### Backend

Iniciar em desenvolvimento (com reinicialização automática):

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT`).

### Frontend

Em outro terminal, a partir da raiz do projeto:

```bash
cd frontend
npm install
npm run dev
```

A interface sobe em `http://localhost:5173`.

> **Atenção:** o backend precisa estar rodando antes de abrir o frontend. O frontend consome a API em `http://localhost:3000/api` (configurado em `frontend/src/services/api.js`).

## Rotas disponíveis

### API — `http://localhost:3000`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `POST` | `/api/auth/login` | Pública | Login — retorna JWT |
| `GET` | `/api/usuarios` | Gerente | Listar usuários |
| `POST` | `/api/usuarios` | Gerente | Criar usuário |
| `PUT/PATCH` | `/api/usuarios/:id` | Gerente | Atualizar usuário |
| `DELETE` | `/api/usuarios/:id` | Gerente | Remover usuário |
| `GET/POST` | `/api/clientes` | Autenticado | Listar / criar clientes |
| `PUT/PATCH/DELETE` | `/api/clientes/:id` | Autenticado | Editar / remover cliente |
| `GET/POST` | `/api/fornecedores` | Autenticado | Listar fornecedores |
| `POST/PUT/PATCH/DELETE` | `/api/fornecedores/:id` | Gerente | Criar / editar / remover fornecedor |
| `GET/POST` | `/api/produtos` | Autenticado | Listar / criar produtos |
| `PUT/PATCH/DELETE` | `/api/produtos/:id` | Autenticado | Editar / remover produto |
| `GET/POST` | `/api/compras` | Gerente | Listar / registrar compras |
| `DELETE` | `/api/compras/:id` | Gerente | Estornar compra |
| `GET/POST` | `/api/comandas` | Autenticado | Listar / abrir comandas |
| `GET/POST` | `/api/notas-fiscais` | Autenticado | Notas fiscais |
| `GET` | `/api/logs` | Autenticado | Logs de auditoria |
| `GET/POST` | `/api/fichas` | Autenticado | Fichas de clientes |

### Frontend — `http://localhost:5173`

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/login` | Pública | Tela de login |
| `/` | Autenticado | Home — seleção de módulo |
| `/clientes` | Autenticado | Listagem de clientes |
| `/clientes/novo` | Autenticado | Cadastrar novo cliente |
| `/clientes/:id` | Autenticado | Editar cliente |
| `/estoque` | Autenticado | Listagem de produtos |
| `/estoque/novo` | Autenticado | Cadastrar novo produto |
| `/estoque/:id` | Autenticado | Editar produto |
| `/fornecedores` | Gerente | Listagem de fornecedores |
| `/fornecedores/novo` | Gerente | Cadastrar novo fornecedor |
| `/fornecedores/:id` | Gerente | Editar fornecedor |

