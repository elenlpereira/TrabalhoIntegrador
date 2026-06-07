const SaidaModel = require('../models/saidaModel');
const RESP_HTTP = require('../../consts');
const helper = require('./helpers');

async function listar(req, res) {
    const saidas = await SaidaModel.listarTodos(req.query);
    res.status(RESP_HTTP.OK).json({ total: saidas.length, saidas });
}

async function buscar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const saida = await SaidaModel.buscarPorId(id);
    if (!saida) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Saída não encontrada' });
    res.status(RESP_HTTP.OK).json(saida);
}

async function criarManual(req, res) {
    try {
        const novaSaida = await SaidaModel.criarManual(req.body);
        res.status(RESP_HTTP.CREATED).set('Location', '/api/saidas/' + novaSaida.id).json(novaSaida);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function remover(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const saida = await SaidaModel.remover(id);
        if (!saida) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Saída não encontrada' });
        res.status(RESP_HTTP.OK).json({ mensagem: 'Saída estornada com sucesso', saida });
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function listarTipos(req, res) {
    res.status(RESP_HTTP.OK).json({ tipos: SaidaModel.TIPOS_SAIDA_MANUAL });
}

module.exports = { listar, buscar, criarManual, remover, listarTipos };
