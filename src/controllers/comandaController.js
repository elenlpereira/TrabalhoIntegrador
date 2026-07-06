const ComandaModel = require('../models/comandaModel');
const RESP_HTTP    = require('../../consts');
const helper       = require('./helpers');

async function listar(req, res) {
    const comandas = await ComandaModel.listarTodos(req.query);
    res.status(RESP_HTTP.OK).json({ total: comandas.length, comandas });
}

async function buscar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const comanda = await ComandaModel.buscarPorId(id);
    if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
    res.status(RESP_HTTP.OK).json(comanda);
}

async function criar(req, res) {
    try {
        const novaComanda = await ComandaModel.criar(req.body);
        res.status(RESP_HTTP.CREATED)
            .set('Location', '/api/comandas/' + novaComanda.id_comanda)
            .json(novaComanda);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function atualizarCabecalho(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const comanda = await ComandaModel.atualizarCabecalho(id, req.body);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json(comanda);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function adicionarConsumo(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const dados = { ...req.body, fk_usuario: req.usuario.id_usuario };
        const comanda = await ComandaModel.adicionarConsumo(id, dados);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json(comanda);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function atualizarConsumo(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;

    const consumoId = Number.parseInt(req.params.consumoId, 10);
    if (Number.isNaN(consumoId)) {
        return res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'consumoId inválido' });
    }

    try {
        const comanda = await ComandaModel.atualizarConsumo(id, consumoId, req.body);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json(comanda);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function removerConsumo(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;

    const consumoId = Number.parseInt(req.params.consumoId, 10);
    if (Number.isNaN(consumoId)) {
        return res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'consumoId inválido' });
    }

    try {
        const comanda = await ComandaModel.removerConsumo(id, consumoId);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json(comanda);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function fechar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const dados = { ...req.body, fk_usuario: req.usuario.id_usuario };
        const comanda = await ComandaModel.fechar(id, dados);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json({ mensagem: 'Comanda fechada com sucesso', comanda });
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function cancelar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const comanda = await ComandaModel.cancelar(id, req.usuario.id_usuario);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json({ mensagem: 'Comanda cancelada com sucesso', comanda });
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

module.exports = { listar, buscar, criar, atualizarCabecalho, adicionarConsumo, atualizarConsumo, removerConsumo, fechar, cancelar };
