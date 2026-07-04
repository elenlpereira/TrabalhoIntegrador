'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('divida', {
            id_divida: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            fk_cliente: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'cliente', key: 'id_cliente' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            fk_comanda: {
                type: Sequelize.INTEGER,
                references: { model: 'comanda', key: 'id_comanda' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            debito:  { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            credito: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
            saldo:   { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            data:    { type: Sequelize.DATEONLY, allowNull: false },
            status:  { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'pendente' },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('divida');
    },
};
