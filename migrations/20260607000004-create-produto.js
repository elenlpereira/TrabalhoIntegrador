'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('produto', {
            id:                { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            nome:              { type: Sequelize.STRING, allowNull: false, unique: true },
            quantidadeEstoque: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            estoqueMinimo:     { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            categoria:         {
                type: Sequelize.ENUM('bebidas', 'alimentos', 'mercearia', 'outros'),
                allowNull: false,
            },
            precoCusto:   { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            precoVenda:   { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            fornecedorId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'fornecedor', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('produto');
    },
};
