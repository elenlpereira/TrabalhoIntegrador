const CompraModel = require('../models/compraModel');
const LogModel    = require('../models/logModel');
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
        // Injeta o usuário autenticado para o log
        const dados = { ...req.body, fk_usuario: req.usuario.id_usuario };
        const novaCompra = await CompraModel.criar(dados);
        res.status(RESP_HTTP.CREATED)
            .set('Location', '/api/compras/' + novaCompra.id_compra)
            .json(novaCompra);
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
        LogModel.registrar({
            fk_usuario: req.usuario.id_usuario,
            fk_compra:  compra.id_compra,
            tipo:       'estornar_compra',
            descricao:  `Compra ${compra.id_compra} estornada: produto ${compra.fk_produto}, qtd ${compra.quantidade}`,
        }).catch(() => {});
        res.status(RESP_HTTP.OK).json({ mensagem: 'Compra estornada com sucesso', compra });
    } catch (err) {
        res.status(RESP_HTTP.BAD_REQUEST).json({ erro: err.message });
    }
}

module.exports = { listar, buscar, criar, remover };
