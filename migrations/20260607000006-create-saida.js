'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('compra', {
            id_compra: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            fk_produto: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'produto', key: 'id_produto' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            fk_fornecedor: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'fornecedor', key: 'id_fornecedor' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            fk_nota_fiscal: {
                type: Sequelize.INTEGER,
                references: { model: 'nota_fiscal', key: 'id_nota_fiscal' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            quantidade:       { type: Sequelize.INTEGER, allowNull: false },
            custo_unitario:   { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            data_recebimento: { type: Sequelize.DATEONLY, allowNull: false },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('compra');
    },
};
