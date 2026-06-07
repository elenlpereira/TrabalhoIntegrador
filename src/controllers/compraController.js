const CompraModel = require('../models/compraModel');
const FornecedorModel = require('../models/fornecedor.Model');
const RESP_HTTP = require('../../consts');
const helper = require('./helpers');

async function listar(req, res) {
    const compras = await CompraModel.listarTodos();
    res.status(RESP_HTTP.OK).json({ total: compras.length, compras });
}

async function buscar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const compra = await CompraModel.buscarPorId(id);
    if (!compra) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Compra não encontrada' });
    res.status(RESP_HTTP.OK).json(compra);
}

async function criar(req, res) {
    try {
        const novaCompra = await CompraModel.criar(req.body);
        res.status(RESP_HTTP.CREATED).set('Location', '/api/compras/' + novaCompra.id).json(novaCompra);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function remover(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const compra = await CompraModel.remover(id);
        if (!compra) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Compra não encontrada' });
        res.status(RESP_HTTP.OK).json({ mensagem: 'Compra estornada com sucesso', compra });
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

async function listarFornecedores(req, res) {
    const fornecedores = await FornecedorModel.listarTodos();
    res.status(RESP_HTTP.OK).json({ total: fornecedores.length, fornecedores });
}

module.exports = { listar, buscar, criar, remover, listarFornecedores };
