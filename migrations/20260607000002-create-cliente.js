'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('cliente', {
            id_cliente:      { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            nome:            { type: Sequelize.STRING(100), allowNull: false },
            cpf:             { type: Sequelize.STRING(14), allowNull: false, unique: true },
            telefone:        { type: Sequelize.STRING(20) },
            email:           { type: Sequelize.STRING(100) },
            data_nascimento: { type: Sequelize.DATEONLY },
            endereco:        { type: Sequelize.STRING(255) },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('cliente');
    },
};
