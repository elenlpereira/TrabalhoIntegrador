'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('comanda', [
            { id_comanda: 1, fk_cliente: 2, identificacao: 'Mesa 2',  valor_total: 35.00, valor_debito: 0, status: 'fechada',   data_hora_inicio: '2026-06-07 18:00:00', data_hora_termino: '2026-06-07 20:00:00', forma_pagamento: 'dinheiro' },
            { id_comanda: 2, fk_cliente: 3, identificacao: 'Mesa 5',  valor_total: 24.00, valor_debito: 0, status: 'fechada',   data_hora_inicio: '2026-06-07 18:30:00', data_hora_termino: '2026-06-07 21:00:00', forma_pagamento: 'pix' },
            { id_comanda: 3, fk_cliente: 4, identificacao: 'Mesa 8',  valor_total: 32.00, valor_debito: 0, status: 'aberta',    data_hora_inicio: '2026-06-07 19:00:00', data_hora_termino: null,                  forma_pagamento: null },
            { id_comanda: 4, fk_cliente: 5, identificacao: null,       valor_total: 0,     valor_debito: 0, status: 'cancelada', data_hora_inicio: '2026-06-07 19:15:00', data_hora_termino: '2026-06-07 19:20:00', forma_pagamento: null },
            { id_comanda: 5, fk_cliente: 6, identificacao: 'Balcão',  valor_total: 3.00,  valor_debito: 0, status: 'aberta',    data_hora_inicio: '2026-06-07 19:30:00', data_hora_termino: null,                  forma_pagamento: null },
        ], { ignoreDuplicates: true });

        await queryInterface.sequelize.query(
            `SELECT setval('comanda_id_comanda_seq', (SELECT MAX(id_comanda) FROM comanda));`
        );
    },
    async down(queryInterface) {
        await queryInterface.bulkDelete('comanda', null);
    },
};
