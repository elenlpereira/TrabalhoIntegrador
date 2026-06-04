const CLienteModel = require('../models/clienteModel');
const RESP_HTTP = require('../../consts');
const helper = require('./helpers');

function listar(req, res) {
    const clientes = CLienteModel.listarTodos();
    res.status(RESP_HTTP.OK).json({ total: clientes.length, clientes });
}

function buscarID(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const cliente = CLienteModel.buscarPorId(id);
    if (!cliente) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Cliente não encontrado' });
    res.status(RESP_HTTP.OK).json(cliente);
}

function buscarCPF(req, res) {
    const cpf = helper.obterCpf(req, res);
    if (cpf === null) return;
    const cliente = CLienteModel.buscarPorCPF(cpf);
    if (!cliente) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Cliente não encontrado' });
    res.status(RESP_HTTP.OK).json(cliente);
}

function buscarNome(req, res) {
    const nome = helper.obterNome(req, res);
    if (nome === null) return;
    const clientes = CLienteModel.buscarPorNome(nome);
    res.status(RESP_HTTP.OK).json({ total: clientes.length, clientes });
}

function criar(req, res) {
    try {
        const novoCliente = CLienteModel.criar(req.body);
        res.status(RESP_HTTP.CREATED).set('Location', '/api/clientes/' + novoCliente.id).json(novoCliente);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function atualizar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const cliente = CLienteModel.atualizar(id, req.body);
        if (!cliente) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Cliente não encontrado' });
        res.status(RESP_HTTP.OK).json(cliente);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function atualizarParcial(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const cliente = CLienteModel.atualizarParcial(id, req.body);
        if (!cliente) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Cliente não encontrado' });
        res.status(RESP_HTTP.OK).json(cliente);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function remover(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const ok = CLienteModel.remover(id);
    if (!ok) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Cliente não encontrado' });
    res.status(RESP_HTTP.NO_CONTENT).send();
}


module.exports = { listar, buscarID, buscarCPF, buscarNome, criar, atualizar, atualizarParcial, remover};