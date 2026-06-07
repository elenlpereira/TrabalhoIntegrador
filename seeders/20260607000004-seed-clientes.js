'use strict';

// id=1 (Consumidor Final) já inserido pelo seeder 000001.
// Este seeder insere ids 2-6.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('cliente', [
            {
                id: 2,
                nome: 'Carlos Mendes',
                cpf: '12345678901',
                telefone: '49991112222',
                email: 'carlos.mendes@email.com',
            },
            {
                id: 3,
                nome: 'Fernanda Lima',
                cpf: '23456789012',
                telefone: '49992223333',
                email: 'fernanda.lima@email.com',
            },
            {
                id: 4,
                nome: 'Roberto Costa',
                cpf: '34567890123',
                telefone: '49993334444',
                email: null,
            },
            {
                id: 5,
                nome: 'Juliana Rocha',
                cpf: '45678901234',
                telefone: '49994445555',
                email: 'juliana.rocha@email.com',
            },
            {
                id: 6,
                nome: 'Marcos Vieira',
                cpf: '56789012345',
                telefone: '49995556666',
                email: null,
            },
        ], { ignoreDuplicates: true });

        await queryInterface.sequelize.query(
            `SELECT setval('cliente_id_seq', (SELECT MAX(id) FROM cliente));`
        );
    },

    async down(queryInterface) {
        // Remove apenas os clientes inseridos por este seeder (não toca no id=1)
        await queryInterface.bulkDelete('cliente', { id: [2, 3, 4, 5, 6] });
    },
};
