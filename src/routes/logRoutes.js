const express = require('express');
const router  = express.Router();
const LogController = require('../controllers/logController');

router.get('/',    LogController.listar);
router.get('/:id', LogController.buscar);

module.exports = router;
