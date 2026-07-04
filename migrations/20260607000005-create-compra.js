'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('nota_fiscal', {
            id_nota_fiscal: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            numero:        { type: Sequelize.STRING(50), allowNull: false, unique: true },
            valor_total:   { type: Sequelize.DECIMAL(10, 2), allowNull: false },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('nota_fiscal');
    },
};
