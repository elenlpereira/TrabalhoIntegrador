const sequelize = require('../../config/localConnection');
const { DataTypes, Op } = require('sequelize');
const ClienteModel   = require('./clienteModel');
const ProdutoModel   = require('./produtoModel');
const EstoqueModel   = require('./estoqueModel');
const { CONSUMIDOR_FINAL_ID } = require('./clienteModel');
const LogModel       = require('./logModel');
const { Produto }    = require('./produtoModel');
const FichaModel     = require('./fichaModel');

const STATUS = { ABERTA: 'aberta', FECHADA: 'fechada', CANCELADA: 'cancelada', A_RECEBER: 'a receber' };

// ── Schema ──

const Comanda = sequelize.define('Comanda', {
    id_comanda:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fk_cliente:        { type: DataTypes.INTEGER, allowNull: true },
    identificacao:     { type: DataTypes.STRING(50) },
    valor_total:       { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    valor_debito:      { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status:            { type: DataTypes.STRING(30), allowNull: false, defaultValue: STATUS.ABERTA },
    data_hora_inicio:  { type: DataTypes.DATE, allowNull: false },
    data_hora_termino: { type: DataTypes.DATE },
    forma_pagamento:   { type: DataTypes.STRING(50) },
}, {
    tableName: 'comanda',
    freezeTableName: true,
    timestamps: false,
});

const Consumo = sequelize.define('Consumo', {
    id_consumo:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fk_produto:    { type: DataTypes.INTEGER, allowNull: false },
    fk_comanda:    { type: DataTypes.INTEGER, allowNull: false },
    quantidade:    { type: DataTypes.INTEGER, allowNull: false },
    hora_inclusao: { type: DataTypes.DATE, allowNull: false },
    observacoes:   { type: DataTypes.STRING(255) },
}, {
    tableName: 'consumo',
    freezeTableName: true,
    timestamps: false,
});

// Associações
Comanda.hasMany(Consumo, { foreignKey: 'fk_comanda', as: 'consumos' });
Consumo.belongsTo(Comanda, { foreignKey: 'fk_comanda' });
Consumo.belongsTo(Produto, { foreignKey: 'fk_produto', as: 'produto' });
Produto.hasMany(Consumo, { foreignKey: 'fk_produto' });

// ── Helpers ──

async function _buscarComandaComConsumos(id) {
    return Comanda.findByPk(id, {
        include: [{ model: Consumo, as: 'consumos', include: [{ model: Produto, as: 'produto' }] }],
    });
}

async function quantidadeReservada(fk_produto, ignorarComandaId = null) {
    const where = { status: STATUS.ABERTA };
    if (ignorarComandaId) where.id_comanda = { [Op.ne]: ignorarComandaId };
    const abertas = await Comanda.findAll({ attributes: ['id_comanda'], where });
    const ids = abertas.map(c => c.id_comanda);
    if (ids.length === 0) return 0;
    const result = await Consumo.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('quantidade')), 'total']],
        where: { fk_produto, fk_comanda: { [Op.in]: ids } },
        raw: true,
    });
    return Number(result[0]?.total || 0);
}

async function estoqueDisponivel(fk_produto, ignorarComandaId = null) {
    const produto = await ProdutoModel.buscarPorId(fk_produto);
    if (!produto) throw new Error(`Produto com id ${fk_produto} não encontrado`);
    const reservado = await quantidadeReservada(fk_produto, ignorarComandaId);
    return produto.quantidade_estoque - reservado;
}

// ── Validações ──

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
    if (comanda.status !== STATUS.ABERTA) {
        throw new Error('Não é possível alterar uma comanda fechada ou cancelada');
    }
}

// ── Funções de dados ──

async function listarTodos(filtros = {}) {
    const where = {};
    if (filtros.status) where.status = filtros.status;
    return Comanda.findAll({
        where,
        include: [{ model: Consumo, as: 'consumos', include: [{ model: Produto, as: 'produto' }] }],
        order: [['id_comanda', 'ASC']],
    });
}

async function buscarPorId(id) {
    return _buscarComandaComConsumos(id);
}

