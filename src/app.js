const express = require('express');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();
app.use(express.json());

// Monta o router no caminho base
app.use('/api/usuarios', usuarioRoutes);

module.exports = app;