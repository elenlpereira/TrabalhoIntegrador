const ComandaModel = require('../models/comandaModel');
const RESP_HTTP    = require('../../consts');
const helper       = require('./helpers');

function listar(req, res) {
    const comandas = ComandaModel.listarTodos(req.query);
    res.status(RESP_HTTP.OK).json({ total: comandas.length, comandas });
}

function buscar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const comanda = ComandaModel.buscarPorId(id);
    if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
    res.status(RESP_HTTP.OK).json(comanda);
}

function criar(req, res) {
    try {
        const novaComanda = ComandaModel.criar(req.body);
        res.status(RESP_HTTP.CREATED)
            .set('Location', '/api/comandas/' + novaComanda.id)
            .json(novaComanda);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function atualizarCabecalho(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const comanda = ComandaModel.atualizarCabecalho(id, req.body);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json(comanda);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function adicionarItem(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const comanda = ComandaModel.adicionarItem(id, req.body);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json(comanda);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function atualizarItem(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;

    const produtoId = Number.parseInt(req.params.produtoId, 10);
    if (Number.isNaN(produtoId)) {
        return res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'produtoId inválido' });
    }

    try {
        const comanda = ComandaModel.atualizarItem(id, produtoId, req.body);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json(comanda);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function removerItem(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;

    const produtoId = Number.parseInt(req.params.produtoId, 10);
    if (Number.isNaN(produtoId)) {
        return res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'produtoId inválido' });
    }

    try {
        const comanda = ComandaModel.removerItem(id, produtoId);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json(comanda);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function fechar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const comanda = ComandaModel.fechar(id);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json(comanda);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function cancelar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const comanda = ComandaModel.cancelar(id);
        if (!comanda) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Comanda não encontrada' });
        res.status(RESP_HTTP.OK).json({ mensagem: 'Comanda cancelada e estoque estornado', comanda });
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

module.exports = { listar, buscar, criar, atualizarCabecalho, adicionarItem, atualizarItem, removerItem, fechar, cancelar };