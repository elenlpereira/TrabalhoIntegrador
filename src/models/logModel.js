const sequelize = require('../../config/localConnection');
const { DataTypes, Op } = require('sequelize');

// ── Schema ──

const Log = sequelize.define('Log', {
    id_log:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fk_usuario: { type: DataTypes.INTEGER, allowNull: false },
    fk_comanda: { type: DataTypes.INTEGER },
    fk_compra:  { type: DataTypes.INTEGER },
    tipo:       { type: DataTypes.STRING(50), allowNull: false },
    data_hora:  { type: DataTypes.DATE, allowNull: false },
    descricao:  { type: DataTypes.STRING(255) },
}, {
    tableName: 'log',
    freezeTableName: true,
    timestamps: false,
});

// ── Funções de dados ──

async function registrar({ fk_usuario, fk_comanda = null, fk_compra = null, tipo, descricao = null }) {
    return Log.create({
        fk_usuario: Number(fk_usuario),
        fk_comanda: fk_comanda ? Number(fk_comanda) : null,
        fk_compra:  fk_compra  ? Number(fk_compra)  : null,
        tipo,
        data_hora:  new Date(),
        descricao,
    });
}

async function listarTodos(filtros = {}) {
    const where = {};
    if (filtros.tipo) {
        const tipos = filtros.tipo.split(',').map(t => t.trim()).filter(Boolean)
        where.tipo = tipos.length === 1 ? tipos[0] : { [Op.in]: tipos }
    }
    if (filtros.fk_usuario) where.fk_usuario = Number(filtros.fk_usuario);
    if (filtros.fk_comanda) where.fk_comanda = Number(filtros.fk_comanda);
    if (filtros.data_inicio || filtros.data_fim) {
        // Interpreta as datas no fuso UTC-3 (Brasil)
        const inicio = filtros.data_inicio
            ? new Date(filtros.data_inicio + 'T00:00:00-03:00')
            : new Date('2000-01-01T00:00:00-03:00');
        const fim = filtros.data_fim
            ? new Date(filtros.data_fim + 'T23:59:59-03:00')
            : new Date();
        where.data_hora = { [Op.between]: [inicio, fim] };
    }

    // Importação lazy para evitar dependência circular
    const { Usuario } = sequelize.models;
    const include = Usuario
        ? [{ model: Usuario, attributes: ['nome', 'perfil_acesso'], required: false }]
        : [];

    return Log.findAll({ where, include, order: [['data_hora', 'DESC']] });
}

async function buscarPorId(id) {
    return Log.findByPk(id);
}

module.exports = { Log, registrar, listarTodos, buscarPorId };
