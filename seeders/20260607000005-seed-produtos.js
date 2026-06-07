'use strict';

// Cada produto referencia um fornecedor existente (ids 1-5).

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('produto', [
            {
                id: 1,
                nome: 'Coca-Cola Lata 350ml',
                quantidadeEstoque: 100,
                estoqueMinimo: 20,
                categoria: 'bebidas',
                precoCusto: 2.50,
                precoVenda: 5.00,
                fornecedorId: 1,
            },
            {
                id: 2,
                nome: 'Pastel de Queijo',
                quantidadeEstoque: 50,
                estoqueMinimo: 10,
                categoria: 'alimentos',
                precoCusto: 4.00,
                precoVenda: 10.00,
                fornecedorId: 2,
            },
            {
                id: 3,
                nome: 'Amendoim Torrado 100g',
                quantidadeEstoque: 80,
                estoqueMinimo: 15,
                categoria: 'mercearia',
                precoCusto: 3.00,
                precoVenda: 6.00,
                fornecedorId: 3,
            },
            {
                id: 4,
                nome: 'Cerveja Pilsen 600ml',
                quantidadeEstoque: 200,
                estoqueMinimo: 50,
                categoria: 'bebidas',
                precoCusto: 5.00,
                precoVenda: 12.00,
                fornecedorId: 4,
            },
            {
                id: 5,
                nome: 'Copo Descartável 200ml',
                quantidadeEstoque: 500,
                estoqueMinimo: 100,
                categoria: 'outros',
                precoCusto: 0.10,
                precoVenda: 0.50,
                fornecedorId: 5,
            },
        ], { ignoreDuplicates: true });

        await queryInterface.sequelize.query(
            `SELECT setval('produto_id_seq', (SELECT MAX(id) FROM produto));`
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('produto', { id: [1, 2, 3, 4, 5] });
    },
};
