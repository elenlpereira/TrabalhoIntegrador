const { Op, QueryTypes } = require('sequelize');
const sequelize          = require('../../config/localConnection');
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

module.exports = { resumo, analise };

// ── Análise detalhada ─────────────────────────────────────────────────────────

async function analise(req, res) {
    // Período padrão: mês atual em UTC-3
    const agora = new Date();
    const anoMes = agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }).slice(0, 7);
    const inicio = req.query.data_inicio
        ? new Date(req.query.data_inicio + 'T00:00:00-03:00')
        : new Date(anoMes + '-01T00:00:00-03:00');
    const fim = req.query.data_fim
        ? new Date(req.query.data_fim + 'T23:59:59-03:00')
        : new Date(agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }) + 'T23:59:59-03:00');

    const [
        comandasAbertas,
        produtosEstoqueBaixo,
        vendasPorProduto,
        clientesFiado,
    ] = await Promise.all([
        // 1. Comandas abertas agora
        Comanda.findAll({
            where: { status: 'aberta' },
            attributes: ['id_comanda', 'identificacao', 'data_hora_inicio', 'valor_total', 'status'],
            order: [['data_hora_inicio', 'ASC']],
        }),

        // 2. Produtos com estoque abaixo do mínimo
        Produto.findAll({
            where: { quantidade_estoque: { [Op.lte]: sequelize.col('estoque_minimo') } },
            attributes: ['id_produto', 'nome', 'categoria', 'quantidade_estoque', 'estoque_minimo', 'preco_custo', 'preco_venda'],
            order: [['quantidade_estoque', 'ASC']],
        }),

        // 3. Vendas por produto e forma de pagamento no período
        sequelize.query(`
            SELECT
                p.nome          AS produto,
                p.categoria,
                c.forma_pagamento,
                SUM(co.quantidade)                       AS quantidade_vendida,
                SUM(co.quantidade * p.preco_venda)       AS faturamento
            FROM comanda c
            INNER JOIN consumo co ON co.fk_comanda = c.id_comanda
            INNER JOIN produto  p  ON p.id_produto  = co.fk_produto
            WHERE c.status = 'fechada'
              AND c.data_hora_termino BETWEEN :inicio AND :fim
            GROUP BY p.id_produto, p.nome, p.categoria, c.forma_pagamento
            ORDER BY faturamento DESC
        `, {
            replacements: { inicio, fim },
            type: QueryTypes.SELECT,
        }),

        // 4. Clientes com fiado — usa saldo real da tabela divida
        sequelize.query(`
            SELECT
                cl.id_cliente,
                cl.nome,
                COUNT(d.id_divida)   AS total_dividas,
                SUM(d.saldo)         AS total_a_receber
            FROM cliente cl
            JOIN divida d ON cl.id_cliente = d.fk_cliente
            WHERE d.status IN ('pendente', 'pago_parcial')
            GROUP BY cl.id_cliente, cl.nome
            ORDER BY total_a_receber DESC
        `, { type: QueryTypes.SELECT }),
    ]);

    res.status(RESP_HTTP.OK).json({
        periodo: {
            inicio: inicio.toISOString().slice(0, 10),
            fim:    fim.toISOString().slice(0, 10),
        },
        comandas_abertas:     comandasAbertas,
        estoque_abaixo_minimo: produtosEstoqueBaixo,
        vendas_por_produto:   vendasPorProduto,
        clientes_fiado:       clientesFiado,
    });
}
