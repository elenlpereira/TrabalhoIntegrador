const express = require('express');
const router = express.Router();
const ComandaController = require('../controllers/comandaController');

router.get('/',                                   ComandaController.listar);
router.get('/:id',                                ComandaController.buscar);
router.post('/',                                  ComandaController.criar);
router.patch('/:id',                              ComandaController.atualizarCabecalho);
router.delete('/:id',                             ComandaController.cancelar);
router.post('/:id/fechar',                        ComandaController.fechar);
router.post('/:id/consumos',                      ComandaController.adicionarConsumo);
router.patch('/:id/consumos/:consumoId',          ComandaController.atualizarConsumo);
router.delete('/:id/consumos/:consumoId',         ComandaController.removerConsumo);

module.exports = router;