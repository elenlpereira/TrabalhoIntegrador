// Carrega todos os models e configura as associações entre tabelas.
// Deve ser importado no app.js para garantir que as associações estejam prontas antes de qualquer requisição ser processada

const { Cliente }        = require('./clienteModel');
const { Usuario }        = require('./usuarioModel');
const { Fornecedor }     = require('./fornecedorModel');
const { Produto }        = require('./produtoModel');
const { Compra }         = require('./compraModel');
const { Saida }          = require('./saidaModel');
const { Comanda, ComandaItem } = require('./comandaModel');

// Associações cross-model 

// Produto ↔ Fornecedor
Fornecedor.hasMany(Produto, { foreignKey: 'fornecedorId' });
Produto.belongsTo(Fornecedor, { foreignKey: 'fornecedorId' });

// Comanda ↔ Cliente
Cliente.hasMany(Comanda, { foreignKey: 'clienteId' });
Comanda.belongsTo(Cliente, { foreignKey: 'clienteId' });

// ComandaItem ↔ Produto
Produto.hasMany(ComandaItem, { foreignKey: 'produtoId' });
ComandaItem.belongsTo(Produto, { foreignKey: 'produtoId' });

// Compra ↔ Produto / Fornecedor (FKs opcionais — dados desnormalizados preservados)
Produto.hasMany(Compra, { foreignKey: 'produtoId' });
Compra.belongsTo(Produto, { foreignKey: 'produtoId' });

Fornecedor.hasMany(Compra, { foreignKey: 'fornecedorId' });
Compra.belongsTo(Fornecedor, { foreignKey: 'fornecedorId' });

// Saida ↔ Produto (FK opcional)
Produto.hasMany(Saida, { foreignKey: 'produtoId' });
Saida.belongsTo(Produto, { foreignKey: 'produtoId' });

module.exports = { Cliente, Usuario, Fornecedor, Produto, Compra, Saida, Comanda, ComandaItem };
