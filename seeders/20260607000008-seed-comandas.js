'use strict';

// Comandas referenciam clientes (clienteId 2-6).
// status: aberta | fechada | cancelada
// O total deve bater com a soma dos itens inseridos no próximo seeder.
//   comanda 1 (fechada)   → 1 item: 7x Coca-Cola  R$5,00  = R$35,00
//   comanda 2 (fechada)   → 1 item: 2x Cerveja    R$12,00 = R$24,00
//   comanda 3 (aberta)    → 2 itens: 2x Pastel R$10 + 2x Amendoim R$6 = R$32,00
//   comanda 4 (cancelada) → sem itens, total R$0,00
//   comanda 5 (aberta)    → 1 item: 6x Copo      R$0,50  = R$3,00

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('comanda', [
            {
                id: 1,
                status: 'fechada',
                infoCliente: 'Mesa 2',
                clienteId: 2,
                total: 35.00,
            },
            {
                id: 2,
                status: 'fechada',
                infoCliente: 'Mesa 5',
                clienteId: 3,
                total: 24.00,
            },
            {
                id: 3,
                status: 'aberta',
                infoCliente: 'Mesa 8',
                clienteId: 4,
                total: 32.00,
            },
            {
                id: 4,
                status: 'cancelada',
                infoCliente: null,
                clienteId: 5,
                total: 0.00,
            },
            {
                id: 5,
                status: 'aberta',
                infoCliente: 'Balcão',
                clienteId: 6,
                total: 3.00,
            },
        ], { ignoreDuplicates: true });

        await queryInterface.sequelize.query(
            `SELECT setval('comanda_id_seq', (SELECT MAX(id) FROM comanda));`
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('comanda', { id: [1, 2, 3, 4, 5] });
    },
};
