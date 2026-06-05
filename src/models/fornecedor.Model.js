let fornecedores = [
    {
        id: 1,
        razaoSocial: 'Distribuidora ABC Ltda',
        cnpj: '11222333000181',
        telefone: '49933334444',
        email: 'contato@abc.com',
        cidade: 'Chapecó',
        categoriaProduto: 'bebidas'
    }
];
let proximoId = 2;
 
const CATEGORIAS_VALIDAS = ['bebidas', 'doces', 'salgados', 'não perecíveis', 'laticinios', 'limpeza', 'outros'];
 
// ── Validações ────────────────────────────────────────────────────────────────
 
function normalizarCnpj(cnpj) {
    return cnpj.replace(/[.\-\/]/g, '');
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
    if (!CATEGORIAS_VALIDAS.includes(categoria.toLowerCase())) {
        throw new Error(`Categoria inválida. Valores aceitos: ${CATEGORIAS_VALIDAS.join(', ')}`);
    }
}
 
function validarCnpjUnico(cnpj, idIgnorado = null) {
    const cnpjNormalizado = normalizarCnpj(cnpj);
    const existe = fornecedores.find(f => normalizarCnpj(f.cnpj) === cnpjNormalizado && f.id !== idIgnorado);
    if (existe) throw new Error('CNPJ já cadastrado');
}
 
function validarEmailUnico(email, idIgnorado = null) {
    if (!email) return;
    const existe = fornecedores.find(f => f.email === email && f.id !== idIgnorado);
    if (existe) throw new Error('E-mail já cadastrado');
}
 
function validarFornecedor(dados, idIgnorado = null) {
    validarCamposObrigatorios(dados);
    if (!validarFormatoCnpj(dados.cnpj)) {
        throw new Error('Formato de CNPJ inválido. Use 00000000000000 ou 00.000.000/0000-00');
    }
    if (!validarEmail(dados.email)) {
        throw new Error('Formato de e-mail inválido');
    }
    validarCategoria(dados.categoriaProduto);
    validarCnpjUnico(dados.cnpj, idIgnorado);
    validarEmailUnico(dados.email, idIgnorado);
}
 
// ── Funções de dados ──────────────────────────────────────────────────────────
 
function listarTodos() {
    return fornecedores;
}
 
function buscarPorId(id) {
    return fornecedores.find(f => f.id === id) || null;
}
 
function buscarPorCNPJ(cnpj) {
    const cnpjNormalizado = normalizarCnpj(cnpj);
    return fornecedores.find(f => normalizarCnpj(f.cnpj) === cnpjNormalizado) || null;
}
 
function buscarPorNome(nome) {
    const termo = nome.toLowerCase();
    return fornecedores.filter(f => f.razaoSocial.toLowerCase().includes(termo));
}
 
function criar(dados) {
    validarFornecedor(dados);
    const novoFornecedor = {
        id: proximoId++,
        razaoSocial: dados.razaoSocial,
        cnpj: normalizarCnpj(dados.cnpj),
        telefone: dados.telefone,
        email: dados.email,
        cidade: dados.cidade,
        categoriaProduto: dados.categoriaProduto.toLowerCase(),
    };
    fornecedores.push(novoFornecedor);
    return novoFornecedor;
}
 
// PUT - exige objeto completo
function atualizar(id, dados) {
    const idx = fornecedores.findIndex(f => f.id === id);
    if (idx === -1) return null;
    validarFornecedor(dados, id);
    fornecedores[idx] = {
        id,
        razaoSocial: dados.razaoSocial,
        cnpj: normalizarCnpj(dados.cnpj),
        telefone: dados.telefone,
        email: dados.email,
        cidade: dados.cidade,
        categoriaProduto: dados.categoriaProduto.toLowerCase(),
    };
    return fornecedores[idx];
}
 
// PATCH - atualiza parcialmente
function atualizarParcial(id, dados) {
    const idx = fornecedores.findIndex(f => f.id === id);
    if (idx === -1) return null;
 
    if (dados.cnpj && normalizarCnpj(dados.cnpj) !== normalizarCnpj(fornecedores[idx].cnpj)) {
        if (!validarFormatoCnpj(dados.cnpj)) throw new Error('Formato de CNPJ inválido. Use 00000000000000 ou 00.000.000/0000-00');
        validarCnpjUnico(dados.cnpj, id);
        dados = { ...dados, cnpj: normalizarCnpj(dados.cnpj) };
    }
    if (dados.email && dados.email !== fornecedores[idx].email) {
        if (!validarEmail(dados.email)) throw new Error('Formato de e-mail inválido');
        validarEmailUnico(dados.email, id);
    }
    if (dados.categoriaProduto) {
        validarCategoria(dados.categoriaProduto);
        dados = { ...dados, categoriaProduto: dados.categoriaProduto.toLowerCase() };
    }
 
    fornecedores[idx] = { ...fornecedores[idx], ...dados, id };
    return fornecedores[idx];
}
 
function remover(id) {
    const idx = fornecedores.findIndex(f => f.id === id);
    if (idx === -1) return false;
    fornecedores.splice(idx, 1);
    return true;
}
 
module.exports = { listarTodos, buscarPorId, buscarPorCNPJ, buscarPorNome, criar, atualizar, atualizarParcial, remover, CATEGORIAS_VALIDAS };