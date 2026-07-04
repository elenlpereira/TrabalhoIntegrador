const UsuarioModel = require('../models/usuarioModel');
const RESP_HTTP = require('../../consts');
const helper = require('./helpers');

async function listar(req, res) {
    const usuarios = await UsuarioModel.listarTodos();
    res.status(RESP_HTTP.OK).json({ total: usuarios.length, usuarios });
}

async function buscar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const usuario = await UsuarioModel.buscarPorId(id);
    if (!usuario) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Usuário não encontrado' });
    res.status(RESP_HTTP.OK).json(usuario);
}

async function criar(req, res) {
    try {
        const novoUsuario = await UsuarioModel.criar(req.body);
        res.status(RESP_HTTP.CREATED).set('Location', '/api/usuarios/' + novoUsuario.id_usuario).json(novoUsuario);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function atualizar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const usuario = await UsuarioModel.atualizar(id, req.body);
        if (!usuario) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Usuário não encontrado' });
        res.status(RESP_HTTP.OK).json(usuario);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function atualizarParcial(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const usuario = await UsuarioModel.atualizarParcial(id, req.body);
        if (!usuario) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Usuário não encontrado' });
        res.status(RESP_HTTP.OK).json(usuario);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function remover(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const ok = await UsuarioModel.remover(id);
        if (!ok) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Usuário não encontrado' });
        res.status(RESP_HTTP.NO_CONTENT).send();
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

module.exports = { listar, buscar, criar, atualizar, atualizarParcial, remover };
