// id: 1 é reservado para Consumidor Final — não pode ser editado nem removido
const CONSUMIDOR_FINAL = { id: 1, nome: 'Consumidor Final', cpf: '00000000000', telefone: null, email: null };
const CONSUMIDOR_FINAL_ID = 1;
 
let clientes = [];
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
     // Protege o CPF do Consumidor Final de ser cadastrado em outro cliente
    if (cpfNormalizado === CONSUMIDOR_FINAL.cpf && idIgnorado !== CONSUMIDOR_FINAL_ID) {
        throw new Error('CPF já cadastrado');
    }
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
function isConsumidorFinal(id) {
    return Number(id) === CONSUMIDOR_FINAL_ID;
}
 
// ── Funções de dados ──────────────────────────────────────────────────────────
 
function listarTodos() {
     return [CONSUMIDOR_FINAL, ...clientes];
}
 
function buscarPorId(id) {
    if (isConsumidorFinal(id)) return CONSUMIDOR_FINAL;
    return clientes.find(c => c.id === id) || null;
}
 
function buscarPorCPF(cpf) {
    const cpfNormalizado = normalizarCpf(cpf);
    if (cpfNormalizado === CONSUMIDOR_FINAL.cpf) return CONSUMIDOR_FINAL;
    return clientes.find(c => normalizarCpf(c.cpf) === cpfNormalizado) || null;
}

function buscarPorNome(nome) {
    const termo = nome.toLowerCase();
    const resultadoCF = CONSUMIDOR_FINAL.nome.toLowerCase().includes(termo) ? [CONSUMIDOR_FINAL] : [];
    const resultadoClientes = clientes.filter(c => c.nome.toLowerCase().includes(termo));
    return [...resultadoCF, ...resultadoClientes];
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
    if (isConsumidorFinal(id)) throw new Error('Consumidor Final não pode ser editado');
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
    if (isConsumidorFinal(id)) throw new Error('Consumidor Final não pode ser editado');
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
    if (isConsumidorFinal(id)) throw new Error('Consumidor Final não pode ser removido');
    const idx = clientes.findIndex(c => c.id === id);
    if (idx === -1) return false;
    clientes.splice(idx, 1);
    return true;
}
 
module.exports = { listarTodos, buscarPorNome, buscarPorId, buscarPorCPF, criar, atualizar, atualizarParcial, remover, CONSUMIDOR_FINAL_ID};
