'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('cliente', [
            { id_cliente: 2, nome: 'Carlos Mendes',  cpf: '12345678901', telefone: '49991112222', email: 'carlos.mendes@email.com', data_nascimento: '1990-05-15', endereco: null },
            { id_cliente: 3, nome: 'Fernanda Lima',  cpf: '23456789012', telefone: '49992223333', email: 'fernanda.lima@email.com', data_nascimento: '1985-08-22', endereco: 'Rua das Flores, 42 - Chapecó/SC' },
            { id_cliente: 4, nome: 'Roberto Costa',  cpf: '34567890123', telefone: '49993334444', email: null,                     data_nascimento: null,         endereco: null },
            { id_cliente: 5, nome: 'Juliana Rocha',  cpf: '45678901234', telefone: '49994445555', email: 'juliana.rocha@email.com', data_nascimento: '1995-11-30', endereco: null },
            { id_cliente: 6, nome: 'Marcos Vieira',  cpf: '56789012345', telefone: '49995556666', email: null,                     data_nascimento: null,         endereco: null },
        ], { ignoreDuplicates: true });

        await queryInterface.sequelize.query(
            `SELECT setval('cliente_id_cliente_seq', (SELECT MAX(id_cliente) FROM cliente));`
        );
    },
    async down(queryInterface) {
        await queryInterface.bulkDelete('cliente', { id_cliente: { [require('sequelize').Op.gt]: 1 } });
    },
};
