'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('produto', {
            id_produto:         { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            nome:               { type: Sequelize.STRING(100), allowNull: false, unique: true },
            quantidade_estoque: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            estoque_minimo:     { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
            categoria:          { type: Sequelize.STRING(100) },
            preco_custo:        { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            preco_venda:        { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('produto');
    },
};
