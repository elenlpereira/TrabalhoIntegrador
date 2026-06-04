const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/clienteController');
 
router.get('/',             ClienteController.listar);
router.get('/busca',        ClienteController.buscarNome);      
router.get('/cpf/:cpf',     ClienteController.buscarCPF);
router.get('/:id',          ClienteController.buscarID);
router.post('/',            ClienteController.criar);
router.put('/:id',          ClienteController.atualizar);
router.patch('/:id',        ClienteController.atualizarParcial);
router.delete('/:id',       ClienteController.remover);
 
module.exports = router;