const ZapatoCentro = require('../models/ZapatoCentro');
const ZapatoNorte = require('../models/ZapatoNorte');
const ZapatoSur = require('../models/ZapatoSur');

const obtenerZapatosCentro = async (req, res) => {
  try {
    const zapatos = await ZapatoCentro.find().sort({ nombre: 1 });

    res.json({
      sucursal: 'Centro',
      total: zapatos.length,
      datos: zapatos,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al consultar la sucursal Centro',
      error: error.message,
    });
  }
};

const obtenerZapatosNorte = async (req, res) => {
  try {
    const zapatos = await ZapatoNorte.find().sort({ nombre: 1 });

    res.json({
      sucursal: 'Norte',
      total: zapatos.length,
      datos: zapatos,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al consultar la sucursal Norte',
      error: error.message,
    });
  }
};

const obtenerZapatosSur = async (req, res) => {
  try {
    const zapatos = await ZapatoSur.find().sort({ nombre: 1 });

    res.json({
      sucursal: 'Sur',
      total: zapatos.length,
      datos: zapatos,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al consultar la sucursal Sur',
      error: error.message,
    });
  }
};

module.exports = {
  obtenerZapatosCentro,
  obtenerZapatosNorte,
  obtenerZapatosSur,
};