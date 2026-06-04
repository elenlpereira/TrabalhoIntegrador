// O Model encapsula TODA a lógica de dados.
// O Controller nunca acessa os dados diretamente.

let produtos = [
    { id: 1, nome: 'Coca-Cola Lata', quantidadeEstoque: 48, estoqueMinimo: 10, categoria: 'bar', precoCusto: 2.50, precoVenda: 5.00 },
    { id: 2, nome: 'Pastel frito', quantidadeEstoque: 20, estoqueMinimo: 5, categoria: 'alimentos', precoCusto: 7.00, precoVenda: 15.00 },
];
let proximoId = 3;

const CATEGORIAS_VALIDAS = ['bar', 'mercearia', 'lanche', 'jogos'];

// ── Validações ────────────────────────────────────────────────────────────────

function validarCamposObrigatorios(dados) {
    const campos = ['nome', 'quantidadeEstoque', 'estoqueMinimo', 'categoria', 'precoCusto', 'precoVenda'];
    const ausentes = campos.filter(c => dados[c] === undefined || dados[c] === null || dados[c] === '');
    if (ausentes.length > 0) {
        throw new Error(`Campos obrigatórios ausentes: ${ausentes.join(', ')}`);
    }
}

function validarCategoria(categoria) {
    if (!CATEGORIAS_VALIDAS.includes(categoria)) {
        throw new Error(`Categoria inválida. Valores aceitos: ${CATEGORIAS_VALIDAS.join(', ')}`);
    }
}

function validarNumerosPositivos(dados) {
    if (dados.quantidadeEstoque < 0) throw new Error('A quantidade em estoque não pode ser negativa');
    if (dados.estoqueMinimo < 0) throw new Error('O estoque mínimo não pode ser negativo');
    if (dados.precoCusto <= 0) throw new Error('O preço de custo deve ser maior que zero');
    if (dados.precoVenda <= 0) throw new Error('O preço de venda deve ser maior que zero');
}

function validarNomeUnico(nome, idIgnorado = null) {
    const existe = produtos.find(p => p.nome.toLowerCase() === nome.toLowerCase() && p.id !== idIgnorado);
    if (existe) throw new Error('Já existe um produto com este nome');
}

function validarProduto(dados, idIgnorado = null) {
    validarCamposObrigatorios(dados);
    validarCategoria(dados.categoria);
    validarNumerosPositivos(dados);
    validarNomeUnico(dados.nome, idIgnorado);
}

// ── Funções de dados ──────────────────────────────────────────────────────────

function listarTodos(filtros = {}) {
    let resultado = [...produtos];
    if (filtros.categoria) {
        resultado = resultado.filter(p => p.categoria === filtros.categoria.toLowerCase());
    }
    return resultado;
}

function buscarPorId(id) {
    return produtos.find(p => p.id === id) || null;
}

function criar(dados) {
    validarProduto(dados);

    const novoProduto = {
        id: proximoId++,
        nome: dados.nome,
        quantidadeEstoque: Number(dados.quantidadeEstoque),
        estoqueMinimo: Number(dados.estoqueMinimo),
        categoria: dados.categoria,
        precoCusto: Number(dados.precoCusto),
        precoVenda: Number(dados.precoVenda),
    };
    produtos.push(novoProduto);
    return novoProduto;
}

// PUT - exige objeto completo
function atualizar(id, dados) {
    const idx = produtos.findIndex(p => p.id === id);
    if (idx === -1) return null;

    // Passa o id atual para não detectar o próprio produto como duplicado
    validarProduto(dados, id);

    produtos[idx] = {
        id,
        nome: dados.nome,
        quantidadeEstoque: Number(dados.quantidadeEstoque),
        estoqueMinimo: Number(dados.estoqueMinimo),
        categoria: dados.categoria,
        precoCusto: Number(dados.precoCusto),
        precoVenda: Number(dados.precoVenda),
    };
    return produtos[idx];
}

// PATCH - atualiza parcialmente
function atualizarParcial(id, dados) {
    const idx = produtos.findIndex(p => p.id === id);
    if (idx === -1) return null;

    if (dados.nome && dados.nome !== produtos[idx].nome) {
        validarNomeUnico(dados.nome, id);
    }
    if (dados.categoria) {
        validarCategoria(dados.categoria);
    }
    if (dados.quantidadeEstoque !== undefined && dados.quantidadeEstoque < 0) {
        throw new Error('A quantidade em estoque não pode ser negativa');
    }
    if (dados.estoqueMinimo !== undefined && dados.estoqueMinimo < 0) {
        throw new Error('O estoque mínimo não pode ser negativo');
    }
    if (dados.precoCusto !== undefined && dados.precoCusto <= 0) {
        throw new Error('O preço de custo deve ser maior que zero');
    }
    if (dados.precoVenda !== undefined && dados.precoVenda <= 0) {
        throw new Error('O preço de venda deve ser maior que zero');
    }

    produtos[idx] = { ...produtos[idx], ...dados, id };
    return produtos[idx];
}

function remover(id) {
    const idx = produtos.findIndex(p => p.id === id);
    if (idx === -1) return false;
    produtos.splice(idx, 1);
    return true;
}

module.exports = { listarTodos, buscarPorId, criar, atualizar, atualizarParcial, remover };
