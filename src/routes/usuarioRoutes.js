const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');
const autorizarGerente = require('../middlewares/autorizarGerente');

// Todas as operações de usuário são exclusivas do Gerente
router.use(autorizarGerente);

router.get('/', UsuarioController.listar);
router.get('/:id', UsuarioController.buscar);
router.post('/', UsuarioController.criar);
router.put('/:id', UsuarioController.atualizar);
router.patch('/:id', UsuarioController.atualizarParcial);
router.delete('/:id', UsuarioController.remover);

module.exports = router;
