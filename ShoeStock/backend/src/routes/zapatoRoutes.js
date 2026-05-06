const express = require('express');
const router = express.Router();

const {
  obtenerZapatos,
  crearZapato,
  actualizarZapato,
  eliminarZapato,
} = require('../controllers/zapatoController');

router.get('/', obtenerZapatos);
router.post('/', crearZapato);
router.put('/:id', actualizarZapato);
router.delete('/:id', eliminarZapato);

module.exports = router;