async function criar(dados = {}) {
    const fk_cliente = dados.fk_cliente ? Number(dados.fk_cliente) : CONSUMIDOR_FINAL_ID;
    await validarClienteExiste(fk_cliente);
    const novaComanda = await Comanda.create({
        fk_cliente,
        identificacao:    dados.identificacao || null,
        status:           STATUS.ABERTA,
        data_hora_inicio: new Date(),
        valor_total:      0,
        valor_debito:     0,
    });
    const fk_usuario = dados.fk_usuario || 1;
    await LogModel.registrar({
        fk_usuario,
        fk_comanda: novaComanda.id_comanda,
        tipo: 'abrir_comanda',
        descricao: `Comanda ${novaComanda.id_comanda} aberta`,
    });
    return _buscarComandaComConsumos(novaComanda.id_comanda);
}

async function atualizarCabecalho(id, dados) {
    const comanda = await _buscarComandaComConsumos(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);
    const updates = {};
    if (dados.identificacao !== undefined) updates.identificacao = dados.identificacao || null;
    if (dados.fk_cliente !== undefined) {
        const fk_cliente = dados.fk_cliente ? Number(dados.fk_cliente) : CONSUMIDOR_FINAL_ID;
        await validarClienteExiste(fk_cliente);
        updates.fk_cliente = fk_cliente;
    }
    await comanda.update(updates);
    return _buscarComandaComConsumos(id);
}

