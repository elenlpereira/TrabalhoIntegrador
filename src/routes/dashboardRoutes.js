const express = require('express');
const router  = express.Router();
const DashboardController = require('../controllers/dashboardController');

router.get('/',        DashboardController.resumo);
router.get('/analise', DashboardController.analise);

module.exports = router;
