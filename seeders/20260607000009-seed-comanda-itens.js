'use strict';

// 5 itens distribuídos em 4 das 5 comandas.
// A comanda 4 está cancelada e não possui itens.
//
// Relacionamento:
//   item 1 → comanda 1 (fechada), produto 1 (Coca-Cola)
//   item 2 → comanda 2 (fechada), produto 4 (Cerveja Pilsen)
//   item 3 → comanda 3 (aberta),  produto 2 (Pastel de Queijo)
//   item 4 → comanda 3 (aberta),  produto 3 (Amendoim Torrado)
//   item 5 → comanda 5 (aberta),  produto 5 (Copo Descartável)

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('comanda_item', [
            {
                id: 1,
                comandaId: 1,
                produtoId: 1,
                nomeProduto: 'Coca-Cola Lata 350ml',
                precoUnitario: 5.00,
                quantidade: 7,
                subtotal: 35.00,
            },
            {
                id: 2,
                comandaId: 2,
                produtoId: 4,
                nomeProduto: 'Cerveja Pilsen 600ml',
                precoUnitario: 12.00,
                quantidade: 2,
                subtotal: 24.00,
            },
            {
                id: 3,
                comandaId: 3,
                produtoId: 2,
                nomeProduto: 'Pastel de Queijo',
                precoUnitario: 10.00,
                quantidade: 2,
                subtotal: 20.00,
            },
            {
                id: 4,
                comandaId: 3,
                produtoId: 3,
                nomeProduto: 'Amendoim Torrado 100g',
                precoUnitario: 6.00,
                quantidade: 2,
                subtotal: 12.00,
            },
            {
                id: 5,
                comandaId: 5,
                produtoId: 5,
                nomeProduto: 'Copo Descartável 200ml',
                precoUnitario: 0.50,
                quantidade: 6,
                subtotal: 3.00,
            },
        ], { ignoreDuplicates: true });

        await queryInterface.sequelize.query(
            `SELECT setval('comanda_item_id_seq', (SELECT MAX(id) FROM comanda_item));`
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('comanda_item', { id: [1, 2, 3, 4, 5] });
    },
};