async function adicionarConsumo(id, dados) {
    const comanda = await _buscarComandaComConsumos(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    const produto = await validarProdutoExiste(Number(dados.fk_produto));
    const qtdAdd  = validarQuantidade(dados.quantidade);

    // Verifica estoque físico diretamente (já decrementamos na hora de adicionar)
    if (produto.quantidade_estoque < qtdAdd) {
        throw new Error(
            `Estoque insuficiente. Disponível: ${produto.quantidade_estoque}, solicitado: ${qtdAdd}`
        );
    }

    // Decrementa o estoque imediatamente
    await EstoqueModel.saida(produto.id_produto, qtdAdd);

    const consumoExistente = comanda.consumos.find(c => c.fk_produto === produto.id_produto);
    if (consumoExistente) {
        await consumoExistente.update({ quantidade: consumoExistente.quantidade + qtdAdd });
    } else {
        await Consumo.create({
            fk_comanda:    id,
            fk_produto:    produto.id_produto,
            quantidade:    qtdAdd,
            hora_inclusao: new Date(),
            observacoes:   dados.observacoes || null,
        });
    }

    const incremento = qtdAdd * Number(produto.preco_venda);
    await comanda.update({ valor_total: Number(comanda.valor_total) + incremento });

    await LogModel.registrar({
        fk_usuario: dados.fk_usuario || 1,
        fk_comanda: id,
        tipo: 'adicionar_consumo',
        descricao: `Produto ${produto.id_produto} (${produto.nome}) x${qtdAdd} adicionado à comanda ${id}`,
    });

    return _buscarComandaComConsumos(id);
}

async function atualizarConsumo(id, consumoId, dados) {
    const comanda = await _buscarComandaComConsumos(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    const consumo = comanda.consumos.find(c => c.id_consumo === Number(consumoId));
    if (!consumo) throw new Error(`Consumo com id ${consumoId} não encontrado na comanda`);

    const novaQtd = validarQuantidade(dados.quantidade);
    const diff    = novaQtd - consumo.quantidade; // positivo = mais itens, negativo = menos

    if (diff > 0) {
        // Precisa de mais estoque
        const produto = await validarProdutoExiste(consumo.fk_produto);
        if (produto.quantidade_estoque < diff) {
            throw new Error(`Estoque insuficiente. Disponível: ${produto.quantidade_estoque}, necessário: ${diff}`);
        }
        await EstoqueModel.saida(consumo.fk_produto, diff);
    } else if (diff < 0) {
        // Devolve estoque
        await EstoqueModel.entrada(consumo.fk_produto, Math.abs(diff));
    }

    const produto = await validarProdutoExiste(consumo.fk_produto);
    await consumo.update({
        quantidade:  novaQtd,
        observacoes: dados.observacoes !== undefined ? dados.observacoes : consumo.observacoes,
    });
    await comanda.update({ valor_total: Number(comanda.valor_total) + diff * Number(produto.preco_venda) });

    if (diff !== 0) {
        await LogModel.registrar({
            fk_usuario: dados.fk_usuario || 1,
            fk_comanda: id,
            tipo: diff > 0 ? 'adicionar_consumo' : 'editar_consumo',
            descricao: diff > 0
                ? `Produto ${produto.id_produto} (${produto.nome}) x${diff} adicionado à comanda ${id} (total: ${novaQtd})`
                : `Produto ${produto.id_produto} (${produto.nome}) x${Math.abs(diff)} removido da comanda ${id} (total: ${novaQtd})`,
        });
    }

    return _buscarComandaComConsumos(id);
}

async function removerConsumo(id, consumoId) {
    const comanda = await _buscarComandaComConsumos(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    const consumo = comanda.consumos.find(c => c.id_consumo === Number(consumoId));
    if (!consumo) throw new Error(`Consumo com id ${consumoId} não encontrado na comanda`);

    const produto    = await validarProdutoExiste(consumo.fk_produto);
    const decremento = consumo.quantidade * Number(produto.preco_venda);

    // Devolve ao estoque ao remover o item
    await EstoqueModel.entrada(consumo.fk_produto, consumo.quantidade);

    await consumo.destroy();
    await comanda.update({ valor_total: Math.max(0, Number(comanda.valor_total) - decremento) });

    return _buscarComandaComConsumos(id);
}

async function fechar(id, dados = {}) {
    const comanda = await _buscarComandaComConsumos(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    if (comanda.consumos.length === 0) {
        throw new Error('Não é possível fechar uma comanda sem consumos');
    }
    if (!dados.forma_pagamento) {
        throw new Error('Forma de pagamento é obrigatória para fechar a comanda');
    }

    // RF14: pagamento por ficha exige cliente cadastrado (não Consumidor Final)
    const ehFicha = dados.forma_pagamento.toLowerCase() === 'ficha';
    if (ehFicha) {
        if (!comanda.fk_cliente || comanda.fk_cliente === CONSUMIDOR_FINAL_ID) {
            throw new Error(
                'Para pagamento por ficha é obrigatório vincular um cliente cadastrado (não "Consumidor Final")'
            );
        }
    }

    // Estoque já foi decrementado quando os itens foram adicionados — não decrementa novamente

    const novoStatus = ehFicha ? STATUS.A_RECEBER : STATUS.FECHADA;

    await comanda.update({
        status:            novoStatus,
        data_hora_termino: new Date(),
        forma_pagamento:   dados.forma_pagamento,
        valor_debito:      dados.valor_debito ? Number(dados.valor_debito) : 0,
    });

    // RF14: criar dívida automaticamente quando o pagamento for ficha
    if (ehFicha) {
        await FichaModel.criar({
            fk_cliente: comanda.fk_cliente,
            fk_comanda: comanda.id_comanda,
            debito:     Number(comanda.valor_total),
        });
    }

    const fk_usuario = dados.fk_usuario || 1;
    await LogModel.registrar({
        fk_usuario,
        fk_comanda: comanda.id_comanda,
        tipo:      ehFicha ? 'comanda_ficha' : 'fechar_comanda',
        descricao: ehFicha
            ? `Comanda ${comanda.id_comanda} lançada na ficha do cliente ${comanda.fk_cliente}`
            : `Comanda ${comanda.id_comanda} fechada. Pagamento: ${dados.forma_pagamento}`,
    });

    return _buscarComandaComConsumos(id);
}

async function cancelar(id, fk_usuario = 1) {
    const comanda = await _buscarComandaComConsumos(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    // Devolve ao estoque todos os itens da comanda
    for (const consumo of comanda.consumos) {
        await EstoqueModel.entrada(consumo.fk_produto, consumo.quantidade);
    }

    await comanda.update({ status: STATUS.CANCELADA, data_hora_termino: new Date() });

    await LogModel.registrar({
        fk_usuario,
        fk_comanda: comanda.id_comanda,
        tipo: 'cancelar_comanda',
        descricao: `Comanda ${comanda.id_comanda} cancelada. Estoque de ${comanda.consumos.length} item(ns) devolvido.`,
    });

    return comanda;
}

module.exports = {
    Comanda, Consumo,
    listarTodos, buscarPorId, criar, atualizarCabecalho,
    adicionarConsumo, atualizarConsumo, removerConsumo,
    fechar, cancelar, STATUS,
};
