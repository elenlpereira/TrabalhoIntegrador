const express = require('express');
const router = express.Router();
const CompraController = require('../controllers/compraController');
const autorizarGerente = require('../middlewares/autorizarGerente');

// Registro e estorno de compras são exclusivos do Gerente
router.use(autorizarGerente);

router.get('/',    CompraController.listar);
router.get('/:id', CompraController.buscar);
router.post('/',   CompraController.criar);
router.delete('/:id', CompraController.remover);

module.exports = router;
