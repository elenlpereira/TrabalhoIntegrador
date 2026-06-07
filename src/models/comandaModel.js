const ClienteModel = require('./clienteModel');
const ProdutoModel = require('./produtoModel');
const SaidaModel = require('./saidaModel');
const { CONSUMIDOR_FINAL_ID } = require('./clienteModel');
const PagamentoModel = require('./pagamentoModel');

let comandas  = [];
let proximoId = 1;

const STATUS = { ABERTA: 'aberta', FECHADA: 'fechada' };


function quantidadeReservada(produtoId, ignorarComandaId = null) {
    return comandas
        .filter(c => c.status === STATUS.ABERTA && c.id !== ignorarComandaId)
        .reduce((soma, c) => {
            const item = c.itens.find(i => i.produtoId === produtoId);
            return soma + (item ? item.quantidade : 0);
        }, 0);
}


function estoqueDisponivel(produtoId, ignorarComandaId = null) {
    const produto  = ProdutoModel.buscarPorId(produtoId);
    if (!produto) throw new Error(`Produto com id ${produtoId} não encontrado`);
    const reservado = quantidadeReservada(produtoId, ignorarComandaId);
    return produto.quantidadeEstoque - reservado;
}

// ── Validações ────────────────────────────────────────────────────────────────

function validarClienteExiste(clienteId) {
    const cliente = ClienteModel.buscarPorId(clienteId);
    if (!cliente) throw new Error(`Cliente com id ${clienteId} não encontrado`);
    return cliente;
}

function validarProdutoExiste(produtoId) {
    const produto = ProdutoModel.buscarPorId(produtoId);
    if (!produto) throw new Error(`Produto com id ${produtoId} não encontrado`);
    return produto;
}

function validarQuantidade(quantidade) {
    const qtd = Number(quantidade);
    if (!Number.isInteger(qtd) || qtd <= 0) {
        throw new Error('A quantidade deve ser um número inteiro maior que zero');
    }
    return qtd;
}

function validarComandaAberta(comanda) {
    if (comanda.status === STATUS.FECHADA) {
        throw new Error('Não é possível alterar uma comanda fechada');
    }
}

// ── Cálculo do total ──────────────────────────────────────────────────────────

function calcularTotal(itens) {
    return itens.reduce((soma, item) => soma + item.subtotal, 0);
}

// ── Funções de dados ──────────────────────────────────────────────────────────

function listarTodos(filtros = {}) {
    let resultado = [...comandas];
    if (filtros.status) {
        resultado = resultado.filter(c => c.status === filtros.status);
    }
    return resultado;
}

function buscarPorId(id) {
    return comandas.find(c => c.id === id) || null;
}

// Abre uma nova comanda — clienteId e infoCliente são opcionais
// Se clienteId não for informado, usa Consumidor Final automaticamente
function criar(dados = {}) {
    const clienteId = dados.clienteId ? Number(dados.clienteId) : CONSUMIDOR_FINAL_ID;
    validarClienteExiste(clienteId);
 
    const novaComanda = {
        id:          proximoId++,
        status:      STATUS.ABERTA,
        infoCliente: dados.infoCliente || null,
        clienteId,
        itens:       [],
        total:       0,
    };

    comandas.push(novaComanda);
    return novaComanda;
}

