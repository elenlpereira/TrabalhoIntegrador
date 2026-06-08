const sequelize = require('../../config/localConnection');
const { DataTypes, Op } = require('sequelize');
 
const CATEGORIAS_VALIDAS = ['bebidas', 'alimentos', 'mercearia', 'outros'];
 
// ── Schema ──
 
function normalizarCnpj(cnpj) {
    return cnpj.replace(/[.\-\/]/g, '');
}

function normalizarCategoria(categoria) {
    return String(categoria || '').trim().toLowerCase();
}
 
function validarFormatoCnpj(cnpj) {
    return /^(?:\d{14}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/.test(cnpj);
}
 
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
 
function validarCamposObrigatorios(dados) {
    const campos = ['razaoSocial', 'cnpj', 'telefone', 'email', 'cidade', 'categoriaProduto'];
    const ausentes = campos.filter(c => !dados[c]);
    if (ausentes.length > 0) {
        throw new Error(`Campos obrigatórios ausentes: ${ausentes.join(', ')}`);
    }
}
 
function validarCategoria(categoria) {
    const categoriaNormalizada = normalizarCategoria(categoria);
    if (!CATEGORIAS_VALIDAS.includes(categoriaNormalizada)) {
        throw new Error(`Categoria inválida. Valores aceitos: ${CATEGORIAS_VALIDAS.join(', ')}`);
    }
}
 
// ── Schema ────────────────────────────────────────────────────────────────────

const Fornecedor = sequelize.define('Fornecedor', {
    id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    razaoSocial:      { type: DataTypes.STRING, allowNull: false },
    cnpj:             { type: DataTypes.STRING(14), allowNull: false, unique: true },
    telefone:         { type: DataTypes.STRING(20), allowNull: false },
    email:            { type: DataTypes.STRING, allowNull: false },
    cidade:           { type: DataTypes.STRING, allowNull: false },
    categoriaProduto: { type: DataTypes.ENUM(...CATEGORIAS_VALIDAS), allowNull: false },
}, {
    tableName: 'fornecedor',
    freezeTableName: true,
    timestamps: false,
});

async function validarCnpjUnico(cnpj, idIgnorado = null) {
    const cnpjNorm = normalizarCnpj(cnpj);
    const where = { cnpj: cnpjNorm };
    if (idIgnorado) where.id = { [Op.ne]: idIgnorado };
    const existe = await Fornecedor.findOne({ where });
    if (existe) throw new Error('CNPJ já cadastrado');
}

async function validarEmailUnico(email, idIgnorado = null) {
    if (!email) return;
    const where = { email };
    if (idIgnorado) where.id = { [Op.ne]: idIgnorado };
    const existe = await Fornecedor.findOne({ where });
    if (existe) throw new Error('E-mail já cadastrado');
}

async function validarFornecedor(dados, idIgnorado = null) {
    validarCamposObrigatorios(dados);
    if (!validarFormatoCnpj(dados.cnpj)) {
        throw new Error('Formato de CNPJ inválido. Use 00000000000000 ou 00.000.000/0000-00');
    }
    if (!validarEmail(dados.email)) {
        throw new Error('Formato de e-mail inválido');
    }
    validarCategoria(dados.categoriaProduto);
    await validarCnpjUnico(dados.cnpj, idIgnorado);
    await validarEmailUnico(dados.email, idIgnorado);
}
 
// ── Funções de dados ──────────────────────────────────────────────────────────

async function listarTodos() {
    return Fornecedor.findAll({ order: [['id', 'ASC']] });
}

async function buscarPorId(id) {
    return Fornecedor.findByPk(id);
}

async function buscarPorCNPJ(cnpj) {
    return Fornecedor.findOne({ where: { cnpj: normalizarCnpj(cnpj) } });
}

async function buscarPorNome(nome) {
    return Fornecedor.findAll({ where: { razaoSocial: { [Op.iLike]: `%${nome}%` } } });
}

async function criar(dados) {
    await validarFornecedor(dados);
    return Fornecedor.create({
        razaoSocial:      dados.razaoSocial,
        cnpj:             normalizarCnpj(dados.cnpj),
        telefone:         dados.telefone,
        email:            dados.email,
        cidade:           dados.cidade,
        categoriaProduto: normalizarCategoria(dados.categoriaProduto),
    });
}

// PUT - exige objeto completo
async function atualizar(id, dados) {
    const fornecedor = await Fornecedor.findByPk(id);
    if (!fornecedor) return null;
    await validarFornecedor(dados, id);
    await fornecedor.update({
        razaoSocial:      dados.razaoSocial,
        cnpj:             normalizarCnpj(dados.cnpj),
        telefone:         dados.telefone,
        email:            dados.email,
        cidade:           dados.cidade,
        categoriaProduto: normalizarCategoria(dados.categoriaProduto),
    });
    return fornecedor;
}

// PATCH - atualiza parcialmente
async function atualizarParcial(id, dados) {
    const fornecedor = await Fornecedor.findByPk(id);
    if (!fornecedor) return null;

    if (dados.cnpj && normalizarCnpj(dados.cnpj) !== fornecedor.cnpj) {
        if (!validarFormatoCnpj(dados.cnpj)) throw new Error('Formato de CNPJ inválido. Use 00000000000000 ou 00.000.000/0000-00');
        await validarCnpjUnico(dados.cnpj, id);
        dados = { ...dados, cnpj: normalizarCnpj(dados.cnpj) };
    }
    if (dados.email && dados.email !== fornecedor.email) {
        if (!validarEmail(dados.email)) throw new Error('Formato de e-mail inválido');
        await validarEmailUnico(dados.email, id);
    }
    if (dados.categoriaProduto) {
        validarCategoria(dados.categoriaProduto);
        dados = { ...dados, categoriaProduto: normalizarCategoria(dados.categoriaProduto) };
    }

    await fornecedor.update(dados);
    return fornecedor;
}

async function remover(id) {
    const fornecedor = await Fornecedor.findByPk(id);
    if (!fornecedor) return false;
    await fornecedor.destroy();
    return true;
}

module.exports = { Fornecedor, listarTodos, buscarPorId, buscarPorCNPJ, buscarPorNome, criar, atualizar, atualizarParcial, remover, CATEGORIAS_VALIDAS };