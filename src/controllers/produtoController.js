// O Controller só sabe: receber req, chamar o Model, enviar res.
// Não contém lógica de negócio nem manipulação direta de dados.

const ProdutoModel = require('../models/produtoModel');
const RESP_HTTP = require('../../consts');
const helper = require('./helpers');

async function listar(req, res) {
    const produtos = await ProdutoModel.listarTodos(req.query);
    res.status(RESP_HTTP.OK).json({ total: produtos.length, produtos });
}

async function buscar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const produto = await ProdutoModel.buscarPorId(id);
    if (!produto) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Produto não encontrado' });
    res.status(RESP_HTTP.OK).json(produto);
}

async function criar(req, res) {
    try {
        const novoProduto = await ProdutoModel.criar(req.body);
        res.status(RESP_HTTP.CREATED).set('Location', '/api/produtos/' + novoProduto.id).json(novoProduto);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function atualizar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const produto = await ProdutoModel.atualizar(id, req.body);
        if (!produto) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Produto não encontrado' });
        res.status(RESP_HTTP.OK).json(produto);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function atualizarParcial(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const produto = await ProdutoModel.atualizarParcial(id, req.body);
        if (!produto) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Produto não encontrado' });
        res.status(RESP_HTTP.OK).json(produto);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function remover(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const ok = await ProdutoModel.remover(id);
        if (!ok) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Produto não encontrado' });
        res.status(RESP_HTTP.NO_CONTENT).send();
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

module.exports = { listar, buscar, criar, atualizar, atualizarParcial, remover };
