const express = require('express');
const router  = express.Router();
const NotaFiscalController = require('../controllers/notaFiscalController');

router.get('/',    NotaFiscalController.listar);
router.get('/:id', NotaFiscalController.buscar);
router.post('/',   NotaFiscalController.criar);
router.put('/:id', NotaFiscalController.atualizar);
router.delete('/:id', NotaFiscalController.remover);

module.exports = router;
