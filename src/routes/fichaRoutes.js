const express = require('express');
const router = express.Router();
const FichaController = require('../controllers/fichaController');

router.get('/',                      FichaController.listar);
router.get('/:clienteId',            FichaController.buscar);
router.post('/:clienteId/quitar',    FichaController.quitar);
module.exports = router;