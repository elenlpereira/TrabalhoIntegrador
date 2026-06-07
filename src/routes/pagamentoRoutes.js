const express = require('express');
const router = express.Router();
const PagamentoController = require('../controllers/pagamentoController');

router.get('/', PagamentoController.listar);
router.get('/comanda/:comandaId', PagamentoController.buscarPorComanda);
router.get('/:id', PagamentoController.buscar);    
router.post('/:id/pagar', PagamentoController.pagar);       

module.exports = router;