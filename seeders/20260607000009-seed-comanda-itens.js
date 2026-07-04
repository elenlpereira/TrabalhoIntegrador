'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('consumo', [
            { id_consumo: 1, fk_comanda: 1, fk_produto: 1, quantidade: 7, hora_inclusao: '2026-06-07 18:10:00', observacoes: null },
            { id_consumo: 2, fk_comanda: 2, fk_produto: 4, quantidade: 2, hora_inclusao: '2026-06-07 18:40:00', observacoes: null },
            { id_consumo: 3, fk_comanda: 3, fk_produto: 2, quantidade: 2, hora_inclusao: '2026-06-07 19:05:00', observacoes: null },
            { id_consumo: 4, fk_comanda: 3, fk_produto: 3, quantidade: 2, hora_inclusao: '2026-06-07 19:10:00', observacoes: null },
            { id_consumo: 5, fk_comanda: 5, fk_produto: 5, quantidade: 6, hora_inclusao: '2026-06-07 19:35:00', observacoes: null },
        ], { ignoreDuplicates: true });

        await queryInterface.sequelize.query(
            `SELECT setval('consumo_id_consumo_seq', (SELECT MAX(id_consumo) FROM consumo));`
        );
    },
    async down(queryInterface) {
        await queryInterface.bulkDelete('consumo', null);
    },
};
