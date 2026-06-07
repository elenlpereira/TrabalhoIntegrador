'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('cliente', {
            id:       { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            nome:     { type: Sequelize.STRING(100), allowNull: false },
            cpf:      { type: Sequelize.STRING(11), allowNull: false, unique: true },
            telefone: { type: Sequelize.STRING(20) },
            email:    { type: Sequelize.STRING },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('cliente');
    },
};
