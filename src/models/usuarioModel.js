const bcrypt = require('bcryptjs');
const sequelize = require('../../config/localConnection');
const { DataTypes, Op } = require('sequelize');

// ── Schema ──

const Usuario = sequelize.define('Usuario', {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nomeCompleto: { type: DataTypes.STRING(100), allowNull: false },
    email:        { type: DataTypes.STRING, allowNull: false, unique: true },
    senha:        { type: DataTypes.STRING, allowNull: false },
    perfil:       { type: DataTypes.ENUM('Atendente', 'Gerente'), allowNull: false },
}, {
    tableName: 'usuario',
    freezeTableName: true,
    timestamps: false,
});

// ── Validações ────────────────────────────────────────────────────────────────

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCamposObrigatorios(dados) {
    if (!dados.nomeCompleto || !dados.email || !dados.senha || !dados.confirmacaoSenha || !dados.perfil) {
        throw new Error('Campos obrigatórios ausentes: nomeCompleto, email, senha, confirmacaoSenha, perfil');
    }
}

function validarSenhasIguais(senha, confirmacaoSenha) {
    if (senha !== confirmacaoSenha) {
        throw new Error('A senha e a confirmação de senha não coincidem');
    }
}

function validarPerfil(perfil) {
    if (!['Atendente', 'Gerente'].includes(perfil)) {
        throw new Error('Perfil inválido. Valores aceitos: Atendente, Gerente');
    }
}

async function validarEmailUnico(email, idIgnorado = null) {
    const where = { email };
    if (idIgnorado) where.id = { [Op.ne]: idIgnorado };
    const existe = await Usuario.findOne({ where });
    if (existe) throw new Error('E-mail já cadastrado');
}

async function validarUsuario(dados, idIgnorado = null) {
    validarCamposObrigatorios(dados);
    if (!validarEmail(dados.email)) {
        throw new Error('Formato de e-mail inválido');
    }
    if (dados.senha.length < 6) {
        throw new Error('A senha deve ter no mínimo 6 caracteres');
    }
    validarSenhasIguais(dados.senha, dados.confirmacaoSenha);
    validarPerfil(dados.perfil);
    await validarEmailUnico(dados.email, idIgnorado);
}

// ── Funções de dados ──────────────────────────────────────────────────────────

async function listarTodos() {
    return Usuario.findAll({ attributes: { exclude: ['senha'] }, order: [['id', 'ASC']] });
}

async function buscarPorId(id) {
    const u = await Usuario.findByPk(id);
    if (!u) return null;
    const { senha, ...semSenha } = u.toJSON();
    return semSenha;
}

async function criar(dados) {
    await validarUsuario(dados);
    const senhaHash = bcrypt.hashSync(dados.senha, 10);
    const novo = await Usuario.create({
        nomeCompleto: dados.nomeCompleto,
        email:        dados.email,
        senha:        senhaHash,
        perfil:       dados.perfil,
    });
    const { senha, ...semSenha } = novo.toJSON();
    return semSenha;
}

// PUT - exige objeto completo
async function atualizar(id, dados) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return null;
    await validarUsuario(dados, id);
    await usuario.update({
        nomeCompleto: dados.nomeCompleto,
        email:        dados.email,
        senha:        bcrypt.hashSync(dados.senha, 10),
        perfil:       dados.perfil,
    });
    const { senha, ...semSenha } = usuario.toJSON();
    return semSenha;
}

// PATCH - atualiza parcialmente
async function atualizarParcial(id, dados) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return null;

    if (dados.email && dados.email !== usuario.email) {
        if (!validarEmail(dados.email)) throw new Error('Formato de e-mail inválido');
        await validarEmailUnico(dados.email, id);
    }
    if (dados.perfil) validarPerfil(dados.perfil);
    if (dados.senha) {
        if (!dados.confirmacaoSenha) throw new Error('Confirmação de senha obrigatória ao alterar a senha');
        validarSenhasIguais(dados.senha, dados.confirmacaoSenha);
        if (dados.senha.length < 6) throw new Error('A senha deve ter no mínimo 6 caracteres');
        dados = { ...dados, senha: bcrypt.hashSync(dados.senha, 10) };
    }
    const { confirmacaoSenha, ...dadosSemConfirmacao } = dados;
    await usuario.update(dadosSemConfirmacao);
    const { senha, ...semSenha } = usuario.toJSON();
    return semSenha;
}

async function remover(id) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return false;
    await usuario.destroy();
    return true;
}

module.exports = { Usuario, listarTodos, buscarPorId, criar, atualizar, atualizarParcial, remover };
