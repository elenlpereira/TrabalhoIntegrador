'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('compra', [
            { id_compra: 1, fk_produto: 1, fk_fornecedor: 1, fk_nota_fiscal: null, quantidade: 100, custo_unitario: 2.50, data_recebimento: '2026-06-01' },
            { id_compra: 2, fk_produto: 2, fk_fornecedor: 2, fk_nota_fiscal: null, quantidade: 50,  custo_unitario: 4.00, data_recebimento: '2026-06-02' },
            { id_compra: 3, fk_produto: 3, fk_fornecedor: 3, fk_nota_fiscal: null, quantidade: 80,  custo_unitario: 3.00, data_recebimento: '2026-06-03' },
            { id_compra: 4, fk_produto: 4, fk_fornecedor: 4, fk_nota_fiscal: null, quantidade: 200, custo_unitario: 5.00, data_recebimento: '2026-06-04' },
            { id_compra: 5, fk_produto: 5, fk_fornecedor: 5, fk_nota_fiscal: null, quantidade: 500, custo_unitario: 0.10, data_recebimento: '2026-06-05' },
        ], { ignoreDuplicates: true });

        await queryInterface.sequelize.query(
            `SELECT setval('compra_id_compra_seq', (SELECT MAX(id_compra) FROM compra));`
        );
    },
    async down(queryInterface) {
        await queryInterface.bulkDelete('compra', null);
    },
};
