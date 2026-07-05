const FornecedorModel = require('../models/fornecedorModel');
const RESP_HTTP = require('../../consts');
const helper = require('./helpers');
 
async function listar(req, res) {
    const fornecedores = await FornecedorModel.listarTodos();
    res.status(RESP_HTTP.OK).json({ total: fornecedores.length, fornecedores });
}
 
async function buscarID(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const fornecedor = await FornecedorModel.buscarPorId(id);
    if (!fornecedor) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Fornecedor não encontrado' });
    res.status(RESP_HTTP.OK).json(fornecedor);
}
 
async function buscarCNPJ(req, res) {
    const cnpj = helper.obterCnpj(req, res);
    if (cnpj === null) return;
    const fornecedor = await FornecedorModel.buscarPorCNPJ(cnpj);
    if (!fornecedor) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Fornecedor não encontrado' });
    res.status(RESP_HTTP.OK).json(fornecedor);
}
 
async function buscarNome(req, res) {
    const nome = helper.obterNome(req, res);
    if (nome === null) return;
    const fornecedores = await FornecedorModel.buscarPorNome(nome);
    res.status(RESP_HTTP.OK).json({ total: fornecedores.length, fornecedores });
}
 
function listarCategorias(req, res) {
    res.status(RESP_HTTP.OK).json({ categorias: FornecedorModel.CATEGORIAS_VALIDAS });
}
 
async function criar(req, res) {
    try {
        const novoFornecedor = await FornecedorModel.criar(req.body);
        res.status(RESP_HTTP.CREATED).set('Location', '/api/fornecedores/' + novoFornecedor.id_fornecedor).json(novoFornecedor);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}
 
async function atualizar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const fornecedor = await FornecedorModel.atualizar(id, req.body);
        if (!fornecedor) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Fornecedor não encontrado' });
        res.status(RESP_HTTP.OK).json(fornecedor);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}
 
async function atualizarParcial(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const fornecedor = await FornecedorModel.atualizarParcial(id, req.body);
        if (!fornecedor) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Fornecedor não encontrado' });
        res.status(RESP_HTTP.OK).json(fornecedor);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}
 
async function remover(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const ok = await FornecedorModel.remover(id);
        if (!ok) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Fornecedor não encontrado' });
        res.status(RESP_HTTP.NO_CONTENT).send();
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}
 
module.exports = { listar, buscarID, buscarCNPJ, buscarNome, listarCategorias, criar, atualizar, atualizarParcial, remover };