'use strict';

// Saídas manuais de estoque (perdas, quebras, devoluções).
// origem='manual' diferencia das saídas automáticas por venda (origem='venda').
// tipoSaida deve ser um dos valores manuais:
//   devolucao | quebra | vencimento | erro_operacional

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('saida', [
            {
                id: 1,
                produtoId: 1,
                nomeProduto: 'Coca-Cola Lata 350ml',
                quantidade: 3,
                tipoSaida: 'quebra',
                descricao: 'Latas amassadas na descarga do fornecedor',
                data: '2026-06-02',
                origem: 'manual',
            },
            {
                id: 2,
                produtoId: 2,
                nomeProduto: 'Pastel de Queijo',
                quantidade: 2,
                tipoSaida: 'vencimento',
                descricao: 'Pastéis com validade vencida identificados no estoque',
                data: '2026-06-03',
                origem: 'manual',
            },
            {
                id: 3,
                produtoId: 3,
                nomeProduto: 'Amendoim Torrado 100g',
                quantidade: 5,
                tipoSaida: 'devolucao',
                descricao: 'Pacotes danificados devolvidos ao fornecedor',
                data: '2026-06-03',
                origem: 'manual',
            },
            {
                id: 4,
                produtoId: 4,
                nomeProduto: 'Cerveja Pilsen 600ml',
                quantidade: 10,
                tipoSaida: 'erro_operacional',
                descricao: 'Cervejas registradas em duplicidade no sistema',
                data: '2026-06-04',
                origem: 'manual',
            },
            {
                id: 5,
                produtoId: 5,
                nomeProduto: 'Copo Descartável 200ml',
                quantidade: 20,
                tipoSaida: 'quebra',
                descricao: 'Copos esmagados por caixa caída no depósito',
                data: '2026-06-05',
                origem: 'manual',
            },
        ], { ignoreDuplicates: true });

        await queryInterface.sequelize.query(
            `SELECT setval('saida_id_seq', (SELECT MAX(id) FROM saida));`
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('saida', { id: [1, 2, 3, 4, 5] });
    },
};
