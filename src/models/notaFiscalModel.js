const sequelize = require('../../config/localConnection');
const { DataTypes, Op } = require('sequelize');

// ── Schema ──

const NotaFiscal = sequelize.define('NotaFiscal', {
    id_nota_fiscal: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero:        { type: DataTypes.STRING(50), allowNull: false, unique: true },
    valor_total:   { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
    tableName: 'nota_fiscal',
    freezeTableName: true,
    timestamps: false,
});

// ── Validações ──

function validarCamposObrigatorios(dados) {
    if (!dados.numero || dados.valor_total === undefined || dados.valor_total === null) {
        throw new Error('Campos obrigatórios ausentes: numero, valor_total');
    }
}

async function validarNumeroUnico(numero, idIgnorado = null) {
    const where = { numero };
    if (idIgnorado) where.id_nota_fiscal = { [Op.ne]: idIgnorado };
    const existe = await NotaFiscal.findOne({ where });
    if (existe) throw new Error('Número de nota fiscal já cadastrado');
}

// ── Funções de dados ──

async function listarTodos() {
    return NotaFiscal.findAll({ order: [['id_nota_fiscal', 'ASC']] });
}

async function buscarPorId(id) {
    return NotaFiscal.findByPk(id);
}

async function criar(dados) {
    validarCamposObrigatorios(dados);
    await validarNumeroUnico(dados.numero);
    if (Number(dados.valor_total) <= 0) throw new Error('O valor total deve ser maior que zero');
    return NotaFiscal.create({
        numero:      dados.numero,
        valor_total: Number(dados.valor_total),
    });
}

async function atualizar(id, dados) {
    const nf = await NotaFiscal.findByPk(id);
    if (!nf) return null;
    validarCamposObrigatorios(dados);
    await validarNumeroUnico(dados.numero, id);
    if (Number(dados.valor_total) <= 0) throw new Error('O valor total deve ser maior que zero');
    await nf.update({ numero: dados.numero, valor_total: Number(dados.valor_total) });
    return nf;
}

async function remover(id) {
    const nf = await NotaFiscal.findByPk(id);
    if (!nf) return false;
    await nf.destroy();
    return true;
}

module.exports = { NotaFiscal, listarTodos, buscarPorId, criar, atualizar, remover };
