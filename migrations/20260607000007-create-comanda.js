'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('comanda', {
            id:          { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            status:      { type: Sequelize.ENUM('aberta', 'fechada', 'cancelada'), allowNull: false, defaultValue: 'aberta' },
            infoCliente: { type: Sequelize.STRING },
            clienteId:   {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
                references: { model: 'cliente', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            total: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('comanda');
    },
};
