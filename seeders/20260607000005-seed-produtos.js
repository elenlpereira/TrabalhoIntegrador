'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('produto', [
            { id_produto: 1, nome: 'Coca-Cola Lata 350ml',    quantidade_estoque: 100, estoque_minimo: 20, categoria: 'bebidas',  preco_custo: 2.50, preco_venda: 5.00 },
            { id_produto: 2, nome: 'Pastel de Queijo',         quantidade_estoque: 50,  estoque_minimo: 10, categoria: 'alimentos',preco_custo: 4.00, preco_venda: 10.00 },
            { id_produto: 3, nome: 'Amendoim Torrado 100g',    quantidade_estoque: 80,  estoque_minimo: 15, categoria: 'mercearia',preco_custo: 3.00, preco_venda: 6.00 },
            { id_produto: 4, nome: 'Cerveja Pilsen 600ml',     quantidade_estoque: 200, estoque_minimo: 50, categoria: 'bebidas',  preco_custo: 5.00, preco_venda: 12.00 },
            { id_produto: 5, nome: 'Copo Descartável 200ml',   quantidade_estoque: 500, estoque_minimo: 100,categoria: 'outros',   preco_custo: 0.10, preco_venda: 0.50 },
        ], { ignoreDuplicates: true });

        await queryInterface.sequelize.query(
            `SELECT setval('produto_id_produto_seq', (SELECT MAX(id_produto) FROM produto));`
        );
    },
    async down(queryInterface) {
        await queryInterface.bulkDelete('produto', null);
    },
};
