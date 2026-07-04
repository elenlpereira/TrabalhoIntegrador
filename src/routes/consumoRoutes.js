const express = require('express');
const router  = express.Router();
const ConsumoController = require('../controllers/consumoController');

router.get('/',    ConsumoController.listar);
router.get('/:id', ConsumoController.buscar);

module.exports = router;
