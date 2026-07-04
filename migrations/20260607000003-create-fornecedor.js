'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('fornecedor', {
            id_fornecedor:      { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            razao_social:       { type: Sequelize.STRING(150), allowNull: false },
            cnpj:               { type: Sequelize.STRING(18), allowNull: false, unique: true },
            telefone:           { type: Sequelize.STRING(20) },
            email:              { type: Sequelize.STRING(100) },
            endereco:           { type: Sequelize.STRING(255) },
            categoria_produtos: { type: Sequelize.STRING(100) },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('fornecedor');
    },
};
