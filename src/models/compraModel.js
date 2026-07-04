const sequelize = require('../../config/localConnection');
const { DataTypes } = require('sequelize');
const EstoqueModel    = require('./estoqueModel');
const FornecedorModel = require('./fornecedorModel');
const ProdutoModel    = require('./produtoModel');
const LogModel        = require('./logModel');

// ── Schema ──

const Compra = sequelize.define('Compra', {
    id_compra:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fk_produto:       { type: DataTypes.INTEGER, allowNull: false },
    fk_fornecedor:    { type: DataTypes.INTEGER, allowNull: false },
    fk_nota_fiscal:    { type: DataTypes.INTEGER },
    quantidade:       { type: DataTypes.INTEGER, allowNull: false },
    custo_unitario:   { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    data_recebimento: { type: DataTypes.DATEONLY, allowNull: false },
}, {
    tableName: 'compra',
    freezeTableName: true,
    timestamps: false,
});

// ── Validações ──

function validarCamposObrigatorios(dados) {
    const campos = ['fk_produto', 'fk_fornecedor', 'quantidade', 'custo_unitario', 'data_recebimento'];
    const ausentes = campos.filter(c => dados[c] === undefined || dados[c] === null || dados[c] === '');
    if (ausentes.length > 0) {
        throw new Error(`Campos obrigatórios ausentes: ${ausentes.join(', ')}`);
    }
}

async function validarFornecedor(fk_fornecedor) {
    const fornecedor = await FornecedorModel.buscarPorId(Number(fk_fornecedor));
    if (!fornecedor) throw new Error(`Fornecedor com id ${fk_fornecedor} não encontrado`);
    return fornecedor;
}

async function validarProduto(fk_produto) {
    const produto = await ProdutoModel.buscarPorId(Number(fk_produto));
    if (!produto) throw new Error(`Produto com id ${fk_produto} não encontrado`);
    return produto;
}

function validarData(data) {
    if (isNaN(Date.parse(data))) throw new Error('Data de recebimento inválida');
}

async function validarCompra(dados) {
    validarCamposObrigatorios(dados);
    await validarFornecedor(dados.fk_fornecedor);
    await validarProduto(dados.fk_produto);
    validarData(dados.data_recebimento);
    if (Number(dados.custo_unitario) <= 0) throw new Error('O custo unitário deve ser maior que zero');
    if (Number(dados.quantidade) <= 0) throw new Error('A quantidade deve ser maior que zero');
}

// ── Funções de dados ──

async function listarTodos() {
    return Compra.findAll({ order: [['id_compra', 'ASC']] });
}

async function buscarPorId(id) {
    return Compra.findByPk(id);
}

async function criar(dados) {
    await validarCompra(dados);
    await EstoqueModel.entrada(Number(dados.fk_produto), Number(dados.quantidade));
    const novaCompra = await Compra.create({
        fk_produto:       Number(dados.fk_produto),
        fk_fornecedor:    Number(dados.fk_fornecedor),
        fk_nota_fiscal:    dados.fk_nota_fiscal ? Number(dados.fk_nota_fiscal) : null,
        quantidade:       Number(dados.quantidade),
        custo_unitario:   Number(dados.custo_unitario),
        data_recebimento: dados.data_recebimento,
    });
    const fk_usuario = dados.fk_usuario || 1;
    await LogModel.registrar({
        fk_usuario,
        fk_compra: novaCompra.id_compra,
        tipo: 'registrar_compra',
        descricao: `Compra ${novaCompra.id_compra}: produto ${dados.fk_produto}, qtd ${dados.quantidade}`,
    });
    return novaCompra;
}

async function remover(id) {
    const compra = await Compra.findByPk(id);
    if (!compra) return null;
    await EstoqueModel.saida(compra.fk_produto, compra.quantidade);
    await compra.destroy();
    return compra;
}

module.exports = { Compra, listarTodos, buscarPorId, criar, remover };
