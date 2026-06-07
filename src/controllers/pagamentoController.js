const PagamentoModel = require('../models/pagamentoModel');
const RESP_HTTP = require('../../consts');
const helper = require('./helpers');

function listar(req, res) {
    const pagamentos = PagamentoModel.listarTodos(req.query);
    res.status(RESP_HTTP.OK).json({ total: pagamentos.length, pagamentos });
}

function buscar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const pagamento = PagamentoModel.buscarPorId(id);
    if (!pagamento) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Pagamento não encontrado' });
    res.status(RESP_HTTP.OK).json(pagamento);
}

function buscarPorComanda(req, res) {
    const comandaId = Number.parseInt(req.params.comandaId, 10);
    if (Number.isNaN(comandaId)) {
        return res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'comandaId inválido' });
    }
    const pagamento = PagamentoModel.buscarPorComanda(comandaId);
    if (!pagamento) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Pagamento não encontrado para esta comanda' });
    res.status(RESP_HTTP.OK).json(pagamento);
}

function pagar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const pagamento = PagamentoModel.pagar(id, req.body.lancamentos);
        if (!pagamento) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Pagamento não encontrado' });
        res.status(RESP_HTTP.OK).json(pagamento);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

module.exports = { listar, buscar, buscarPorComanda, pagar };