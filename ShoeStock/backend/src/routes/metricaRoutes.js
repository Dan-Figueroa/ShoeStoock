const express = require('express');
const router = express.Router();

const {
  registrarMetrica,
  obtenerMetricas,
  resumenMetricas,
} = require('../controllers/metricaController');

router.post('/', registrarMetrica);
router.get('/', obtenerMetricas);
router.get('/resumen', resumenMetricas);

module.exports = router;