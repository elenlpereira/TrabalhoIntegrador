const EstoqueModel = require('./estoqueModel');
const FornecedorModel = require('./fornecedor.Model');

let compras = [];
let proximoId = 1;

// ── Validações ──

function validarCamposObrigatorios(dados) {
    const campos = ['produtoId', 'quantidade', 'fornecedorId', 'custoUnitario', 'dataRecebimento'];
    const ausentes = campos.filter(c => dados[c] === undefined || dados[c] === null || dados[c] === '');
    if (ausentes.length > 0) {
        throw new Error(`Campos obrigatórios ausentes: ${ausentes.join(', ')}`);
    }
}

function validarFornecedor(fornecedorId) {
    const fornecedor = FornecedorModel.buscarPorId(Number(fornecedorId));
    if (!fornecedor) throw new Error(`Fornecedor com id ${fornecedorId} não encontrado`);
    return fornecedor;
}

function validarData(data) {
    if (isNaN(Date.parse(data))) throw new Error('Data de recebimento inválida');
}

function validarCompra(dados) {
    validarCamposObrigatorios(dados);
    validarFornecedor(dados.fornecedorId);
    validarData(dados.dataRecebimento);
    if (Number(dados.custoUnitario) <= 0) throw new Error('O custo unitário deve ser maior que zero');
}

// ── Funções de dados ──

function listarTodos() {
    return [...compras];
}

function buscarPorId(id) {
    return compras.find(c => c.id === id) || null;
}

function criar(dados) {
    validarCompra(dados);

    const fornecedor = validarFornecedor(dados.fornecedorId);
    const quantidade = Number(dados.quantidade);
    const produtoAtualizado = EstoqueModel.entrada(Number(dados.produtoId), quantidade);

    const novaCompra = {
        id: proximoId++,
        produtoId: Number(dados.produtoId),
        nomeProduto: produtoAtualizado.nome,
        quantidade,
        fornecedorId: Number(dados.fornecedorId),
        nomeFornecedor: fornecedor.razaoSocial,
        custoUnitario: Number(dados.custoUnitario),
        totalCusto: quantidade * Number(dados.custoUnitario),
        numeroNotaFiscal: dados.numeroNotaFiscal || null,
        dataRecebimento: dados.dataRecebimento,
    };

    compras.push(novaCompra);
    return novaCompra;
}

function remover(id) {
    const idx = compras.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const compra = compras[idx];
    EstoqueModel.saida(compra.produtoId, compra.quantidade);
    compras.splice(idx, 1);
    return compra;
}

module.exports = { listarTodos, buscarPorId, criar, remover };
