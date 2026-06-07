const sequelize = require('../../config/localConnection');
const { DataTypes, Op } = require('sequelize');
const ClienteModel  = require('./clienteModel');
const ProdutoModel  = require('./produtoModel');
const SaidaModel    = require('./saidaModel');
const { CONSUMIDOR_FINAL_ID } = require('./clienteModel');
const PagamentoModel = require('./pagamentoModel');

const STATUS = { ABERTA: 'aberta', FECHADA: 'fechada', CANCELADA: 'cancelada' };

// ── Schema ──

const Comanda = sequelize.define('Comanda', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    status:      { type: DataTypes.ENUM(...Object.values(STATUS)), allowNull: false, defaultValue: STATUS.ABERTA },
    infoCliente: { type: DataTypes.STRING },
    clienteId:   { type: DataTypes.INTEGER, allowNull: false, defaultValue: CONSUMIDOR_FINAL_ID },
    total:       { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
}, {
    tableName: 'comanda',
    freezeTableName: true,
    timestamps: false,
});

const ComandaItem = sequelize.define('ComandaItem', {
    id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    comandaId:     { type: DataTypes.INTEGER, allowNull: false },
    produtoId:     { type: DataTypes.INTEGER, allowNull: false },
    nomeProduto:   { type: DataTypes.STRING, allowNull: false },
    precoUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    quantidade:    { type: DataTypes.INTEGER, allowNull: false },
    subtotal:      { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
    tableName: 'comanda_item',
    freezeTableName: true,
    timestamps: false,
});

// Associações locais
Comanda.hasMany(ComandaItem, { foreignKey: 'comandaId', as: 'itens' });
ComandaItem.belongsTo(Comanda, { foreignKey: 'comandaId' });


async function quantidadeReservada(produtoId, ignorarComandaId = null) {
    const where = { status: STATUS.ABERTA };
    if (ignorarComandaId) where.id = { [Op.ne]: ignorarComandaId };
    const abertas = await Comanda.findAll({ attributes: ['id'], where });
    const ids = abertas.map(c => c.id);
    if (ids.length === 0) return 0;
    const result = await ComandaItem.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('quantidade')), 'total']],
        where: { produtoId, comandaId: { [Op.in]: ids } },
        raw: true,
    });
    return Number(result[0]?.total || 0);
}

async function estoqueDisponivel(produtoId, ignorarComandaId = null) {
    const produto = await ProdutoModel.buscarPorId(produtoId);
    if (!produto) throw new Error(`Produto com id ${produtoId} não encontrado`);
    const reservado = await quantidadeReservada(produtoId, ignorarComandaId);
    return produto.quantidadeEstoque - reservado;
}

// ── Validações ────────────────────────────────────────────────────────────────

async function validarClienteExiste(clienteId) {
    const cliente = await ClienteModel.buscarPorId(clienteId);
    if (!cliente) throw new Error(`Cliente com id ${clienteId} não encontrado`);
    return cliente;
}

async function validarProdutoExiste(produtoId) {
    const produto = await ProdutoModel.buscarPorId(produtoId);
    if (!produto) throw new Error(`Produto com id ${produtoId} não encontrado`);
    return produto;
}

function validarQuantidade(quantidade) {
    const qtd = Number(quantidade);
    if (!Number.isInteger(qtd) || qtd <= 0) {
        throw new Error('A quantidade deve ser um número inteiro maior que zero');
    }
    return qtd;
}

function validarComandaAberta(comanda) {
    if (comanda.status === STATUS.FECHADA || comanda.status === STATUS.CANCELADA) {
        throw new Error('Não é possível alterar uma comanda fechada ou cancelada');
    }
}

// ── Cálculo do total ──────────────────────────────────────────────────────────

function calcularTotal(itens) {
    return itens.reduce((soma, item) => soma + Number(item.subtotal), 0);
}

// helper interno
async function _buscarComandaComItens(id) {
    return Comanda.findByPk(id, { include: [{ model: ComandaItem, as: 'itens' }] });
}

// ── Funções de dados ──────────────────────────────────────────────────────────

async function listarTodos(filtros = {}) {
    const where = {};
    if (filtros.status) where.status = filtros.status;
    return Comanda.findAll({ where, include: [{ model: ComandaItem, as: 'itens' }], order: [['id', 'ASC']] });
}

async function buscarPorId(id) {
    return _buscarComandaComItens(id);
}

// Abre uma nova comanda — clienteId e infoCliente são opcionais
// Se clienteId não for informado, usa Consumidor Final automaticamente
async function criar(dados = {}) {
    const clienteId = dados.clienteId ? Number(dados.clienteId) : CONSUMIDOR_FINAL_ID;
    await validarClienteExiste(clienteId);
    const novaComanda = await Comanda.create({
        status:      STATUS.ABERTA,
        infoCliente: dados.infoCliente || null,
        clienteId,
        total:       0,
    });
    return _buscarComandaComItens(novaComanda.id);
}

