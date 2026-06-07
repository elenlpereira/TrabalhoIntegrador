'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('compra', {
            id:               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            produtoId:        { type: Sequelize.INTEGER, references: { model: 'produto', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
            nomeProduto:      { type: Sequelize.STRING, allowNull: false },
            quantidade:       { type: Sequelize.INTEGER, allowNull: false },
            fornecedorId:     { type: Sequelize.INTEGER, references: { model: 'fornecedor', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
            nomeFornecedor:   { type: Sequelize.STRING, allowNull: false },
            custoUnitario:    { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            totalCusto:       { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            numeroNotaFiscal: { type: Sequelize.STRING },
            dataRecebimento:  { type: Sequelize.DATEONLY, allowNull: false },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('compra');
    },
};
