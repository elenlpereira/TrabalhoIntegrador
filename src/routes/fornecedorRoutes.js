const express = require('express');
const router = express.Router();
const FornecedorController = require('../controllers/fornecedorController');
const autorizarGerente = require('../middlewares/autorizarGerente');
 
router.get('/',           FornecedorController.listar);
router.get('/busca',      FornecedorController.buscarNome);
router.get('/cnpj/:cnpj', FornecedorController.buscarCNPJ);
router.get('/:id',        FornecedorController.buscarID);
router.post('/',          autorizarGerente, FornecedorController.criar);
router.put('/:id',        autorizarGerente, FornecedorController.atualizar);
router.patch('/:id',      autorizarGerente, FornecedorController.atualizarParcial);
router.delete('/:id',     autorizarGerente, FornecedorController.remover);
 
module.exports = router;