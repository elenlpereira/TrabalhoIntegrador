const sequelize = require('../../config/localConnection');
const { DataTypes, Op } = require('sequelize');

const CATEGORIAS_VALIDAS = ['bebidas', 'alimentos', 'mercearia', 'outros'];

// ── Helpers ──

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
    const campos = ['razao_social', 'cnpj', 'telefone', 'email', 'categoria_produtos'];
    const ausentes = campos.filter(c => !dados[c]);
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

// ── Schema ──

const Fornecedor = sequelize.define('Fornecedor', {
    id_fornecedor:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    razao_social:       { type: DataTypes.STRING(150), allowNull: false },
    cnpj:               { type: DataTypes.STRING(18), allowNull: false, unique: true },
    telefone:           { type: DataTypes.STRING(20) },
    email:              { type: DataTypes.STRING(100) },
    endereco:           { type: DataTypes.STRING(255) },
    categoria_produtos: { type: DataTypes.STRING(100) },
}, {
    tableName: 'fornecedor',
    freezeTableName: true,
    timestamps: false,
});

async function validarCnpjUnico(cnpj, idIgnorado = null) {
    const cnpjNorm = normalizarCnpj(cnpj);
    const where = { cnpj: cnpjNorm };
    if (idIgnorado) where.id_fornecedor = { [Op.ne]: idIgnorado };
    const existe = await Fornecedor.findOne({ where });
    if (existe) throw new Error('CNPJ já cadastrado');
}

async function validarEmailUnico(email, idIgnorado = null) {
    if (!email) return;
    const where = { email };
    if (idIgnorado) where.id_fornecedor = { [Op.ne]: idIgnorado };
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
    validarCategoria(dados.categoria_produtos);
    await validarCnpjUnico(dados.cnpj, idIgnorado);
    await validarEmailUnico(dados.email, idIgnorado);
}

// ── Funções de dados ──

async function listarTodos() {
    return Fornecedor.findAll({ order: [['id_fornecedor', 'ASC']] });
}

async function buscarPorId(id) {
    return Fornecedor.findByPk(id);
}

async function buscarPorCNPJ(cnpj) {
    return Fornecedor.findOne({ where: { cnpj: normalizarCnpj(cnpj) } });
}

async function buscarPorNome(nome) {
    return Fornecedor.findAll({ where: { razao_social: { [Op.iLike]: `%${nome}%` } } });
}

async function criar(dados) {
    await validarFornecedor(dados);
    return Fornecedor.create({
        razao_social:       dados.razao_social,
        cnpj:               normalizarCnpj(dados.cnpj),
        telefone:           dados.telefone || null,
        email:              dados.email,
        endereco:           dados.endereco || null,
        categoria_produtos: normalizarCategoria(dados.categoria_produtos),
    });
}

// PUT - exige objeto completo
async function atualizar(id, dados) {
    const fornecedor = await Fornecedor.findByPk(id);
    if (!fornecedor) return null;
    await validarFornecedor(dados, id);
    await fornecedor.update({
        razao_social:       dados.razao_social,
        cnpj:               normalizarCnpj(dados.cnpj),
        telefone:           dados.telefone || null,
        email:              dados.email,
        endereco:           dados.endereco || null,
        categoria_produtos: normalizarCategoria(dados.categoria_produtos),
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
    if (dados.categoria_produtos) {
        validarCategoria(dados.categoria_produtos);
        dados = { ...dados, categoria_produtos: normalizarCategoria(dados.categoria_produtos) };
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

module.exports = {
    Fornecedor, CATEGORIAS_VALIDAS,
    listarTodos, buscarPorId, buscarPorCNPJ, buscarPorNome,
    criar, atualizar, atualizarParcial, remover,
};
