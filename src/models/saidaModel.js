const EstoqueModel = require('./estoqueModel');

const TIPOS_SAIDA_MANUAL = ['devolucao', 'quebra', 'vencimento', 'erro_operacional'];

let saidas = [];
let proximoId = 1;

// ── Validações ────────────────────────────────────────────────────────────────

function validarCamposObrigatorios(dados) {
    const campos = ['produtoId', 'quantidade', 'tipoSaida', 'descricao', 'data'];
    const ausentes = campos.filter(c => dados[c] === undefined || dados[c] === null || dados[c] === '');
    if (ausentes.length > 0) {
        throw new Error(`Campos obrigatórios ausentes: ${ausentes.join(', ')}`);
    }
}

function validarTipoSaida(tipoSaida) {
    if (!TIPOS_SAIDA_MANUAL.includes(tipoSaida)) {
        throw new Error(`Tipo de saída inválido. Valores aceitos: ${TIPOS_SAIDA_MANUAL.join(', ')}`);
    }
}

function validarData(data) {
    if (isNaN(Date.parse(data))) throw new Error('Data inválida');
}

function validarSaidaManual(dados) {
    validarCamposObrigatorios(dados);
    validarTipoSaida(dados.tipoSaida);
    validarData(dados.data);
}

// ── Funções internas ──────────────────────────────────────────────────────────

function registrar(produtoId, quantidade, tipoSaida, descricao, data, origem) {
    const produtoAtualizado = EstoqueModel.saida(Number(produtoId), Number(quantidade));

    const novaSaida = {
        id: proximoId++,
        produtoId: Number(produtoId),
        nomeProduto: produtoAtualizado.nome,
        quantidade: Number(quantidade),
        tipoSaida,
        descricao,
        data,
        origem,
    };

    saidas.push(novaSaida);
    return novaSaida;
}

// ── Funções públicas ──────────────────────────────────────────────────────────

function listarTodos(filtros = {}) {
    let resultado = [...saidas];
    if (filtros.tipoSaida) {
        resultado = resultado.filter(s => s.tipoSaida === filtros.tipoSaida);
    }
    if (filtros.origem) {
        resultado = resultado.filter(s => s.origem === filtros.origem);
    }
    return resultado;
}

function buscarPorId(id) {
    return saidas.find(s => s.id === id) || null;
}

function criarManual(dados) {
    validarSaidaManual(dados);
    return registrar(
        dados.produtoId,
        dados.quantidade,
        dados.tipoSaida,
        dados.descricao,
        dados.data,
        'manual'
    );
}

// TODO: chamado pelo model de comanda ao adicionar item ao pedido
function registrarSaidaVenda(produtoId, quantidade) {
    return registrar(
        produtoId,
        quantidade,
        'venda',
        'Saída automática por venda em comanda',
        new Date().toISOString().split('T')[0],
        'venda'
    );
}

// TODO: chamado pelo model de comanda ao editar ou remover item do pedido
function estornarSaidaVenda(produtoId, quantidade) {
    EstoqueModel.entrada(Number(produtoId), Number(quantidade));

    const estorno = {
        id: proximoId++,
        produtoId: Number(produtoId),
        quantidade: Number(quantidade),
        tipoSaida: 'estorno_venda',
        descricao: 'Estorno automático por edição ou remoção de item na comanda',
        data: new Date().toISOString().split('T')[0],
        origem: 'estorno_venda',
    };

    saidas.push(estorno);
    return estorno;
}

function remover(id) {
    const idx = saidas.findIndex(s => s.id === id);
    if (idx === -1) return null;

    const saida = saidas[idx];

    if (saida.origem === 'venda') {
        throw new Error('Saídas por venda não podem ser removidas manualmente. Use o estorno via comanda');
    }

    EstoqueModel.entrada(saida.produtoId, saida.quantidade);
    saidas.splice(idx, 1);
    return saida;
}

module.exports = {
    listarTodos,
    buscarPorId,
    criarManual,
    registrarSaidaVenda,
    estornarSaidaVenda,
    remover,
    TIPOS_SAIDA_MANUAL,
};
