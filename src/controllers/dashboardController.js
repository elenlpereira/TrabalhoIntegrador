const { Op } = require('sequelize');
const { Usuario }    = require('../models/usuarioModel');
const { Cliente }    = require('../models/clienteModel');
const { Fornecedor } = require('../models/fornecedorModel');
const { Produto }    = require('../models/produtoModel');
const { Comanda }    = require('../models/comandaModel');
const { Compra }     = require('../models/compraModel');
const { Log }        = require('../models/logModel');
const { Divida }     = require('../models/fichaModel');
const RESP_HTTP      = require('../../consts');

async function resumo(req, res) {
    // Início e fim de hoje em UTC-3
    const agora    = new Date();
    const inicioDia = new Date(agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }) + 'T00:00:00-03:00');
    const fimDia    = new Date(agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }) + 'T23:59:59-03:00');

    const [
        totalUsuarios,
        totalClientes,
        totalFornecedores,
        totalProdutos,
        produtosEstoqueBaixo,
        comandasAbertas,
        comandasFechadasHoje,
        totalCompras,
        fichasAbertas,
        logsHoje,
    ] = await Promise.all([
        Usuario.count(),
        Cliente.count({ where: { id_cliente: { [Op.ne]: 1 } } }), // exclui Consumidor Final
        Fornecedor.count(),
        Produto.count(),
        Produto.count({ where: { quantidade_estoque: { [Op.lte]: require('sequelize').col('estoque_minimo') } } }),
        Comanda.count({ where: { status: 'aberta' } }),
        Comanda.count({ where: { status: { [Op.in]: ['fechada', 'a receber'] }, data_hora_termino: { [Op.between]: [inicioDia, fimDia] } } }),
        Compra.count(),
        Divida.count({ where: { status: 'pendente' } }),
        Log.count({ where: { data_hora: { [Op.between]: [inicioDia, fimDia] } } }),
    ]);

    res.status(RESP_HTTP.OK).json({
        cadastros: {
            usuarios:    totalUsuarios,
            clientes:    totalClientes,
            fornecedores: totalFornecedores,
            produtos:    totalProdutos,
        },
        estoque: {
            produtos_abaixo_minimo: produtosEstoqueBaixo,
        },
        operacional: {
            comandas_abertas:       comandasAbertas,
            comandas_fechadas_hoje: comandasFechadasHoje,
            total_compras:          totalCompras,
            fichas_pendentes:       fichasAbertas,
        },
        auditoria: {
            acoes_hoje: logsHoje,
        },
    });
}

module.exports = { resumo };
