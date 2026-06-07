'use strict';

const bcrypt = require('bcryptjs');

const SENHA_HASH = bcrypt.hashSync('123456', 10);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('usuario', [
            {
                id: 1,
                nomeCompleto: 'Admin Sistema',
                email: 'admin@bar.com',
                senha: SENHA_HASH,
                perfil: 'Gerente',
            },
            {
                id: 2,
                nomeCompleto: 'João Gerente',
                email: 'joao.gerente@bar.com',
                senha: SENHA_HASH,
                perfil: 'Gerente',
            },
            {
                id: 3,
                nomeCompleto: 'Maria Atendente',
                email: 'maria@bar.com',
                senha: SENHA_HASH,
                perfil: 'Atendente',
            },
            {
                id: 4,
                nomeCompleto: 'Pedro Atendente',
                email: 'pedro@bar.com',
                senha: SENHA_HASH,
                perfil: 'Atendente',
            },
            {
                id: 5,
                nomeCompleto: 'Ana Atendente',
                email: 'ana@bar.com',
                senha: SENHA_HASH,
                perfil: 'Atendente',
            },
        ], { ignoreDuplicates: true });

        await queryInterface.sequelize.query(
            `SELECT setval('usuario_id_seq', (SELECT MAX(id) FROM usuario));`
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('usuario', { id: [1, 2, 3, 4, 5] });
    },
};
