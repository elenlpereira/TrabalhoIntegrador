// A rota só conecta URL a Controller

const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/produtoController');

router.get('/', ProdutoController.listar);
router.get('/:id', ProdutoController.buscar);
router.post('/', ProdutoController.criar);
router.put('/:id', ProdutoController.atualizar);
router.patch('/:id', ProdutoController.atualizar);
router.delete('/:id', ProdutoController.remover);

module.exports = router;
