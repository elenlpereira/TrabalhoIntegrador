const FichaModel = require('../models/fichaModel');
const RESP_HTTP  = require('../../consts');
const helper     = require('./helpers');

// GET /api/fichas?status=pendente
async function listar(req, res) {
    const fichas = await FichaModel.listarTodos({ status: req.query.status });
    res.status(RESP_HTTP.OK).json({ total: fichas.length, fichas });
}

// GET /api/fichas/:clienteId
async function buscar(req, res) {
    const clienteId = helper.obterId({ params: { id: req.params.clienteId } }, res);
    if (clienteId === null) return;
    const fichas = await FichaModel.listarPorCliente(clienteId);
    const saldo  = await FichaModel.totalDevidoPorCliente(clienteId);
    res.status(RESP_HTTP.OK).json({ total: fichas.length, saldo_total: saldo, fichas });
}

// POST /api/fichas/:clienteId/quitar  body: { valor, fk_usuario }
async function quitar(req, res) {
    const clienteId = helper.obterId({ params: { id: req.params.clienteId } }, res);
    if (clienteId === null) return;
    try {
        const resultado = await FichaModel.quitar(clienteId, req.body);
        res.status(RESP_HTTP.OK).json(resultado);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

module.exports = { listar, buscar, quitar };
