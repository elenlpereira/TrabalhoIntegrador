'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('saida', {
            id:          { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            produtoId:   { type: Sequelize.INTEGER, references: { model: 'produto', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
            nomeProduto: { type: Sequelize.STRING, allowNull: false },
            quantidade:  { type: Sequelize.INTEGER, allowNull: false },
            tipoSaida:   {
                type: Sequelize.ENUM('devolucao', 'quebra', 'vencimento', 'erro_operacional', 'venda', 'estorno_venda'),
                allowNull: false,
            },
            descricao: { type: Sequelize.STRING, allowNull: false },
            data:      { type: Sequelize.DATEONLY, allowNull: false },
            origem:    { type: Sequelize.STRING, allowNull: false },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('saida');
    },
};
