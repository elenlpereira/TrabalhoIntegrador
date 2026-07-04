'use strict';

// Seeder vazio: tabela 'saida' foi removida do modelo físico.
// A baixa de estoque acontece automaticamente ao fechar uma comanda (consumo).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up() {},
    async down() {},
};
