const bcrypt = require('bcryptjs');
 
let clientes = [
    { id: 1, nome: 'João Silva', cpf: '12345678900', telefone: '11999999999', email: 'joao.silva@example.com' }
];
let proximoId = 2;
 
// ── Validações ────────────────────────────────────────────────────────────────
 
function validarFormatoCpf(cpf) {
    return /^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(cpf);
}
 
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
 
function normalizarCpf(cpf) {
    return cpf.replace(/[.\-]/g, '');
}
 
function validarCamposObrigatorios(dados) {
    if (!dados.nome || !dados.cpf || !dados.telefone) {
        throw new Error('Campos obrigatórios ausentes: nome, cpf, telefone');
    }
}
 
function validarCpfUnico(cpf, idIgnorado = null) {
    const cpfNormalizado = normalizarCpf(cpf);
    const existe = clientes.find(c => normalizarCpf(c.cpf) === cpfNormalizado && c.id !== idIgnorado);
    if (existe) throw new Error('CPF já cadastrado');
}
 
function validarEmailUnico(email, idIgnorado = null) {
    if (!email) return;
    const existe = clientes.find(c => c.email === email && c.id !== idIgnorado);
    if (existe) throw new Error('E-mail já cadastrado');
}
 
function validarCliente(dados, idIgnorado = null) {
    validarCamposObrigatorios(dados);
    if (!validarFormatoCpf(dados.cpf)) {
        throw new Error('Formato de CPF inválido. Use 00000000000 ou 000.000.000-00');
    }
    if (dados.email && !validarEmail(dados.email)) {
        throw new Error('Formato de e-mail inválido');
    }
    validarCpfUnico(dados.cpf, idIgnorado);
    validarEmailUnico(dados.email, idIgnorado);
}
 
// ── Funções de dados ──────────────────────────────────────────────────────────
 
function listarTodos() {
    return clientes;
}
 
function buscarPorId(id) {
    return clientes.find(c => c.id === id) || null;
}
 
function buscarPorCPF(cpf) {
    const cpfNormalizado = normalizarCpf(cpf);
    return clientes.find(c => normalizarCpf(c.cpf) === cpfNormalizado) || null;
}
 
function criar(dados) {
    validarCliente(dados);
 
    const novoCliente = {
        id: proximoId++,
        nome: dados.nome,
        cpf: normalizarCpf(dados.cpf),
        telefone: dados.telefone || null,
        email: dados.email || null,
    };
    clientes.push(novoCliente);
    return novoCliente;
}
 
// PUT - exige objeto completo
function atualizar(id, dados) {
    const idx = clientes.findIndex(c => c.id === id);
    if (idx === -1) return null;
 
    validarCliente(dados, id);
 
    clientes[idx] = {
        id,
        nome: dados.nome,
        cpf: normalizarCpf(dados.cpf),
        telefone: dados.telefone || null,
        email: dados.email || null,
    };
    return clientes[idx];
}
 
// PATCH - atualiza parcialmente
function atualizarParcial(id, dados) {
    const idx = clientes.findIndex(c => c.id === id);
    if (idx === -1) return null;
 
    if (dados.cpf && normalizarCpf(dados.cpf) !== normalizarCpf(clientes[idx].cpf)) {
        if (!validarFormatoCpf(dados.cpf)) throw new Error('Formato de CPF inválido. Use 00000000000 ou 000.000.000-00');
        validarCpfUnico(dados.cpf, id);
        dados = { ...dados, cpf: normalizarCpf(dados.cpf) };
    }
 
    if (dados.email && dados.email !== clientes[idx].email) {
        if (!validarEmail(dados.email)) throw new Error('Formato de e-mail inválido');
        validarEmailUnico(dados.email, id);
    }
 
    clientes[idx] = { ...clientes[idx], ...dados, id };
    return clientes[idx];
}
 
function remover(id) {
    const idx = clientes.findIndex(c => c.id === id);
    if (idx === -1) return false;
    clientes.splice(idx, 1);
    return true;
}
 

function buscarPorNome(nome) {
    const termo = nome.toLowerCase();
    return clientes.filter(c => c.nome.toLowerCase().includes(termo));
}
 
module.exports = { listarTodos, buscarPorNome, buscarPorId, buscarPorCPF, criar, atualizar, atualizarParcial, remover};
