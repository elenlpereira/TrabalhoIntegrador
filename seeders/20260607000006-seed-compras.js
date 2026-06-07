'use strict';

// Registra as entradas de estoque históricas (compras dos fornecedores).
// produtoId e fornecedorId referenciam os registros já inseridos.
// Os campos nomeProduto e nomeFornecedor são desnormalizados (preservados mesmo
// que o produto/fornecedor seja editado ou removido futuramente).

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('compra', [
            {
                id: 1,
                produtoId: 1,
                nomeProduto: 'Coca-Cola Lata 350ml',
                quantidade: 100,
                fornecedorId: 1,
                nomeFornecedor: 'Distribuidora Beer & Co Ltda',
                custoUnitario: 2.50,
                totalCusto: 250.00,
                numeroNotaFiscal: 'NF-001/2026',
                dataRecebimento: '2026-06-01',
            },
            {
                id: 2,
                produtoId: 2,
                nomeProduto: 'Pastel de Queijo',
                quantidade: 50,
                fornecedorId: 2,
                nomeFornecedor: 'Salgados do Chef Ltda',
                custoUnitario: 4.00,
                totalCusto: 200.00,
                numeroNotaFiscal: 'NF-002/2026',
                dataRecebimento: '2026-06-02',
            },
            {
                id: 3,
                produtoId: 3,
                nomeProduto: 'Amendoim Torrado 100g',
                quantidade: 80,
                fornecedorId: 3,
                nomeFornecedor: 'Mercadinho do Bairro Eireli',
                custoUnitario: 3.00,
                totalCusto: 240.00,
                numeroNotaFiscal: 'NF-003/2026',
                dataRecebimento: '2026-06-03',
            },
            {
                id: 4,
                produtoId: 4,
                nomeProduto: 'Cerveja Pilsen 600ml',
                quantidade: 200,
                fornecedorId: 4,
                nomeFornecedor: 'Refrigerantes Premium Ltda',
                custoUnitario: 5.00,
                totalCusto: 1000.00,
                numeroNotaFiscal: 'NF-004/2026',
                dataRecebimento: '2026-06-04',
            },
            {
                id: 5,
                produtoId: 5,
                nomeProduto: 'Copo Descartável 200ml',
                quantidade: 500,
                fornecedorId: 5,
                nomeFornecedor: 'Descartáveis & Cia Ltda',
                custoUnitario: 0.10,
                totalCusto: 50.00,
                numeroNotaFiscal: 'NF-005/2026',
                dataRecebimento: '2026-06-05',
            },
        ], { ignoreDuplicates: true });

        await queryInterface.sequelize.query(
            `SELECT setval('compra_id_seq', (SELECT MAX(id) FROM compra));`
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('compra', { id: [1, 2, 3, 4, 5] });
    },
};
