'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('comanda', {
            id_comanda: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            fk_cliente: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: 'cliente', key: 'id_cliente' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            identificacao:     { type: Sequelize.STRING(50) },
            valor_total:       { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
            valor_debito:      { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
            status:            { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'aberta' },
            data_hora_inicio:  { type: Sequelize.DATE, allowNull: false },
            data_hora_termino: { type: Sequelize.DATE },
            forma_pagamento:   { type: Sequelize.STRING(50) },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('comanda');
    },
};
