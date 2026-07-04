const NotaFiscalModel = require('../models/notaFiscalModel');
const RESP_HTTP       = require('../../consts');
const helper          = require('./helpers');

async function listar(req, res) {
    const notas = await NotaFiscalModel.listarTodos();
    res.status(RESP_HTTP.OK).json({ total: notas.length, notas });
}

async function buscar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const nota = await NotaFiscalModel.buscarPorId(id);
    if (!nota) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Nota fiscal não encontrada' });
    res.status(RESP_HTTP.OK).json(nota);
}

async function criar(req, res) {
    try {
        const novaNota = await NotaFiscalModel.criar(req.body);
        res.status(RESP_HTTP.CREATED)
            .set('Location', '/api/notas-fiscais/' + novaNota.id_nota_fiscal)
            .json(novaNota);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function atualizar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const nota = await NotaFiscalModel.atualizar(id, req.body);
        if (!nota) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Nota fiscal não encontrada' });
        res.status(RESP_HTTP.OK).json(nota);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function remover(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const ok = await NotaFiscalModel.remover(id);
        if (!ok) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Nota fiscal não encontrada' });
        res.status(RESP_HTTP.NO_CONTENT).send();
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

module.exports = { listar, buscar, criar, atualizar, remover };
