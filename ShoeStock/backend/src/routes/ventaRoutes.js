const express = require('express');
const router = express.Router();

const {
  registrarVenta,
  obtenerVentas,
  obtenerResumenVentas,
} = require('../controllers/ventaController');

router.get('/', obtenerVentas);
router.post('/', registrarVenta);
router.get('/resumen', obtenerResumenVentas);

module.exports = router;