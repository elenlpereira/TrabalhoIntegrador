\c sistema_bar

-- =====================================================
-- Tabela Usuario
-- =====================================================

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil_acesso VARCHAR(50) NOT NULL
);

-- =====================================================
-- Tabela Cliente
-- =====================================================

CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(100),
    data_nascimento DATE,
    endereco VARCHAR(255)
);

-- =====================================================
-- Tabela Fornecedor
-- =====================================================

CREATE TABLE fornecedor (
    id_fornecedor SERIAL PRIMARY KEY,
    razao_social VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(100),
    endereco VARCHAR(255),
    categoria_produtos VARCHAR(100)
);

-- =====================================================
-- Tabela Produto
-- =====================================================

CREATE TABLE produto (
    id_produto SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    quantidade_estoque INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 0,
    categoria VARCHAR(100),
    preco_custo NUMERIC(10,2) NOT NULL,
    preco_venda NUMERIC(10,2) NOT NULL
);

-- =====================================================
-- Tabela Comanda
-- =====================================================

CREATE TABLE comanda (
    id_comanda SERIAL PRIMARY KEY,
    fk_cliente INT,
    identificacao VARCHAR(50),
    valor_total NUMERIC(10,2) DEFAULT 0,
    valor_debito NUMERIC(10,2) DEFAULT 0,
    status VARCHAR(30) NOT NULL,
    data_hora_inicio TIMESTAMP NOT NULL,
    data_hora_termino TIMESTAMP,
    forma_pagamento VARCHAR(50),

    CONSTRAINT fk_comanda_cliente
        FOREIGN KEY (fk_cliente)
        REFERENCES cliente(id_cliente)
);

-- =====================================================
-- Tabela Compra
-- =====================================================

CREATE TABLE compra (
    id_compra SERIAL PRIMARY KEY,
    fk_produto INT NOT NULL,
    fk_fornecedor INT NOT NULL,
    fk_nota_fiscal INT,
    quantidade INT NOT NULL,
    custo_unitario NUMERIC(10,2) NOT NULL,
    data_recebimento DATE NOT NULL,

    CONSTRAINT fk_compra_produto
        FOREIGN KEY (fk_produto)
        REFERENCES produto(id_produto),

    CONSTRAINT fk_compra_fornecedor
        FOREIGN KEY (fk_fornecedor)
        REFERENCES fornecedor(id_fornecedor),

    CONSTRAINT fk_compra_nota_fiscal
        FOREIGN KEY (fk_nota_fiscal)
        REFERENCES nota_fiscal(id_nota_fiscal)
);

-- =====================================================
-- Tabela Consumo
-- =====================================================

CREATE TABLE consumo (
    id_consumo SERIAL PRIMARY KEY,
    fk_produto INT NOT NULL,
    fk_comanda INT NOT NULL,
    quantidade INT NOT NULL,
    hora_inclusao TIMESTAMP NOT NULL,
    observacoes VARCHAR(255),

    CONSTRAINT fk_consumo_produto
        FOREIGN KEY (fk_produto)
        REFERENCES produto(id_produto),

    CONSTRAINT fk_consumo_comanda
        FOREIGN KEY (fk_comanda)
        REFERENCES comanda(id_comanda)
);

-- =====================================================
-- Tabela Log
-- =====================================================

CREATE TABLE log (
    id_log SERIAL PRIMARY KEY,
    fk_usuario INT NOT NULL,
    fk_comanda INT,
    fk_compra INT,
    tipo VARCHAR(50) NOT NULL,
    data_hora TIMESTAMP NOT NULL,
    descricao VARCHAR(255),

    CONSTRAINT fk_log_usuario
        FOREIGN KEY (fk_usuario)
        REFERENCES usuario(id_usuario),

    CONSTRAINT fk_log_comanda
        FOREIGN KEY (fk_comanda)
        REFERENCES comanda(id_comanda),

    CONSTRAINT fk_log_compra
        FOREIGN KEY (fk_compra)
        REFERENCES compra(id_compra)
);
