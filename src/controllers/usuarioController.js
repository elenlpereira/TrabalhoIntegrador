const UsuarioModel = require('../models/usuarioModel');
const RESP_HTTP = require('../../consts');
const helper = require('./helpers');

function listar(req, res) {
    const usuarios = UsuarioModel.listarTodos();
    res.status(RESP_HTTP.OK).json({ total: usuarios.length, usuarios });
}

function buscar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const usuario = UsuarioModel.buscarPorId(id);
    if (!usuario) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Usuário não encontrado' });
    res.status(RESP_HTTP.OK).json(usuario);
}

function criar(req, res) {
    try {
        const novoUsuario = UsuarioModel.criar(req.body);
        res.status(RESP_HTTP.CREATED).set('Location', '/api/usuarios/' + novoUsuario.id).json(novoUsuario);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function atualizar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const usuario = UsuarioModel.atualizar(id, req.body);
        if (!usuario) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Usuário não encontrado' });
        res.status(RESP_HTTP.OK).json(usuario);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function atualizarParcial(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const usuario = UsuarioModel.atualizarParcial(id, req.body);
        if (!usuario) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Usuário não encontrado' });
        res.status(RESP_HTTP.OK).json(usuario);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function remover(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const ok = UsuarioModel.remover(id);
    if (!ok) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Usuário não encontrado' });
    res.status(RESP_HTTP.NO_CONTENT).send();
}

module.exports = { listar, buscar, criar, atualizar, atualizarParcial, remover };
