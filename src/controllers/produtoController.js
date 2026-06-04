// O Controller só sabe: receber req, chamar o Model, enviar res.
// Não contém lógica de negócio nem manipulação direta de dados.

const ProdutoModel = require('../models/produtoModel');
const RESP_HTTP = require('../../consts');
const helper = require('./helpers');

function listar(req, res) {
    const produtos = ProdutoModel.listarTodos(req.query);
    res.status(RESP_HTTP.OK).json({ total: produtos.length, produtos });
}

function buscar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const produto = ProdutoModel.buscarPorId(id);
    if (!produto) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Produto não encontrado' });
    res.status(RESP_HTTP.OK).json(produto);
}

function criar(req, res) {
    try {
        const novoProduto = ProdutoModel.criar(req.body);
        res.status(RESP_HTTP.CREATED).set('Location', '/api/produtos/' + novoProduto.id).json(novoProduto);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function atualizar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const produto = ProdutoModel.atualizar(id, req.body);
        if (!produto) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Produto não encontrado' });
        res.status(RESP_HTTP.OK).json(produto);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function atualizarParcial(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const produto = ProdutoModel.atualizarParcial(id, req.body);
        if (!produto) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Produto não encontrado' });
        res.status(RESP_HTTP.OK).json(produto);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

function remover(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const ok = ProdutoModel.remover(id);
    if (!ok) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Produto não encontrado' });
    res.status(RESP_HTTP.NO_CONTENT).send();
}

module.exports = { listar, buscar, criar, atualizar, atualizarParcial, remover };
