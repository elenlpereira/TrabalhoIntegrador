const SaidaModel = require('../models/saidaModel');
const RESP_HTTP = require('../../consts');
const helper = require('./helpers');

function listar(req, res) {
    const saidas = SaidaModel.listarTodos(req.query);
    res.status(RESP_HTTP.OK).json({ total: saidas.length, saidas });
}

function buscar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const saida = SaidaModel.buscarPorId(id);
    if (!saida) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Saída não encontrada' });
    res.status(RESP_HTTP.OK).json(saida);
}

function criarManual(req, res) {
    try {
        const novaSaida = SaidaModel.criarManual(req.body);
        res.status(RESP_HTTP.CREATED).set('Location', '/api/saidas/' + novaSaida.id).json(novaSaida);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function remover(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const saida = SaidaModel.remover(id);
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
