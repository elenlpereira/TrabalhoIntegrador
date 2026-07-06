const UsuarioModel = require('../models/usuarioModel');
const LogModel = require('../models/logModel');
const RESP_HTTP = require('../../consts');
const helper = require('./helpers');

const log = (req, tipo, descricao) =>
    LogModel.registrar({ fk_usuario: req.usuario.id_usuario, tipo, descricao }).catch(() => {});

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
        log(req, 'cadastrar_usuario', `Usuário cadastrado: ${novoUsuario.nome} (id ${novoUsuario.id_usuario})`);
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
        log(req, 'editar_usuario', `Usuário editado: ${usuario.nome} (id ${id})`);
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
        log(req, 'editar_usuario', `Usuário editado parcialmente: id ${id}`);
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
        log(req, 'remover_usuario', `Usuário removido: id ${id}`);
        res.status(RESP_HTTP.NO_CONTENT).send();
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

module.exports = { listar, buscar, criar, atualizar, atualizarParcial, remover };
