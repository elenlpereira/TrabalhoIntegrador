'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('fornecedor', {
            id:               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            razaoSocial:      { type: Sequelize.STRING, allowNull: false },
            cnpj:             { type: Sequelize.STRING(14), allowNull: false, unique: true },
            telefone:         { type: Sequelize.STRING(20), allowNull: false },
            email:            { type: Sequelize.STRING, allowNull: false },
            cidade:           { type: Sequelize.STRING, allowNull: false },
            categoriaProduto: {
                type: Sequelize.ENUM('bebidas', 'alimentos', 'mercearia', 'outros'),
                allowNull: false,
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('fornecedor');
    },
};
