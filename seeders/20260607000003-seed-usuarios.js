'use strict';

const bcrypt = require('bcryptjs');

const SENHA_HASH = bcrypt.hashSync('123456', 10);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('usuario', [
            { id_usuario: 1, nome: 'Admin Sistema',      email: 'admin@bar.com',             senha: SENHA_HASH, perfil_acesso: 'Gerente' },
            { id_usuario: 2, nome: 'João Gerente',        email: 'joao.gerente@bar.com',      senha: SENHA_HASH, perfil_acesso: 'Gerente' },
            { id_usuario: 3, nome: 'Maria Atendente',     email: 'maria@bar.com',             senha: SENHA_HASH, perfil_acesso: 'Atendente' },
            { id_usuario: 4, nome: 'Pedro Atendente',     email: 'pedro@bar.com',             senha: SENHA_HASH, perfil_acesso: 'Atendente' },
            { id_usuario: 5, nome: 'Lúcia Supervisora',   email: 'lucia@bar.com',             senha: SENHA_HASH, perfil_acesso: 'Gerente' },
        ], { ignoreDuplicates: true });

        await queryInterface.sequelize.query(
            `SELECT setval('usuario_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuario));`
        );
    },
    async down(queryInterface) {
        await queryInterface.bulkDelete('usuario', null);
    },
};
