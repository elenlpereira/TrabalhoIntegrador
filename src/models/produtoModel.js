const sequelize = require('../../config/localConnection');
const { DataTypes, Op } = require('sequelize');

const CATEGORIAS_VALIDAS = ['bebidas', 'alimentos', 'mercearia', 'outros'];

// ── Schema ──

const Produto = sequelize.define('Produto', {
    id_produto:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome:              { type: DataTypes.STRING(100), allowNull: false, unique: true },
    quantidade_estoque:{ type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    estoque_minimo:    { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    categoria:         { type: DataTypes.STRING(100) },
    preco_custo:       { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    preco_venda:       { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
    tableName: 'produto',
    freezeTableName: true,
    timestamps: false,
});

// ── Validações ──

function normalizarCategoria(categoria) {
    return String(categoria || '').trim().toLowerCase();
}

function validarCamposObrigatorios(dados) {
    const campos = ['nome', 'quantidade_estoque', 'estoque_minimo', 'categoria', 'preco_custo', 'preco_venda'];
    const ausentes = campos.filter(c => dados[c] === undefined || dados[c] === null || dados[c] === '');
    if (ausentes.length > 0) {
        throw new Error(`Campos obrigatórios ausentes: ${ausentes.join(', ')}`);
    }
}

function validarCategoria(categoria) {
    const cat = normalizarCategoria(categoria);
    if (!CATEGORIAS_VALIDAS.includes(cat)) {
        throw new Error(`Categoria inválida. Valores aceitos: ${CATEGORIAS_VALIDAS.join(', ')}`);
    }
}

function validarNumerosPositivos(dados) {
    if (dados.quantidade_estoque < 0) throw new Error('A quantidade em estoque não pode ser negativa');
    if (dados.estoque_minimo < 0) throw new Error('O estoque mínimo não pode ser negativo');
    if (dados.preco_custo <= 0) throw new Error('O preço de custo deve ser maior que zero');
    if (dados.preco_venda <= 0) throw new Error('O preço de venda deve ser maior que zero');
}

async function validarNomeUnico(nome, idIgnorado = null) {
    const where = { nome };
    if (idIgnorado) where.id_produto = { [Op.ne]: idIgnorado };
    const existe = await Produto.findOne({ where });
    if (existe) throw new Error('Já existe um produto com este nome');
}

async function validarProduto(dados, idIgnorado = null) {
    validarCamposObrigatorios(dados);
    validarCategoria(dados.categoria);
    validarNumerosPositivos(dados);
    await validarNomeUnico(dados.nome, idIgnorado);
}

// ── Funções de dados ──

async function listarTodos(filtros = {}) {
    const where = {};
    if (filtros.categoria) where.categoria = filtros.categoria.toLowerCase();
    return Produto.findAll({ where, order: [['id_produto', 'ASC']] });
}

async function buscarPorId(id) {
    return Produto.findByPk(id);
}

async function criar(dados) {
    await validarProduto(dados);
    return Produto.create({
        nome:               dados.nome,
        quantidade_estoque: Number(dados.quantidade_estoque),
        estoque_minimo:     Number(dados.estoque_minimo),
        categoria:          normalizarCategoria(dados.categoria),
        preco_custo:        Number(dados.preco_custo),
        preco_venda:        Number(dados.preco_venda),
    });
}

// PUT - exige objeto completo
async function atualizar(id, dados) {
    const produto = await Produto.findByPk(id);
    if (!produto) return null;
    await validarProduto(dados, id);
    await produto.update({
        nome:               dados.nome,
        quantidade_estoque: Number(dados.quantidade_estoque),
        estoque_minimo:     Number(dados.estoque_minimo),
        categoria:          normalizarCategoria(dados.categoria),
        preco_custo:        Number(dados.preco_custo),
        preco_venda:        Number(dados.preco_venda),
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
    if (dados.quantidade_estoque !== undefined && dados.quantidade_estoque < 0)
        throw new Error('A quantidade em estoque não pode ser negativa');
    if (dados.estoque_minimo !== undefined && dados.estoque_minimo < 0)
        throw new Error('O estoque mínimo não pode ser negativo');
    if (dados.preco_custo !== undefined && dados.preco_custo <= 0)
        throw new Error('O preço de custo deve ser maior que zero');
    if (dados.preco_venda !== undefined && dados.preco_venda <= 0)
        throw new Error('O preço de venda deve ser maior que zero');

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
