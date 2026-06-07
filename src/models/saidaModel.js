const sequelize = require('../../config/localConnection');
const { DataTypes, Op } = require('sequelize');
const EstoqueModel = require('./estoqueModel');

const TIPOS_SAIDA_MANUAL = ['devolucao', 'quebra', 'vencimento', 'erro_operacional'];

// ── Schema ──

const TODOS_TIPOS_SAIDA = [...TIPOS_SAIDA_MANUAL, 'venda', 'estorno_venda'];

const Saida = sequelize.define('Saida', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    produtoId:   { type: DataTypes.INTEGER },
    nomeProduto: { type: DataTypes.STRING, allowNull: false },
    quantidade:  { type: DataTypes.INTEGER, allowNull: false },
    tipoSaida:   { type: DataTypes.ENUM(...TODOS_TIPOS_SAIDA), allowNull: false },
    descricao:   { type: DataTypes.STRING, allowNull: false },
    data:        { type: DataTypes.DATEONLY, allowNull: false },
    origem:      { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: 'saida',
    freezeTableName: true,
    timestamps: false,
});

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

async function registrar(produtoId, quantidade, tipoSaida, descricao, data, origem) {
    const produtoAtualizado = await EstoqueModel.saida(Number(produtoId), Number(quantidade));
    return Saida.create({
        produtoId:   Number(produtoId),
        nomeProduto: produtoAtualizado.nome,
        quantidade:  Number(quantidade),
        tipoSaida,
        descricao,
        data,
        origem,
    });
}

// ── Funções públicas ──────────────────────────────────────────────────────────

async function listarTodos(filtros = {}) {
    const where = {};
    if (filtros.tipoSaida) where.tipoSaida = filtros.tipoSaida;
    if (filtros.origem)    where.origem    = filtros.origem;
    return Saida.findAll({ where, order: [['id', 'ASC']] });
}

async function buscarPorId(id) {
    return Saida.findByPk(id);
}

async function criarManual(dados) {
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

// Chamado pelo model de comanda ao fechar pedido
async function registrarSaidaVenda(produtoId, quantidade) {
    return registrar(
        produtoId,
        quantidade,
        'venda',
        'Saída automática por venda em comanda',
        new Date().toISOString().split('T')[0],
        'venda'
    );
}

// Chamado pelo model de comanda ao editar ou remover item
async function estornarSaidaVenda(produtoId, quantidade) {
    await EstoqueModel.entrada(Number(produtoId), Number(quantidade));
    const produto = await require('./produtoModel').buscarPorId(Number(produtoId));
    return Saida.create({
        produtoId:   Number(produtoId),
        nomeProduto: produto.nome,
        quantidade:  Number(quantidade),
        tipoSaida:   'estorno_venda',
        descricao:   'Estorno automático por edição ou remoção de item na comanda',
        data:        new Date().toISOString().split('T')[0],
        origem:      'estorno_venda',
    });
}

async function remover(id) {
    const saida = await Saida.findByPk(id);
    if (!saida) return null;
    if (saida.origem === 'venda') {
        throw new Error('Saídas por venda não podem ser removidas manualmente. Use o estorno via comanda');
    }
    await EstoqueModel.entrada(saida.produtoId, saida.quantidade);
    await saida.destroy();
    return saida;
}

module.exports = {
    Saida,
    listarTodos,
    buscarPorId,
    criarManual,
    registrarSaidaVenda,
    estornarSaidaVenda,
    remover,
    TIPOS_SAIDA_MANUAL,
};
