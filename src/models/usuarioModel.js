const bcrypt = require('bcryptjs');

let usuarios = [
    { id: 1, nomeCompleto: 'Admin Sistema', email: 'admin@sistema.com', senha: '$2a$10$exampleHashedPasswordHere', perfil: 'Gerente' },
];
let proximoId = 2;

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

function validarEmailUnico(email, idIgnorado = null) {
    const existe = usuarios.find(u => u.email === email && u.id !== idIgnorado);
    if (existe) throw new Error('E-mail já cadastrado');
}

function validarUsuario(dados, idIgnorado = null) {
    validarCamposObrigatorios(dados);
    if (!validarEmail(dados.email)) {
        throw new Error('Formato de e-mail inválido');
    }
    if (dados.senha.length < 6) {
        throw new Error('A senha deve ter no mínimo 6 caracteres');
    }
    validarSenhasIguais(dados.senha, dados.confirmacaoSenha);
    validarPerfil(dados.perfil);
    validarEmailUnico(dados.email, idIgnorado);
}

// ── Funções de dados ──────────────────────────────────────────────────────────

function listarTodos() {
    return usuarios.map(({ senha, ...semSenha }) => semSenha);
}

function buscarPorId(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return null;
    const { senha, ...semSenha } = usuario;
    return semSenha;
}

function criar(dados) {
    validarUsuario(dados);

    const senhaHash = bcrypt.hashSync(dados.senha, 10);
    const novoUsuario = {
        id: proximoId++,
        nomeCompleto: dados.nomeCompleto,
        email: dados.email,
        senha: senhaHash,
        perfil: dados.perfil,
    };
    usuarios.push(novoUsuario);

    const { senha, ...semSenha } = novoUsuario;
    return semSenha;
}

// PUT - exige objeto completo
function atualizar(id, dados) {
    const idx = usuarios.findIndex(u => u.id === id);
    if (idx === -1) return null;

    // Passa o id atual para não detectar o próprio usuário como duplicado
    validarUsuario(dados, id);

    const senhaHash = bcrypt.hashSync(dados.senha, 10);
    usuarios[idx] = {
        id,
        nomeCompleto: dados.nomeCompleto,
        email: dados.email,
        senha: senhaHash,
        perfil: dados.perfil,
    };

    const { senha, ...semSenha } = usuarios[idx];
    return semSenha;
}

// PATCH - atualiza parcialmente
function atualizarParcial(id, dados) {
    const idx = usuarios.findIndex(u => u.id === id);
    if (idx === -1) return null;

    if (dados.email && dados.email !== usuarios[idx].email) {
        if (!validarEmail(dados.email)) throw new Error('Formato de e-mail inválido');
        validarEmailUnico(dados.email, id);
    }

    if (dados.perfil) {
        validarPerfil(dados.perfil);
    }

    if (dados.senha) {
        if (!dados.confirmacaoSenha) throw new Error('Confirmação de senha obrigatória ao alterar a senha');
        validarSenhasIguais(dados.senha, dados.confirmacaoSenha);
        if (dados.senha.length < 6) throw new Error('A senha deve ter no mínimo 6 caracteres');
        dados = { ...dados, senha: bcrypt.hashSync(dados.senha, 10) };
    }

    const { confirmacaoSenha, ...dadosSemConfirmacao } = dados;
    usuarios[idx] = { ...usuarios[idx], ...dadosSemConfirmacao, id };

    const { senha, ...semSenha } = usuarios[idx];
    return semSenha;
}

function remover(id) {
    const idx = usuarios.findIndex(u => u.id === id);
    if (idx === -1) return false;
    usuarios.splice(idx, 1);
    return true;
}

module.exports = { listarTodos, buscarPorId, criar, atualizar, atualizarParcial, remover };
