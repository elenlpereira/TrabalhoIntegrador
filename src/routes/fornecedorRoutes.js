const express = require('express');
const router = express.Router();
const FornecedorController = require('../controllers/fornecedorController');
 
router.get('/',           FornecedorController.listar);
router.get('/busca',      FornecedorController.buscarNome);     // GET /api/fornecedores/busca?nome=abc
router.get('/cnpj/:cnpj', FornecedorController.buscarCNPJ);
router.get('/:id',        FornecedorController.buscarID);
router.post('/',          FornecedorController.criar);
router.put('/:id',        FornecedorController.atualizar);
router.patch('/:id',      FornecedorController.atualizarParcial);
router.delete('/:id',     FornecedorController.remover);
 
module.exports = router;