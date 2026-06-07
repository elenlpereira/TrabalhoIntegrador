const express = require('express');
// Garante que todos os models Sequelize e suas associações são carregados
// antes de qualquer requisição chegar
require('./models/index');

const usuarioRoutes  = require('./routes/usuarioRoutes');
const produtoRoutes  = require('./routes/produtoRoutes');
const compraRoutes   = require('./routes/compraRoutes');
const saidaRoutes    = require('./routes/saidaRoutes');
const clienteRoutes  = require('./routes/clienteRoutes');
const fornecedorRoutes = require('./routes/fornecedorRoutes');
const comandaRoutes  = require('./routes/comandaRoutes');

const app = express();
app.use(express.json());

app.use('/api/usuarios',    usuarioRoutes);
app.use('/api/produtos',    produtoRoutes);
app.use('/api/compras',     compraRoutes);
app.use('/api/saidas',      saidaRoutes);
app.use('/api/clientes',    clienteRoutes);
app.use('/api/fornecedores', fornecedorRoutes);
app.use('/api/comandas',    comandaRoutes);

module.exports = app;