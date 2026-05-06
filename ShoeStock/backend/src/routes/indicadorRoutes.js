const express = require('express');
const router = express.Router();

const {
  productosPorTipo,
  stockPorSucursal,
  precioPromedioPorMarca,
  inventarioBajo,
} = require('../controllers/indicadorController');

router.get('/productos-por-tipo', productosPorTipo);
router.get('/stock-por-sucursal', stockPorSucursal);
router.get('/precio-promedio-marca', precioPromedioPorMarca);
router.get('/inventario-bajo', inventarioBajo);

module.exports = router;