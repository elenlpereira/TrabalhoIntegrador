const express = require('express');
const router = express.Router();
const CompraController = require('../controllers/compraController');

router.get('/fornecedores', CompraController.listarFornecedores);
router.get('/', CompraController.listar);
router.get('/:id', CompraController.buscar);
router.post('/', CompraController.criar);
router.delete('/:id', CompraController.remover);

module.exports = router;
