const FichaModel = require('../models/fichaModel');
const ClienteModel = require('../models/clienteModel');
const RESP_HTTP  = require('../../consts');
const helper     = require('./helpers');
const { Op }     = require('sequelize');

// GET /api/fichas?status=pendente
async function listar(req, res) {
    const fichas = await FichaModel.listarTodos({ status: req.query.status });
    res.status(RESP_HTTP.OK).json({ total: fichas.length, fichas });
}

// GET /api/fichas/resumo  →  lista clientes com saldo devedor > 0
async function resumo(req, res) {
    try {
        // Todas as dívidas não quitadas
        const fichas = await FichaModel.listarTodos();
        const { CONSUMIDOR_FINAL_ID } = require('../models/clienteModel');

        // Agrupa saldo por cliente
        const mapa = {};
        for (const f of fichas) {
            if (f.status === FichaModel.STATUS_DIVIDA?.PAGO || f.status === 'pago') continue;
            if (Number(f.fk_cliente) === Number(CONSUMIDOR_FINAL_ID)) continue;
            if (!mapa[f.fk_cliente]) mapa[f.fk_cliente] = 0;
            mapa[f.fk_cliente] += Number(f.saldo);
        }

        // Busca nomes dos clientes
        const ids = Object.keys(mapa).map(Number).filter(id => mapa[id] > 0);
        const clientes = ids.length > 0
            ? await ClienteModel.Cliente.findAll({ where: { id_cliente: ids }, attributes: ['id_cliente', 'nome', 'cpf'] })
            : [];

        const lista = clientes.map(c => ({
            id_cliente: c.id_cliente,
            nome:       c.nome,
            cpf:        c.cpf,
            saldo_total: Number((mapa[c.id_cliente] || 0).toFixed(2)),
        })).sort((a, b) => b.saldo_total - a.saldo_total);

        res.status(RESP_HTTP.OK).json({ total: lista.length, clientes: lista });
    } catch (err) {
        res.status(RESP_HTTP.INTERNAL_SERVER_ERROR).json({ erro: err.message });
    }
}

// GET /api/fichas/:clienteId
async function buscar(req, res) {
    const clienteId = helper.obterId({ params: { id: req.params.clienteId } }, res);
    if (clienteId === null) return;
    const fichas = await FichaModel.listarPorCliente(clienteId);
    const saldo  = await FichaModel.totalDevidoPorCliente(clienteId);
    res.status(RESP_HTTP.OK).json({ total: fichas.length, saldo_total: saldo, fichas });
}

// POST /api/fichas/:clienteId/quitar  body: { valor, fk_usuario, forma_pagamento }
async function quitar(req, res) {
    const clienteId = helper.obterId({ params: { id: req.params.clienteId } }, res);
    if (clienteId === null) return;
    try {
        const resultado = await FichaModel.quitar(clienteId, {
            valor:           req.body.valor,
            fk_usuario:      req.body.fk_usuario ?? req.usuario?.id_usuario,
            forma_pagamento: req.body.forma_pagamento,
        });
        res.status(RESP_HTTP.OK).json(resultado);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

module.exports = { listar, resumo, buscar, quitar };