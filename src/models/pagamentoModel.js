const { CONSUMIDOR_FINAL_ID } = require('./clienteModel');
const FichaModel = require('./fichaModel');

const FORMAS_VISTA  = ['dinheiro', 'pix', 'debito', 'credito'];
const FORMAS_PRAZO  = ['prazo'];
const FORMAS_VALIDAS = [...FORMAS_VISTA, ...FORMAS_PRAZO];

const STATUS = { PENDENTE: 'pendente', PAGO: 'pago' };

let pagamentos  = [];
let proximoId   = 1;

// ── Validações ────────────────────────────────────────────────────────────────

function validarLancamentos(lancamentos, clienteId, totalComanda) {
    if (!Array.isArray(lancamentos) || lancamentos.length === 0) {
        throw new Error('Informe ao menos um lançamento de pagamento');
    }

    for (const [i, lanc] of lancamentos.entries()) {
        if (!FORMAS_VALIDAS.includes(lanc.forma)) {
            throw new Error(
                `Lançamento ${i + 1}: forma inválida "${lanc.forma}". Aceitas: ${FORMAS_VALIDAS.join(', ')}`
            );
        }

        if (lanc.forma === 'prazo' && Number(clienteId) === CONSUMIDOR_FINAL_ID) {
            throw new Error('Pagamento à prazo não é permitido para Consumidor Final');
        }

        const valor = Number(lanc.valor);
        if (isNaN(valor) || valor <= 0) {
            throw new Error(`Lançamento ${i + 1}: valor deve ser maior que zero`);
        }
    }

    const totalPago = lancamentos.reduce((s, l) => s + Number(l.valor), 0);
    // Arredonda para evitar problemas de ponto flutuante
    if (Math.round(totalPago * 100) < Math.round(totalComanda * 100)) {
        throw new Error(
            `Valor pago (${totalPago.toFixed(2)}) é menor que o total da comanda (${totalComanda.toFixed(2)})`
        );
    }

    return totalPago;
}

// ── Funções de dados ──────────────────────────────────────────────────────────

function listarTodos(filtros = {}) {
    let resultado = [...pagamentos];
    if (filtros.status) {
        resultado = resultado.filter(p => p.status === filtros.status);
    }
    return resultado;
}

function buscarPorId(id) {
    return pagamentos.find(p => p.id === id) || null;
}

function buscarPorComanda(comandaId) {
    return pagamentos.find(p => p.comandaId === comandaId) || null;
}

// Criado pelo comandaModel ao fechar — pagamento nasce como pendente
function criar(comandaId, clienteId, totalComanda) {
    const novoPagamento = {
        id:           proximoId++,
        comandaId:    Number(comandaId),
        clienteId:    Number(clienteId),
        totalComanda: Number(totalComanda),
        status:       STATUS.PENDENTE,
        lancamentos:  [],
        totalPago:    0,
        troco:        0,
        criadoEm:     new Date().toISOString(),
        pagoEm:       null,
    };

    pagamentos.push(novoPagamento);
    return novoPagamento;
}

// Liquida o pagamento com os lançamentos informados
function pagar(id, lancamentos) {
    const pagamento = buscarPorId(id);
    if (!pagamento) return null;

    if (pagamento.status === STATUS.PAGO) {
        throw new Error('Este pagamento já foi liquidado');
    }

    const totalPago = validarLancamentos(lancamentos, pagamento.clienteId, pagamento.totalComanda);

    // Troco: diferença entre o total pago em dinheiro e o que excede o total da comanda
    const totalDinheiro = lancamentos
        .filter(l => l.forma === 'dinheiro')
        .reduce((s, l) => s + Number(l.valor), 0);

    const excedente = Math.round((totalPago - pagamento.totalComanda) * 100) / 100;
    const troco     = totalDinheiro > 0 ? Math.min(excedente, totalDinheiro) : 0;

    pagamento.lancamentos = lancamentos.map(l => ({
        forma: l.forma,
        valor: Number(l.valor),
    }));
    pagamento.totalPago = Math.round(totalPago * 100) / 100;
    pagamento.troco = Math.round(troco * 100) / 100;
    pagamento.status = STATUS.PAGO;
    pagamento.pagoEm = new Date().toISOString();


    // Registra débitos na ficha do cliente para cada lançamento a prazo
    const lancamentosPrazo = lancamentos.filter(l => l.forma === 'prazo');
    for (const lanc of lancamentosPrazo) {
        FichaModel.registrarDebito(pagamento.clienteId, pagamento.comandaId, lanc.valor);
    }
    return pagamento;
}

module.exports = { listarTodos, buscarPorId, buscarPorComanda, criar, pagar, STATUS, FORMAS_VALIDAS, FORMAS_VISTA, FORMAS_PRAZO};