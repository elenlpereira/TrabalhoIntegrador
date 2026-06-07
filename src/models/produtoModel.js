const sequelize = require('../../config/localConnection');
const { DataTypes, Op } = require('sequelize');

const CATEGORIAS_VALIDAS = ['bebidas', 'alimentos', 'mercearia', 'outros'];

// ── Schema ────────────────────────────────────────────────────────────────────

const Produto = sequelize.define('Produto', {
    id:                { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome:              { type: DataTypes.STRING, allowNull: false, unique: true },
    quantidadeEstoque: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    estoqueMinimo:     { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    categoria:         { type: DataTypes.ENUM(...CATEGORIAS_VALIDAS), allowNull: false },
    precoCusto:        { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    precoVenda:        { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    fornecedorId:      { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'produto',
    freezeTableName: true,
    timestamps: false,
});

// ── Validações ────────────────────────────────────────────────────────────────

function normalizarCategoria(categoria) {
    return String(categoria || '').trim().toLowerCase();
}

function validarCamposObrigatorios(dados) {
    const campos = ['nome', 'quantidadeEstoque', 'estoqueMinimo', 'categoria', 'precoCusto', 'precoVenda', 'fornecedorId'];
    const ausentes = campos.filter(c => dados[c] === undefined || dados[c] === null || dados[c] === '');
    if (ausentes.length > 0) {
        throw new Error(`Campos obrigatórios ausentes: ${ausentes.join(', ')}`);
    }
}

async function validarFornecedorExiste(fornecedorId) {
    const FornecedorModel = require('./fornecedor.Model');
    const fornecedor = await FornecedorModel.buscarPorId(Number(fornecedorId));
    if (!fornecedor) throw new Error(`Fornecedor com id ${fornecedorId} não encontrado`);
}

function validarCategoria(categoria) {
    const categoriaNormalizada = normalizarCategoria(categoria);
    if (!CATEGORIAS_VALIDAS.includes(categoriaNormalizada)) {
        throw new Error(`Categoria inválida. Valores aceitos: ${CATEGORIAS_VALIDAS.join(', ')}`);
    }
}

function validarNumerosPositivos(dados) {
    if (dados.quantidadeEstoque < 0) throw new Error('A quantidade em estoque não pode ser negativa');
    if (dados.estoqueMinimo < 0) throw new Error('O estoque mínimo não pode ser negativo');
    if (dados.precoCusto <= 0) throw new Error('O preço de custo deve ser maior que zero');
    if (dados.precoVenda <= 0) throw new Error('O preço de venda deve ser maior que zero');
}

async function validarNomeUnico(nome, idIgnorado = null) {
    const where = { nome };
    if (idIgnorado) where.id = { [Op.ne]: idIgnorado };
    const existe = await Produto.findOne({ where });
    if (existe) throw new Error('Já existe um produto com este nome');
}

async function validarProduto(dados, idIgnorado = null) {
    validarCamposObrigatorios(dados);
    validarCategoria(dados.categoria);
    validarNumerosPositivos(dados);
    await validarFornecedorExiste(dados.fornecedorId);
    await validarNomeUnico(dados.nome, idIgnorado);
}

// ── Funções de dados ──────────────────────────────────────────────────────────

async function listarTodos(filtros = {}) {
    const where = {};
    if (filtros.categoria) where.categoria = filtros.categoria.toLowerCase();
    if (filtros.fornecedorId !== undefined) {
        const fid = Number(filtros.fornecedorId);
        if (!Number.isNaN(fid)) where.fornecedorId = fid;
    }
    return Produto.findAll({ where, order: [['id', 'ASC']] });
}

async function buscarPorId(id) {
    return Produto.findByPk(id);
}

async function criar(dados) {
    await validarProduto(dados);
    return Produto.create({
        nome:              dados.nome,
        quantidadeEstoque: Number(dados.quantidadeEstoque),
        estoqueMinimo:     Number(dados.estoqueMinimo),
        categoria:         normalizarCategoria(dados.categoria),
        precoCusto:        Number(dados.precoCusto),
        precoVenda:        Number(dados.precoVenda),
        fornecedorId:      Number(dados.fornecedorId),
    });
}

// PUT - exige objeto completo
async function atualizar(id, dados) {
    const produto = await Produto.findByPk(id);
    if (!produto) return null;
    await validarProduto(dados, id);
    await produto.update({
        nome:              dados.nome,
        quantidadeEstoque: Number(dados.quantidadeEstoque),
        estoqueMinimo:     Number(dados.estoqueMinimo),
        categoria:         normalizarCategoria(dados.categoria),
        precoCusto:        Number(dados.precoCusto),
        precoVenda:        Number(dados.precoVenda),
        fornecedorId:      Number(dados.fornecedorId),
    });
    return produto;
}

// PATCH - atualiza parcialmente
async function atualizarParcial(id, dados) {
    const produto = await Produto.findByPk(id);
    if (!produto) return null;

    if (dados.nome && dados.nome !== produto.nome) await validarNomeUnico(dados.nome, id);
    if (dados.categoria) {
        validarCategoria(dados.categoria);
        dados = { ...dados, categoria: normalizarCategoria(dados.categoria) };
    }
    if (dados.quantidadeEstoque !== undefined && dados.quantidadeEstoque < 0) throw new Error('A quantidade em estoque não pode ser negativa');
    if (dados.estoqueMinimo !== undefined && dados.estoqueMinimo < 0) throw new Error('O estoque mínimo não pode ser negativo');
    if (dados.precoCusto !== undefined && dados.precoCusto <= 0) throw new Error('O preço de custo deve ser maior que zero');
    if (dados.precoVenda !== undefined && dados.precoVenda <= 0) throw new Error('O preço de venda deve ser maior que zero');
    if (dados.fornecedorId !== undefined) {
        await validarFornecedorExiste(dados.fornecedorId);
        dados = { ...dados, fornecedorId: Number(dados.fornecedorId) };
    }

    await produto.update(dados);
    return produto;
}

async function remover(id) {
    const produto = await Produto.findByPk(id);
    if (!produto) return false;
    await produto.destroy();
    return true;
}

module.exports = { Produto, listarTodos, buscarPorId, criar, atualizar, atualizarParcial, remover };
