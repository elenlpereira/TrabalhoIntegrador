const ProdutoModel = require('./produtoModel');

// ── Validações 

async function validarProdutoExiste(produtoId) {
    const produto = await ProdutoModel.buscarPorId(produtoId);
    if (!produto) throw new Error(`Produto com id ${produtoId} não encontrado`);
    return produto;
}

function validarQuantidade(quantidade) {
    if (!quantidade || isNaN(quantidade) || Number(quantidade) <= 0) {
        throw new Error('A quantidade deve ser um número maior que zero');
    }
}

function validarEstoqueSuficiente(produto, quantidade) {
    if (produto.quantidade_estoque < quantidade) {
        throw new Error(
            `Estoque insuficiente. Disponível: ${produto.quantidade_estoque}, solicitado: ${quantidade}`
        );
    }
}

// ── Operações de movimentação 

// Soma quantidade ao estoque do produto (compra / estorno de saída)
async function entrada(produtoId, quantidade) {
    await validarProdutoExiste(produtoId);
    validarQuantidade(quantidade);
    const qtd = Number(quantidade);
    await ProdutoModel.atualizarParcial(produtoId, {
        quantidade_estoque: (await ProdutoModel.buscarPorId(produtoId)).quantidade_estoque + qtd,
    });
    return ProdutoModel.buscarPorId(produtoId);
}

// Subtrai quantidade do estoque do produto (venda / saída manual)
async function saida(produtoId, quantidade) {
    const produto = await validarProdutoExiste(produtoId);
    validarQuantidade(quantidade);
    const qtd = Number(quantidade);
    validarEstoqueSuficiente(produto, qtd);
    await ProdutoModel.atualizarParcial(produtoId, {
        quantidade_estoque: produto.quantidade_estoque - qtd,
    });
    return ProdutoModel.buscarPorId(produtoId);
}

// Retorna true se o estoque atual estiver igual ou abaixo do mínimo
async function verificarEstoqueMinimo(produtoId) {
    const produto = await validarProdutoExiste(produtoId);
    return {
        produtoId: produto.id_produto,
        nome: produto.nome,
        quantidade_estoque: produto.quantidade_estoque,
        estoque_minimo: produto.estoque_minimo,
        abaixoDoMinimo: produto.quantidade_estoque <= produto.estoque_minimo,
    };
}

// Retorna todos os produtos com estoque igual ou abaixo do mínimo
async function listarAbaixoDoMinimo() {
    const produtos = await ProdutoModel.listarTodos();
    return produtos.filter(p => p.quantidade_estoque <= p.estoque_minimo);
}

module.exports = { entrada, saida, verificarEstoqueMinimo, listarAbaixoDoMinimo };
