'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('comanda_item', {
            id:            { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            comandaId:     {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'comanda', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            produtoId:     {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'produto', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            nomeProduto:   { type: Sequelize.STRING, allowNull: false },
            precoUnitario: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            quantidade:    { type: Sequelize.INTEGER, allowNull: false },
            subtotal:      { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('comanda_item');
    },
};
