const FornecedorModel = require('../models/fornecedor.Model');
const RESP_HTTP = require('../../consts');
const helper = require('./helpers');
 
function listar(req, res) {
    const fornecedores = FornecedorModel.listarTodos();
    res.status(RESP_HTTP.OK).json({ total: fornecedores.length, fornecedores });
}
 
function buscarID(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const fornecedor = FornecedorModel.buscarPorId(id);
    if (!fornecedor) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Fornecedor não encontrado' });
    res.status(RESP_HTTP.OK).json(fornecedor);
}
 
function buscarCNPJ(req, res) {
    const cnpj = (req.params.cnpj || '').replace(/[.\-\/]/g, '');
    if (!/^\d{14}$/.test(cnpj)) {
        return res.status(RESP_HTTP.BAD_REQUEST).json({ erro: 'CNPJ inválido. Use 00000000000000 ou 00.000.000/0000-00' });
    }
    const fornecedor = FornecedorModel.buscarPorCNPJ(cnpj);
    if (!fornecedor) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Fornecedor não encontrado' });
    res.status(RESP_HTTP.OK).json(fornecedor);
}
 
function buscarNome(req, res) {
    const nome = helper.obterNome(req, res);
    if (nome === null) return;
    const fornecedores = FornecedorModel.buscarPorNome(nome);
    res.status(RESP_HTTP.OK).json({ total: fornecedores.length, fornecedores });
}
 
function listarCategorias(req, res) {
    res.status(RESP_HTTP.OK).json({ categorias: FornecedorModel.CATEGORIAS_VALIDAS });
}
 
function criar(req, res) {
    try {
        const novoFornecedor = FornecedorModel.criar(req.body);
        res.status(RESP_HTTP.CREATED).set('Location', '/api/fornecedores/' + novoFornecedor.id).json(novoFornecedor);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}
 
function atualizar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const fornecedor = FornecedorModel.atualizar(id, req.body);
        if (!fornecedor) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Fornecedor não encontrado' });
        res.status(RESP_HTTP.OK).json(fornecedor);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}
 
function atualizarParcial(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    try {
        const fornecedor = FornecedorModel.atualizarParcial(id, req.body);
        if (!fornecedor) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Fornecedor não encontrado' });
        res.status(RESP_HTTP.OK).json(fornecedor);
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}
 
function remover(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const ok = FornecedorModel.remover(id);
    if (!ok) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Fornecedor não encontrado' });
    res.status(RESP_HTTP.NO_CONTENT).send();
}
 
module.exports = { listar, buscarID, buscarCNPJ, buscarNome, listarCategorias, criar, atualizar, atualizarParcial, remover };