const express = require('express');
const router = express.Router();
const ComandaController = require('../controllers/comandaController');

router.get('/', ComandaController.listar);           
router.get('/:id', ComandaController.buscar);          
router.post('/', ComandaController.criar);            
router.patch('/:id', ComandaController.atualizarCabecalho); 
router.delete('/:id', ComandaController.cancelar);         
router.post('/:id/fechar', ComandaController.fechar);      
router.post('/:id/itens', ComandaController.adicionarItem); 
router.patch('/:id/itens/:produtoId', ComandaController.atualizarItem);  
router.delete('/:id/itens/:produtoId',ComandaController.removerItem);    

module.exports = router;