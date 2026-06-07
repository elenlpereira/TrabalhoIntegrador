'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        // O id=1 é reservado para "Consumidor Final" — usado como cliente padrão nas comandas
        await queryInterface.bulkInsert('cliente', [
            {
                id:       1,
                nome:     'Consumidor Final',
                cpf:      '00000000000',
                telefone: null,
                email:    null,
            },
        ], { ignoreDuplicates: true });

        await queryInterface.sequelize.query(
            `SELECT setval('cliente_id_seq', GREATEST((SELECT MAX(id) FROM cliente), 1));`
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('cliente', { id: 1 });
    },
};
