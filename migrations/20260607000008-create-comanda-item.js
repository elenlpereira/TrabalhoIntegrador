'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('consumo', {
            id_consumo: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            fk_produto: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'produto', key: 'id_produto' },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            fk_comanda: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'comanda', key: 'id_comanda' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            quantidade:    { type: Sequelize.INTEGER, allowNull: false },
            hora_inclusao: { type: Sequelize.DATE, allowNull: false },
            observacoes:   { type: Sequelize.STRING(255) },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('consumo');
    },
};
