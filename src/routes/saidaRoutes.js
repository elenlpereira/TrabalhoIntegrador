const express = require('express');
const router = express.Router();
const SaidaController = require('../controllers/saidaController');

router.get('/tipos', SaidaController.listarTipos);
router.get('/', SaidaController.listar);
router.get('/:id', SaidaController.buscar);
router.post('/manual', SaidaController.criarManual);
router.delete('/:id', SaidaController.remover);

module.exports = router;
