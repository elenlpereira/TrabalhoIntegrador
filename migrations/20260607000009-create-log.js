'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('log', {
            id_log: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            fk_usuario: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'usuario', key: 'id_usuario' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            fk_comanda: {
                type: Sequelize.INTEGER,
                references: { model: 'comanda', key: 'id_comanda' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            fk_compra: {
                type: Sequelize.INTEGER,
                references: { model: 'compra', key: 'id_compra' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            tipo:      { type: Sequelize.STRING(50), allowNull: false },
            data_hora: { type: Sequelize.DATE, allowNull: false },
            descricao: { type: Sequelize.STRING(255) },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('log');
    },
};
