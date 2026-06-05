const ProdutoModel = require('./produtoModel');

// ── Validações 

function validarProdutoExiste(produtoId) {
    const produto = ProdutoModel.buscarPorId(produtoId);
    if (!produto) throw new Error(`Produto com id ${produtoId} não encontrado`);
    return produto;
}

function validarQuantidade(quantidade) {
    if (!quantidade || isNaN(quantidade) || Number(quantidade) <= 0) {
        throw new Error('A quantidade deve ser um número maior que zero');
    }
}

function validarEstoqueSuficiente(produto, quantidade) {
    if (produto.quantidadeEstoque < quantidade) {
        throw new Error(
            `Estoque insuficiente. Disponível: ${produto.quantidadeEstoque}, solicitado: ${quantidade}`
        );
    }
}

// ── Operações de movimentação 

// Soma quantidade ao estoque do produto (compra / estorno de saída)
function entrada(produtoId, quantidade) {
    validarProdutoExiste(produtoId);
    validarQuantidade(quantidade);

    const qtd = Number(quantidade);
    ProdutoModel.atualizarParcial(produtoId, {
        quantidadeEstoque: ProdutoModel.buscarPorId(produtoId).quantidadeEstoque + qtd,
    });

    return ProdutoModel.buscarPorId(produtoId);
}

// Subtrai quantidade do estoque do produto (venda / saída manual)
function saida(produtoId, quantidade) {
    const produto = validarProdutoExiste(produtoId);
    validarQuantidade(quantidade);

    const qtd = Number(quantidade);
    validarEstoqueSuficiente(produto, qtd);

    ProdutoModel.atualizarParcial(produtoId, {
        quantidadeEstoque: produto.quantidadeEstoque - qtd,
    });

    return ProdutoModel.buscarPorId(produtoId);
}

// Retorna true se o estoque atual estiver igual ou abaixo do mínimo
function verificarEstoqueMinimo(produtoId) {
    const produto = validarProdutoExiste(produtoId);
    return {
        produtoId: produto.id,
        nome: produto.nome,
        quantidadeEstoque: produto.quantidadeEstoque,
        estoqueMinimo: produto.estoqueMinimo,
        abaixoDoMinimo: produto.quantidadeEstoque <= produto.estoqueMinimo,
    };
}

// Retorna todos os produtos com estoque igual ou abaixo do mínimo
function listarAbaixoDoMinimo() {
    const produtos = ProdutoModel.listarTodos();
    return produtos.filter(p => p.quantidadeEstoque <= p.estoqueMinimo);
}

module.exports = { entrada, saida, verificarEstoqueMinimo, listarAbaixoDoMinimo };
