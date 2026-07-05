const express = require('express');
const cors = require('cors');
const RESP_HTTP = require('../consts');
// Garante que todos os models Sequelize e suas associações são carregados
// antes de qualquer requisição chegar
require('./models/index');

const usuarioRoutes    = require('./routes/usuarioRoutes');
const produtoRoutes    = require('./routes/produtoRoutes');
const compraRoutes     = require('./routes/compraRoutes');
const clienteRoutes    = require('./routes/clienteRoutes');
const fornecedorRoutes = require('./routes/fornecedorRoutes');
const comandaRoutes    = require('./routes/comandaRoutes');
const consumoRoutes    = require('./routes/consumoRoutes');
const notaFiscalRoutes = require('./routes/notaFiscalRoutes');
const logRoutes        = require('./routes/logRoutes');
const fichaRoutes      = require('./routes/fichaRoutes');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/usuarios',      usuarioRoutes);
app.use('/api/produtos',      produtoRoutes);
app.use('/api/compras',       compraRoutes);
app.use('/api/clientes',      clienteRoutes);
app.use('/api/fornecedores',  fornecedorRoutes);
app.use('/api/comandas',      comandaRoutes);
app.use('/api/consumos',      consumoRoutes);
app.use('/api/notas-fiscais', notaFiscalRoutes);
app.use('/api/logs',          logRoutes);
app.use('/api/fichas',        fichaRoutes);

// Middleware global de erro — captura qualquer erro não tratado nas rotas
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err);
    res.status(RESP_HTTP.INTERNAL_SERVER_ERROR).json({ erro: 'Erro interno do servidor' });
});

module.exports = app;
