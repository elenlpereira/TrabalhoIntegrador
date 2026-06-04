const express = require('express');
const usuarioRoutes = require('./routes/usuarioRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const clienteRoutes = require('./routes/clienteRoutes');

const app = express();
app.use(express.json());

// Monta o router no caminho base
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/clientes', clienteRoutes);

module.exports = app;