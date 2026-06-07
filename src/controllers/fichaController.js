const FichaModel = require('../models/fichaModel');
const RESP_HTTP  = require('../../consts');

function listar(req, res) {
    const fichas = FichaModel.listarTodos(req.query);
    res.status(RESP_HTTP.OK).json({ total: fichas.length, fichas });
}

function buscar(req, res) {
    const clienteId = Number.parseInt(req.params.clienteId, 10);
    if (Number.isNaN(clienteId)) {
        return res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'clienteId inválido' });
    }
    const ficha = FichaModel.buscarPorCliente(clienteId);
    if (!ficha) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Ficha não encontrada para este cliente' });
    res.status(RESP_HTTP.OK).json(ficha);
}

function quitar(req, res) {
    const clienteId = Number.parseInt(req.params.clienteId, 10);
    if (Number.isNaN(clienteId)) {
        return res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'clienteId inválido' });
    }
    try {
        const ficha = FichaModel.quitar(clienteId, req.body);
        if (!ficha) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Ficha não encontrada para este cliente' });
        res.status(RESP_HTTP.OK).json(ficha);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

module.exports = { listar, buscar, quitar };