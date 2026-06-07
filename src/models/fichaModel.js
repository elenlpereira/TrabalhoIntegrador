const ClienteModel = require('./clienteModel');

const FORMAS_QUITACAO  = ['dinheiro', 'pix', 'debito', 'credito'];
const STATUS = { ABERTA: 'aberta', QUITADA: 'quitada' };

let fichas = [];

// ── Validações ────────────────────────────────────────────────────────────────

function validarClienteExiste(clienteId) {
    const cliente = ClienteModel.buscarPorId(clienteId);
    if (!cliente) throw new Error(`Cliente com id ${clienteId} não encontrado`);
    return cliente;
}

function arredondar(valor) {
    return Math.round(valor * 100) / 100;
}

// ── Funções internas ──────────────────────────────────────────────────────────

function buscarOuCriarFicha(clienteId) {
    let ficha = fichas.find(f => f.clienteId === clienteId);
    if (!ficha) {
        const cliente = validarClienteExiste(clienteId);
        ficha = {
            clienteId,
            nomeCliente:  cliente.nome,
            status:       STATUS.ABERTA,
            saldoDevedor: 0,
            debitos:      [],
            pagamentos:   [],
        };
        fichas.push(ficha);
    }
    return ficha;
}

// ── Funções de dados ──────────────────────────────────────────────────────────

function listarTodos(filtros = {}) {
    let resultado = [...fichas];
    if (filtros.status) {
        resultado = resultado.filter(f => f.status === filtros.status);
    }
    return resultado;
}

function buscarPorCliente(clienteId) {
    return fichas.find(f => f.clienteId === Number(clienteId)) || null;
}

// Chamado pelo pagamentoModel quando há lançamento com forma 'prazo'
function registrarDebito(clienteId, comandaId, valor) {
    const ficha = buscarOuCriarFicha(Number(clienteId));

    ficha.debitos.push({
        comandaId:    Number(comandaId),
        valor:        arredondar(Number(valor)),
        adicionadoEm: new Date().toISOString(),
    });

    ficha.saldoDevedor = arredondar(ficha.saldoDevedor + Number(valor));

    if (ficha.status === STATUS.QUITADA) {
        ficha.status = STATUS.ABERTA;
    }

    return ficha;
}

// Abate um valor da ficha — pode ser parcial
function quitar(clienteId, dados) {
    const ficha = buscarPorCliente(Number(clienteId));
    if (!ficha) return null;

    if (ficha.saldoDevedor <= 0) {
        throw new Error('Esta ficha não possui saldo devedor');
    }

    const valor = Number(dados.valor);
    if (isNaN(valor) || valor <= 0) {
        throw new Error('O valor deve ser maior que zero');
    }

    if (!FORMAS_QUITACAO.includes(dados.forma)) {
        throw new Error(`Forma inválida "${dados.forma}". Aceitas: ${FORMAS_QUITACAO.join(', ')}`);
    }

    const valorAbatido = arredondar(Math.min(valor, ficha.saldoDevedor));

    ficha.pagamentos.push({
        valor:  valorAbatido,
        forma:  dados.forma,
        pagoEm: new Date().toISOString(),
    });

    ficha.saldoDevedor = arredondar(ficha.saldoDevedor - valorAbatido);

    if (ficha.saldoDevedor === 0) {
        ficha.status = STATUS.QUITADA;
    }

    return ficha;
}

module.exports = { listarTodos, buscarPorCliente, registrarDebito, quitar, STATUS, FORMAS_QUITACAO };