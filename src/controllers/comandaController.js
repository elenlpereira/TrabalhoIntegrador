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
            .set('Location', '/api/comandas/' + novaComanda.id)
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

async function adicionarItem(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const comanda = await ComandaModel.adicionarItem(id, req.body);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json(comanda);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function atualizarItem(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;

    const produtoId = Number.parseInt(req.params.produtoId, 10);
    if (Number.isNaN(produtoId)) {
        return res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'produtoId inválido' });
    }

    try {
        const comanda = await ComandaModel.atualizarItem(id, produtoId, req.body);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json(comanda);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function removerItem(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;

    const produtoId = Number.parseInt(req.params.produtoId, 10);
    if (Number.isNaN(produtoId)) {
        return res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'produtoId inválido' });
    }

    try {
        const comanda = await ComandaModel.removerItem(id, produtoId);
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
        const comanda = await ComandaModel.fechar(id);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json(comanda);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function cancelar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const comanda = await ComandaModel.cancelar(id);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json({ mensagem: 'Comanda cancelada com sucesso', comanda });
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

module.exports = { listar, buscar, criar, atualizarCabecalho, adicionarItem, atualizarItem, removerItem, fechar, cancelar };