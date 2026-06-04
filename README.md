# Trabalho Integrador

Sistema de gerenciamento de bar para controle operacional e financeiro.

## Stack

- Node.js: ambiente de execução JavaScript no backend.
- Express: framework web para criação das rotas e API do sistema.

## Inicialização do projeto

Instalar as dependências principais:

```
npm install express
npm install --save-dev nodemon
```

Iniciar em produção:

```
npm start
```

Iniciar em desenvolvimento (com reinicialização automática):

```
npm run dev
```

## Funcionalidades

- CRUD de usuário
- CRUD de cliente
- CRUD de fornecedores
- CRUD de produto
- Compras
- Entrada de estoque
- Vendas
- Saída de estoque
- Saída manual do estoque
- Comanda (conta)
- Gestão de comandas (visualização e status aberto/fechada)
- Fechamento de comanda com dois caminhos:
	- Pago na hora
	- À prazo (ficha)
- Pagamento
- Fichas:
	- ID da comanda
	- Valor total
	- Status (em aberto/pago)
- Dashboard dinâmico