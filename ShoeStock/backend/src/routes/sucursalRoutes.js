const express = require('express');
const router = express.Router();

const {
  obtenerZapatosCentro,
  obtenerZapatosNorte,
  obtenerZapatosSur,
} = require('../controllers/sucursalController');

router.get('/centro', obtenerZapatosCentro);
router.get('/norte', obtenerZapatosNorte);
router.get('/sur', obtenerZapatosSur);

module.exports = router;