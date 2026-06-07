'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('fornecedor', [
            {
                id: 1,
                razaoSocial: 'Distribuidora Beer & Co Ltda',
                cnpj: '11222333000181',
                telefone: '49933334444',
                email: 'contato@beerco.com',
                cidade: 'Chapecó',
                categoriaProduto: 'bebidas',
            },
            {
                id: 2,
                razaoSocial: 'Salgados do Chef Ltda',
                cnpj: '22333444000195',
                telefone: '49944445555',
                email: 'vendas@salgadoschef.com',
                cidade: 'Xanxerê',
                categoriaProduto: 'alimentos',
            },
            {
                id: 3,
                razaoSocial: 'Mercadinho do Bairro Eireli',
                cnpj: '33444555000109',
                telefone: '49955556666',
                email: 'compras@mercadinhosp.com',
                cidade: 'São Carlos',
                categoriaProduto: 'mercearia',
            },
            {
                id: 4,
                razaoSocial: 'Refrigerantes Premium Ltda',
                cnpj: '44555666000117',
                telefone: '49966667777',
                email: 'pedidos@refripremium.com',
                cidade: 'Concórdia',
                categoriaProduto: 'bebidas',
            },
            {
                id: 5,
                razaoSocial: 'Descartáveis & Cia Ltda',
                cnpj: '55666777000126',
                telefone: '49977778888',
                email: 'vendas@descartaveisecia.com',
                cidade: 'Joaçaba',
                categoriaProduto: 'outros',
            },
        ], { ignoreDuplicates: true });

        // Atualiza a sequence para evitar conflito no auto-increment
        await queryInterface.sequelize.query(
            `SELECT setval('fornecedor_id_seq', (SELECT MAX(id) FROM fornecedor));`
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('fornecedor', { id: [1, 2, 3, 4, 5] });
    },
};
