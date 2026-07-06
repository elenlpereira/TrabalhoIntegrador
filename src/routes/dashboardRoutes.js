const express = require('express');
const router  = express.Router();
const DashboardController = require('../controllers/dashboardController');

router.get('/', DashboardController.resumo);

module.exports = router;
