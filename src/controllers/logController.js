const LogModel  = require('../models/logModel');
const RESP_HTTP = require('../../consts');
const helper    = require('./helpers');

async function listar(req, res) {
    const logs = await LogModel.listarTodos(req.query);
    res.status(RESP_HTTP.OK).json({ total: logs.length, logs });
}

async function buscar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const log = await LogModel.buscarPorId(id);
    if (!log) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Log não encontrado' });
    res.status(RESP_HTTP.OK).json(log);
}

module.exports = { listar, buscar };