// Atualiza infoCliente e/ou clienteId enquanto a comanda estiver aberta
async function atualizarCabecalho(id, dados) {
    const comanda = await _buscarComandaComItens(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    const updates = {};
    if (dados.infoCliente !== undefined) updates.infoCliente = dados.infoCliente || null;
    if (dados.clienteId !== undefined) {
        const clienteId = dados.clienteId ? Number(dados.clienteId) : CONSUMIDOR_FINAL_ID;
        await validarClienteExiste(clienteId);
        updates.clienteId = clienteId;
    }
    await comanda.update(updates);
    return comanda;
}

// Adiciona um item ou incrementa a quantidade se o produto já estiver na comanda.
// Valida disponibilidade considerando o que outras comandas abertas já reservaram.
async function adicionarItem(id, dados) {
    const comanda = await _buscarComandaComItens(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    const produto = await validarProdutoExiste(Number(dados.produtoId));
    const qtdAdd  = validarQuantidade(dados.quantidade);

    const itemExistente = comanda.itens.find(i => i.produtoId === produto.id);
    const qtdNaComanda  = itemExistente ? itemExistente.quantidade : 0;

    const disponivel = await estoqueDisponivel(produto.id, id);

    if (qtdNaComanda + qtdAdd > disponivel) {
        throw new Error(
            `Estoque insuficiente. Disponível (fora desta comanda): ${disponivel - qtdNaComanda}, solicitado: ${qtdAdd}`
        );
    }

    if (itemExistente) {
        const novaQtd = itemExistente.quantidade + qtdAdd;
        await itemExistente.update({
            quantidade: novaQtd,
            subtotal:   novaQtd * Number(itemExistente.precoUnitario),
        });
    } else {
        await ComandaItem.create({
            comandaId:     comanda.id,
            produtoId:     produto.id,
            nomeProduto:   produto.nome,
            precoUnitario: Number(produto.precoVenda),
            quantidade:    qtdAdd,
            subtotal:      qtdAdd * Number(produto.precoVenda),
        });
    }

    // Recalcula total
    const atualizada = await _buscarComandaComItens(id);
    await atualizada.update({ total: calcularTotal(atualizada.itens) });
    return _buscarComandaComItens(id);
}

// Altera a quantidade de um item (envia a quantidade NOVA desejada).
async function atualizarItem(id, produtoId, dados) {
    const comanda = await _buscarComandaComItens(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    const pId = Number(produtoId);
    const item = comanda.itens.find(i => i.produtoId === pId);
    if (!item) throw new Error(`Produto com id ${pId} não encontrado na comanda`);

    const novaQtd = validarQuantidade(dados.quantidade);
    const disponivel = await estoqueDisponivel(pId, id);

    if (novaQtd > disponivel) {
        throw new Error(
            `Estoque insuficiente. Disponível (fora desta comanda): ${disponivel}, solicitado: ${novaQtd}`
        );
    }

    await item.update({
        quantidade: novaQtd,
        subtotal:   novaQtd * Number(item.precoUnitario),
    });

    const atualizada = await _buscarComandaComItens(id);
    await atualizada.update({ total: calcularTotal(atualizada.itens) });
    return _buscarComandaComItens(id);
}

// Remove um item da comanda — sem movimentar estoque (ainda não foi baixado)
async function removerItem(id, produtoId) {
    const comanda = await _buscarComandaComItens(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    const pId = Number(produtoId);
    const item = comanda.itens.find(i => i.produtoId === pId);
    if (!item) throw new Error(`Produto com id ${pId} não encontrado na comanda`);

    await item.destroy();
    const atualizada = await _buscarComandaComItens(id);
    await atualizada.update({ total: calcularTotal(atualizada.itens) });
    return _buscarComandaComItens(id);
}

// Fecha a comanda: registra as saídas no estoque e marca a comanda como fechada.
function fechar(id) {
    const comanda = buscarPorId(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    if (comanda.itens.length === 0) {
        throw new Error('Não é possível fechar uma comanda sem itens');
    }

    for (const item of comanda.itens) {
        await SaidaModel.registrarSaidaVenda(item.produtoId, item.quantidade);
    }
 
    comanda.status    = STATUS.FECHADA;
    comanda.fechadoEm = new Date().toISOString();
   
     // Gera o registro de pagamento pendente
    const pagamento = PagamentoModel.criar(comanda.id, comanda.clienteId, comanda.total);
    comanda.pagamentoId = pagamento.id;
 
    return { comanda, pagamento };
}

// Cancela a comanda sem movimentar estoque (nada foi baixado)
async function cancelar(id) {
    const comanda = await _buscarComandaComItens(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);
    await comanda.update({ status: STATUS.CANCELADA });
    return comanda;
}

module.exports = { Comanda, ComandaItem, listarTodos, buscarPorId, criar, atualizarCabecalho, adicionarItem, atualizarItem, removerItem, fechar, cancelar, STATUS };