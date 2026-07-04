'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('fornecedor', [
            { id_fornecedor: 1, razao_social: 'Distribuidora Beer & Co Ltda', cnpj: '11222333000181', telefone: '49933334444', email: 'contato@beerco.com',       endereco: 'Rua das Bebidas, 100 - Chapecó/SC',    categoria_produtos: 'bebidas' },
            { id_fornecedor: 2, razao_social: 'Salgados do Chef Ltda',         cnpj: '22333444000195', telefone: '49944445555', email: 'vendas@salgadoschef.com',  endereco: 'Av. dos Sabores, 200 - Xanxerê/SC',   categoria_produtos: 'alimentos' },
            { id_fornecedor: 3, razao_social: 'Mercadinho do Bairro Eireli',   cnpj: '33444555000109', telefone: '49955556666', email: 'compras@mercadinhosp.com', endereco: 'Rua Comercial, 300 - São Carlos/SC',  categoria_produtos: 'mercearia' },
            { id_fornecedor: 4, razao_social: 'Refrigerantes Premium Ltda',    cnpj: '44555666000117', telefone: '49966667777', email: 'pedidos@refripremium.com', endereco: 'Rodovia SC-283, km 5 - Concórdia/SC', categoria_produtos: 'bebidas' },
            { id_fornecedor: 5, razao_social: 'Descartáveis & Cia Ltda',       cnpj: '55666777000126', telefone: '49977778888', email: 'vendas@descartaveisecia.com', endereco: 'Av. Industrial, 400 - Joaçaba/SC', categoria_produtos: 'outros' },
        ], { ignoreDuplicates: true });

        await queryInterface.sequelize.query(
            `SELECT setval('fornecedor_id_fornecedor_seq', (SELECT MAX(id_fornecedor) FROM fornecedor));`
        );
    },
    async down(queryInterface) {
        await queryInterface.bulkDelete('fornecedor', null);
    },
};
