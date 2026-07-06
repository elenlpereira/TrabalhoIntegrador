const ClienteModel = require('../models/clienteModel');
const LogModel = require('../models/logModel');
const RESP_HTTP = require('../../consts');
const helper = require('./helpers');

const log = (req, tipo, descricao) =>
    LogModel.registrar({ fk_usuario: req.usuario.id_usuario, tipo, descricao }).catch(() => {});

async function listar(req, res) {
    const clientes = await ClienteModel.listarTodos();
    res.status(RESP_HTTP.OK).json({ total: clientes.length, clientes });
}

async function buscarID(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const cliente = await ClienteModel.buscarPorId(id);
    if (!cliente) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Cliente não encontrado' });
    res.status(RESP_HTTP.OK).json(cliente);
}

async function buscarCPF(req, res) {
    const cpf = helper.obterCpf(req, res);
    if (cpf === null) return;
    const cliente = await ClienteModel.buscarPorCPF(cpf);
    if (!cliente) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Cliente não encontrado' });
    res.status(RESP_HTTP.OK).json(cliente);
}

async function buscarNome(req, res) {
    const nome = helper.obterNome(req, res);
    if (nome === null) return;
    const clientes = await ClienteModel.buscarPorNome(nome);
    res.status(RESP_HTTP.OK).json({ total: clientes.length, clientes });
}

async function criar(req, res) {
    try {
        const novoCliente = await ClienteModel.criar(req.body);
        log(req, 'cadastrar_cliente', `Cliente cadastrado: ${novoCliente.nome} (id ${novoCliente.id_cliente})`);
        res.status(RESP_HTTP.CREATED).set('Location', '/api/clientes/' + novoCliente.id_cliente).json(novoCliente);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function atualizar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const cliente = await ClienteModel.atualizar(id, req.body);
        if (!cliente) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Cliente não encontrado' });
        log(req, 'editar_cliente', `Cliente editado: ${cliente.nome} (id ${id})`);
        res.status(RESP_HTTP.OK).json(cliente);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function atualizarParcial(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const cliente = await ClienteModel.atualizarParcial(id, req.body);
        if (!cliente) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Cliente não encontrado' });
        log(req, 'editar_cliente', `Cliente editado parcialmente: id ${id}`);
        res.status(RESP_HTTP.OK).json(cliente);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function remover(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const ok = await ClienteModel.remover(id);
        if (!ok) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Cliente não encontrado' });
        log(req, 'remover_cliente', `Cliente removido: id ${id}`);
        res.status(RESP_HTTP.NO_CONTENT).send();
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}


module.exports = { listar, buscarID, buscarCPF, buscarNome, criar, atualizar, atualizarParcial, remover};