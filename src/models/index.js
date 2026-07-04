// Carrega todos os models Sequelize e configura as associações entre tabelas.
// Deve ser importado no app.js para garantir que as associações estejam prontas
// antes de qualquer requisição ser processada.

const { Cliente }    = require('./clienteModel');
const { Usuario }    = require('./usuarioModel');
const { Fornecedor } = require('./fornecedorModel');
const { Produto }    = require('./produtoModel');
const { Compra }     = require('./compraModel');
const { NotaFiscal } = require('./notaFiscalModel');
const { Log }        = require('./logModel');
const { Comanda, Consumo } = require('./comandaModel');
const { Divida }     = require('./fichaModel');

// Associações cross-model

// Comanda ↔ Cliente
Cliente.hasMany(Comanda, { foreignKey: 'fk_cliente' });
Comanda.belongsTo(Cliente, { foreignKey: 'fk_cliente' });

// Compra ↔ Produto / Fornecedor / NotaFiscal
Produto.hasMany(Compra, { foreignKey: 'fk_produto' });
Compra.belongsTo(Produto, { foreignKey: 'fk_produto' });

Fornecedor.hasMany(Compra, { foreignKey: 'fk_fornecedor' });
Compra.belongsTo(Fornecedor, { foreignKey: 'fk_fornecedor' });

NotaFiscal.hasMany(Compra, { foreignKey: 'fk_nota_fiscal' });
Compra.belongsTo(NotaFiscal, { foreignKey: 'fk_nota_fiscal' });

// Log ↔ Usuario / Comanda / Compra
Usuario.hasMany(Log, { foreignKey: 'fk_usuario' });
Log.belongsTo(Usuario, { foreignKey: 'fk_usuario' });

Comanda.hasMany(Log, { foreignKey: 'fk_comanda' });
Log.belongsTo(Comanda, { foreignKey: 'fk_comanda' });

Compra.hasMany(Log, { foreignKey: 'fk_compra' });
Log.belongsTo(Compra, { foreignKey: 'fk_compra' });

// Divida ↔ Cliente / Comanda
Cliente.hasMany(Divida, { foreignKey: 'fk_cliente', as: 'dividas' });
Divida.belongsTo(Cliente, { foreignKey: 'fk_cliente' });

Comanda.hasOne(Divida, { foreignKey: 'fk_comanda', as: 'divida' });
Divida.belongsTo(Comanda, { foreignKey: 'fk_comanda' });

module.exports = { Cliente, Usuario, Fornecedor, Produto, Compra, NotaFiscal, Log, Comanda, Consumo, Divida };
