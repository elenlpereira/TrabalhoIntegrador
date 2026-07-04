const ComandaModel = require('../models/comandaModel');
const RESP_HTTP    = require('../../consts');
const helper       = require('./helpers');

async function listar(req, res) {
    const consumos = await ComandaModel.Consumo.findAll({ order: [['id_consumo', 'ASC']] });
    res.status(RESP_HTTP.OK).json({ total: consumos.length, consumos });
}

async function buscar(req, res) {
    const id = helper.obterId(req, res);
    if (id === null) return;
    const consumo = await ComandaModel.Consumo.findByPk(id);
    if (!consumo) return res.status(RESP_HTTP.NOT_FOUND).json({ erro: 'Consumo não encontrado' });
    res.status(RESP_HTTP.OK).json(consumo);
}

module.exports = { listar, buscar };
