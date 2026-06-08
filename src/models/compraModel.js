const sequelize = require('../../config/localConnection');
const { DataTypes } = require('sequelize');
const EstoqueModel = require('./estoqueModel');
const FornecedorModel = require('./fornecedorModel');

// ── Schema ──

const Compra = sequelize.define('Compra', {
    id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    produtoId:        { type: DataTypes.INTEGER },
    nomeProduto:      { type: DataTypes.STRING, allowNull: false },
    quantidade:       { type: DataTypes.INTEGER, allowNull: false },
    fornecedorId:     { type: DataTypes.INTEGER },
    nomeFornecedor:   { type: DataTypes.STRING, allowNull: false },
    custoUnitario:    { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    totalCusto:       { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    numeroNotaFiscal: { type: DataTypes.STRING },
    dataRecebimento:  { type: DataTypes.DATEONLY, allowNull: false },
}, {
    tableName: 'compra',
    freezeTableName: true,
    timestamps: false,
});

// ── Validações ──

function validarCamposObrigatorios(dados) {
    const campos = ['produtoId', 'quantidade', 'fornecedorId', 'custoUnitario', 'dataRecebimento'];
    const ausentes = campos.filter(c => dados[c] === undefined || dados[c] === null || dados[c] === '');
    if (ausentes.length > 0) {
        throw new Error(`Campos obrigatórios ausentes: ${ausentes.join(', ')}`);
    }
}

async function validarFornecedor(fornecedorId) {
    const fornecedor = await FornecedorModel.buscarPorId(Number(fornecedorId));
    if (!fornecedor) throw new Error(`Fornecedor com id ${fornecedorId} não encontrado`);
    return fornecedor;
}

function validarData(data) {
    if (isNaN(Date.parse(data))) throw new Error('Data de recebimento inválida');
}

async function validarCompra(dados) {
    validarCamposObrigatorios(dados);
    await validarFornecedor(dados.fornecedorId);
    validarData(dados.dataRecebimento);
    if (Number(dados.custoUnitario) <= 0) throw new Error('O custo unitário deve ser maior que zero');
}

// ── Funções de dados ──

async function listarTodos() {
    return Compra.findAll({ order: [['id', 'ASC']] });
}

async function buscarPorId(id) {
    return Compra.findByPk(id);
}

async function criar(dados) {
    await validarCompra(dados);
    const fornecedor = await validarFornecedor(dados.fornecedorId);
    const quantidade = Number(dados.quantidade);
    const produtoAtualizado = await EstoqueModel.entrada(Number(dados.produtoId), quantidade);
    return Compra.create({
        produtoId:        Number(dados.produtoId),
        nomeProduto:      produtoAtualizado.nome,
        quantidade,
        fornecedorId:     Number(dados.fornecedorId),
        nomeFornecedor:   fornecedor.razaoSocial,
        custoUnitario:    Number(dados.custoUnitario),
        totalCusto:       quantidade * Number(dados.custoUnitario),
        numeroNotaFiscal: dados.numeroNotaFiscal || null,
        dataRecebimento:  dados.dataRecebimento,
    });
}

async function remover(id) {
    const compra = await Compra.findByPk(id);
    if (!compra) return null;
    await EstoqueModel.saida(compra.produtoId, compra.quantidade);
    await compra.destroy();
    return compra;
}

module.exports = { Compra, listarTodos, buscarPorId, criar, remover };
