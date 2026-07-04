const sequelize = require('../../config/localConnection');
const { DataTypes, Op } = require('sequelize');
const ClienteModel = require('./clienteModel');
const LogModel     = require('./logModel');
const { CONSUMIDOR_FINAL_ID } = require('./clienteModel');

const STATUS_DIVIDA = { PENDENTE: 'pendente', PAGO_PARCIAL: 'pago_parcial', PAGO: 'pago' };

// ── Schema ──

const Divida = sequelize.define('Divida', {
    id_divida:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fk_cliente: { type: DataTypes.INTEGER, allowNull: false },
    fk_comanda: { type: DataTypes.INTEGER },
    debito:     { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    credito:    { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    saldo:      { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    data:       { type: DataTypes.DATEONLY, allowNull: false },
    status:     { type: DataTypes.STRING(20), allowNull: false, defaultValue: STATUS_DIVIDA.PENDENTE },
}, {
    tableName: 'divida',
    freezeTableName: true,
    timestamps: false,
});

// ── Validações ──

async function validarClienteExiste(clienteId) {
    const cliente = await ClienteModel.buscarPorId(clienteId);
    if (!cliente) throw new Error(`Cliente com id ${clienteId} não encontrado`);
    return cliente;
}

function validarClienteReal(clienteId) {
    if (Number(clienteId) === CONSUMIDOR_FINAL_ID) {
        throw new Error('Consumidor Final não pode ter dívida registrada');
    }
}

// ── Funções de dados ──

async function criar({ fk_cliente, fk_comanda = null, debito }) {
    await validarClienteExiste(fk_cliente);
    validarClienteReal(fk_cliente);
    if (Number(debito) <= 0) throw new Error('O valor do débito deve ser maior que zero');
    return Divida.create({
        fk_cliente: Number(fk_cliente),
        fk_comanda: fk_comanda ? Number(fk_comanda) : null,
        debito:     Number(debito),
        credito:    0,
        saldo:      Number(debito),
        data:       new Date().toISOString().slice(0, 10),
        status:     STATUS_DIVIDA.PENDENTE,
    });
}

async function listarTodos(filtros = {}) {
    const where = {};
    if (filtros.status) where.status = filtros.status;
    return Divida.findAll({ where, order: [['data', 'ASC'], ['id_divida', 'ASC']] });
}

async function listarPorCliente(clienteId) {
    return Divida.findAll({
        where: { fk_cliente: Number(clienteId) },
        order: [['data', 'ASC'], ['id_divida', 'ASC']],
    });
}

async function buscarPorId(id) {
    return Divida.findByPk(id);
}

async function totalDevidoPorCliente(clienteId) {
    const result = await Divida.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('saldo')), 'total']],
        where: {
            fk_cliente: Number(clienteId),
            status: { [Op.ne]: STATUS_DIVIDA.PAGO },
        },
        raw: true,
    });
    return Number(result[0]?.total || 0);
}

// RF14 / RF15 — quitacao parcial ou total: aplica o valor as dividas mais antigas primeiro (FIFO)
async function quitar(clienteId, { valor, fk_usuario }) {
    await validarClienteExiste(clienteId);
    if (!valor || Number(valor) <= 0) throw new Error('O valor do pagamento deve ser maior que zero');

    const pendentes = await Divida.findAll({
        where: {
            fk_cliente: Number(clienteId),
            status: { [Op.in]: [STATUS_DIVIDA.PENDENTE, STATUS_DIVIDA.PAGO_PARCIAL] },
        },
        order: [['data', 'ASC'], ['id_divida', 'ASC']],
    });

    if (pendentes.length === 0) throw new Error('Cliente nao possui dividas pendentes');

    let restante = Number(valor);

    for (const divida of pendentes) {
        if (restante <= 0) break;
        const pagamento   = Math.min(restante, Number(divida.saldo));
        const novoCredito = Number(divida.credito) + pagamento;
        const novoSaldo   = Number(divida.debito)  - novoCredito;
        const novoStatus  = novoSaldo <= 0 ? STATUS_DIVIDA.PAGO : STATUS_DIVIDA.PAGO_PARCIAL;
        await divida.update({ credito: novoCredito, saldo: novoSaldo, status: novoStatus });
        restante -= pagamento;
    }

    const valorPago = Number(valor) - Math.max(restante, 0);
    const troco     = Math.max(restante, 0);

    if (fk_usuario) {
        await LogModel.registrar({
            fk_usuario: Number(fk_usuario),
            tipo: 'quitar_ficha',
            descricao: `Quitacao R$ ${valorPago.toFixed(2)} na ficha do cliente ${clienteId}`,
        });
    }

    return { valor_pago: valorPago, troco, saldo_restante: await totalDevidoPorCliente(clienteId) };
}

module.exports = {
    Divida, STATUS_DIVIDA,
    criar, listarTodos, listarPorCliente, buscarPorId, totalDevidoPorCliente, quitar,
};
