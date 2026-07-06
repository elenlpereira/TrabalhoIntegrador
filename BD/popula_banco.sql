-- Seeder atualizado com lógica de dívida / fiado de cliente

-- Tabela de dívidas de clientes
-- Use esta tabela quando uma comanda for fechada sem pagamento total.
CREATE TABLE IF NOT EXISTS divida_cliente (
    pk_divida SERIAL PRIMARY KEY,
    fk_cliente INTEGER NOT NULL,
    fk_comanda INTEGER,
    valor_total NUMERIC(10,2) NOT NULL,
    valor_pago NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTA',
    data_divida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_quitacao TIMESTAMP,

    CONSTRAINT fk_divida_cliente
        FOREIGN KEY (fk_cliente)
        REFERENCES cliente(pk_cliente)
        ON DELETE CASCADE,

    CONSTRAINT fk_divida_comanda
        FOREIGN KEY (fk_comanda)
        REFERENCES comanda(pk_comanda)
        ON DELETE SET NULL,

    CONSTRAINT ck_divida_status
        CHECK (status IN ('ABERTA', 'PARCIAL', 'PAGA')),

    CONSTRAINT ck_divida_valores
        CHECK (valor_total >= 0 AND valor_pago >= 0 AND valor_pago <= valor_total)
);

TRUNCATE TABLE log, divida_cliente, consumo, compra, comanda, produto, fornecedor, cliente, usuario
RESTART IDENTITY CASCADE;

-- Usuários
INSERT INTO usuario (nome, email, senha, perfil_acesso) VALUES
('Administrador', 'admin@sistema.com', '123456', 'Gerente'),
('João Silva', 'joao@sistema.com', '123456', 'Atendente');

-- Clientes
INSERT INTO cliente (nome, cpf, telefone, email, data_nascimento, endereco) VALUES
('Carlos Souza', '111.222.333-44', '49999991111', 'carlos@email.com', '1990-05-10', 'Rua A, 123'),
('Maria Oliveira', '555.666.777-88', '49999992222', 'maria@email.com', '1988-11-20', 'Rua B, 456');

-- Fornecedores
INSERT INTO fornecedor (razao_social, cnpj, telefone, email, endereco, categoria_produtos) VALUES
('Distribuidora Bebidas LTDA', '11.222.333/0001-99', '4933331111', 'contato@bebidas.com', 'Chapecó/SC', 'Bebidas'),
('Mercado Central', '99.888.777/0001-55', '4933332222', 'vendas@mercado.com', 'Chapecó/SC', 'Mercearia');

-- Produtos
INSERT INTO produto (nome, quantidade_estoque, estoque_minimo, categoria, preco_custo, preco_venda) VALUES
('Coca-Cola Lata', 50, 10, 'Bar', 4.50, 7.00),
('Batata Frita', 30, 5, 'Lanche', 10.00, 20.00),
('Água Mineral', 40, 10, 'Bar', 2.00, 4.50),
('Pastel', 4, 5, 'Lanche', 10.00, 20.00);

-- Compras de estoque
INSERT INTO compra (fk_produto, fk_fornecedor, quantidade, custo_unitario, nota_fiscal, data_recebimento) VALUES
(1, 1, 50, 4.50, 'NF-000123', '2026-07-01'),
(2, 2, 30, 10.00, 'NF-000124', '2026-07-01');

-- Nota Fiscal
-- Se sua tabela nota_fiscal não existir no modelo físico, crie ela no script de criação do banco
-- ou remova este bloco.
INSERT INTO nota_fiscal (numero, valor_total) VALUES
('NF-000123', 225.00),
('NF-000124', 300.00);

-- Comandas
INSERT INTO comanda
(fk_cliente, identificacao, valor_total, valor_debito, status, data_hora_inicio, data_hora_termino, forma_pagamento)
VALUES
(NULL, 'Mesa 03', 34.00, 0.00, 'aberta', NOW(), NULL, NULL),
(1, 'Mesa 05', 27.00, 0.00, 'fechada', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 'Pix'),
(2, 'Mesa de Sinuca', 35.00, 35.00, 'a receber', NOW(), NULL, 'Fiado');

-- Consumos
INSERT INTO consumo (fk_produto, fk_comanda, quantidade, hora_inclusao, observacoes) VALUES
(1, 1, 2, NOW(), 'Sem gelo'),
(2, 1, 1, NOW(), 'Bem passada'),
(3, 2, 3, NOW(), ''),
(4, 3, 1, NOW(), '');

-- Dívidas / Fiado
-- Maria ficou devendo R$ 35,00 referente à comanda 3.
INSERT INTO divida_cliente
(fk_cliente, fk_comanda, valor_total, valor_pago, status, data_divida, data_quitacao)
VALUES
(2, 3, 35.00, 0.00, 'ABERTA', NOW(), NULL);

-- Exemplo de dívida parcialmente paga
INSERT INTO divida_cliente
(fk_cliente, fk_comanda, valor_total, valor_pago, status, data_divida, data_quitacao)
VALUES
(1, 2, 27.00, 10.00, 'PARCIAL', NOW() - INTERVAL '1 day', NULL);

-- Logs
INSERT INTO log (fk_usuario, fk_comanda, fk_compra, tipo, data_hora, descricao) VALUES
(1, 1, NULL, 'ABERTURA_COMANDA', NOW(), 'Comanda aberta'),
(2, 2, NULL, 'FECHAMENTO_COMANDA', NOW(), 'Pagamento via Pix'),
(1, NULL, 1, 'ENTRADA_ESTOQUE', NOW(), 'Compra registrada no estoque'),
(2, 3, NULL, 'DIVIDA_CLIENTE', NOW(), 'Comanda lançada como fiado para cliente');

-- Consultas úteis
-- Total em aberto por cliente:
-- SELECT
--     c.nome,
--     SUM(d.valor_total - d.valor_pago) AS total_devido
-- FROM divida_cliente d
-- JOIN cliente c ON c.pk_cliente = d.fk_cliente
-- WHERE d.status IN ('ABERTA', 'PARCIAL')
-- GROUP BY c.nome;

-- Registrar pagamento parcial:
-- UPDATE divida_cliente
-- SET valor_pago = valor_pago + 10.00,
--     status = CASE
--         WHEN valor_pago + 10.00 >= valor_total THEN 'PAGA'
--         ELSE 'PARCIAL'
--     END,
--     data_quitacao = CASE
--         WHEN valor_pago + 10.00 >= valor_total THEN NOW()
--         ELSE NULL
--     END
-- WHERE pk_divida = 1;