// Atualiza infoCliente e/ou clienteId enquanto a comanda estiver aberta
function atualizarCabecalho(id, dados) {
    const comanda = buscarPorId(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    if (dados.infoCliente !== undefined) {
        comanda.infoCliente = dados.infoCliente || null;
    }

    if (dados.clienteId !== undefined) {
        const clienteId = dados.clienteId ? Number(dados.clienteId) : CONSUMIDOR_FINAL_ID;
        validarClienteExiste(clienteId);
        comanda.clienteId = clienteId;
    }

    return comanda;
}

// Adiciona um item ou incrementa a quantidade se o produto já estiver na comanda.
// Valida disponibilidade considerando o que outras comandas abertas já reservaram.
function adicionarItem(id, dados) {
    const comanda = buscarPorId(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    const produto = validarProdutoExiste(Number(dados.produtoId));
    const qtdAdd  = validarQuantidade(dados.quantidade);

    // Quanto já está reservado nesta própria comanda para este produto
    const itemExistente = comanda.itens.find(i => i.produtoId === produto.id);
    const qtdNaComanda  = itemExistente ? itemExistente.quantidade : 0;

    // Disponível = estoque físico − reservado em OUTRAS comandas abertas
    const disponivel = estoqueDisponivel(produto.id, id);

    if (qtdNaComanda + qtdAdd > disponivel) {
        throw new Error(
            `Estoque insuficiente. Disponível (fora desta comanda): ${disponivel - qtdNaComanda}, solicitado: ${qtdAdd}`
        );
    }

    if (itemExistente) {
        itemExistente.quantidade += qtdAdd;
        itemExistente.subtotal    = itemExistente.quantidade * itemExistente.precoUnitario;
    } else {
        comanda.itens.push({
            produtoId:     produto.id,
            nomeProduto:   produto.nome,
            precoUnitario: produto.precoVenda,
            quantidade:    qtdAdd,
            subtotal:      qtdAdd * produto.precoVenda,
        });
    }

    comanda.total = calcularTotal(comanda.itens);
    return comanda;
}

// Altera a quantidade de um item (envia a quantidade NOVA desejada).
function atualizarItem(id, produtoId, dados) {
    const comanda = buscarPorId(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    const pId = Number(produtoId);
    const item = comanda.itens.find(i => i.produtoId === pId);
    if (!item) throw new Error(`Produto com id ${pId} não encontrado na comanda`);

    const novaQtd = validarQuantidade(dados.quantidade);

    // Disponível = estoque físico − reservado em outras comandas (ignora esta)
    const disponivel = estoqueDisponivel(pId, id);

    if (novaQtd > disponivel) {
        throw new Error(
            `Estoque insuficiente. Disponível (fora desta comanda): ${disponivel}, solicitado: ${novaQtd}`
        );
    }

    item.quantidade = novaQtd;
    item.subtotal   = novaQtd * item.precoUnitario;
    comanda.total   = calcularTotal(comanda.itens);
    return comanda;
}

// Remove um item da comanda — sem movimentar estoque (ainda não foi baixado)
function removerItem(id, produtoId) {
    const comanda = buscarPorId(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    const pId = Number(produtoId);
    const idx = comanda.itens.findIndex(i => i.produtoId === pId);
    if (idx === -1) throw new Error(`Produto com id ${pId} não encontrado na comanda`);

    comanda.itens.splice(idx, 1);
    comanda.total = calcularTotal(comanda.itens);
    return comanda;
}

// Fecha a comanda: registra as saídas no estoque e marca a comanda como fechada.
function fechar(id) {
    const comanda = buscarPorId(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    if (comanda.itens.length === 0) {
        throw new Error('Não é possível fechar uma comanda sem itens');
    }
 
    for (const item of comanda.itens) {
        SaidaModel.registrarSaidaVenda(item.produtoId, item.quantidade);
    }
 
    comanda.status    = STATUS.FECHADA;
    comanda.fechadoEm = new Date().toISOString();
   
     // Gera o registro de pagamento pendente
    const pagamento = PagamentoModel.criar(comanda.id, comanda.clienteId, comanda.total);
    comanda.pagamentoId = pagamento.id;
 
    return { comanda, pagamento };
}

// Cancela a comanda: remove o registro sem mexer no estoque (nada foi baixado)
function cancelar(id) {
    const comanda = buscarPorId(id);
    if (!comanda) return null;
    validarComandaAberta(comanda);

    const idx = comandas.findIndex(c => c.id === id);
    comandas.splice(idx, 1);
    return comanda;
}

module.exports = {listarTodos, buscarPorId, criar, atualizarCabecalho, adicionarItem, atualizarItem, removerItem, fechar, cancelar, STATUS};