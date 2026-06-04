const express = require('express');
const usuarioRoutes = require('./routes/usuarioRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');

const app = express();
app.use(express.json());

// Monta o router no caminho base
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/clientes', clienteRoutes);

module.exports = app;