'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('usuario', {
            id:           { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            nomeCompleto: { type: Sequelize.STRING(100), allowNull: false },
            email:        { type: Sequelize.STRING, allowNull: false, unique: true },
            senha:        { type: Sequelize.STRING, allowNull: false },
            perfil:       { type: Sequelize.ENUM('Atendente', 'Gerente'), allowNull: false },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('usuario');
    },
};
