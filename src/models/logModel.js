const sequelize = require('../../config/localConnection');
const { DataTypes } = require('sequelize');

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
    if (filtros.tipo)        where.tipo        = filtros.tipo;
    if (filtros.fk_usuario)  where.fk_usuario  = Number(filtros.fk_usuario);
    if (filtros.fk_comanda)  where.fk_comanda  = Number(filtros.fk_comanda);
    return Log.findAll({ where, order: [['data_hora', 'DESC']] });
}

async function buscarPorId(id) {
    return Log.findByPk(id);
}

module.exports = { Log, registrar, listarTodos, buscarPorId };
