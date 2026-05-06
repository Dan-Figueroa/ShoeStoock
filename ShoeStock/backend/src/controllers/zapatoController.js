const Zapato = require('../models/Zapato');

// Obtener todos los zapatos
const obtenerZapatos = async (req, res) => {
  try {
    const zapatos = await Zapato.find().sort({ createdAt: -1 });

    res.json({
      total: zapatos.length,
      datos: zapatos,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener los zapatos',
      error: error.message,
    });
  }
};

// Crear un nuevo zapato
const crearZapato = async (req, res) => {
  try {
    const nuevoZapato = new Zapato(req.body);
    const zapatoGuardado = await nuevoZapato.save();

    res.status(201).json({
      mensaje: 'Zapato registrado correctamente',
      dato: zapatoGuardado,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al registrar el zapato',
      error: error.message,
    });
  }
};

// Actualizar un zapato
const actualizarZapato = async (req, res) => {
  try {
    const { id } = req.params;

    const zapatoActualizado = await Zapato.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!zapatoActualizado) {
      return res.status(404).json({
        mensaje: 'No se encontró el zapato',
      });
    }

    res.json({
      mensaje: 'Zapato actualizado correctamente',
      dato: zapatoActualizado,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al actualizar el zapato',
      error: error.message,
    });
  }
};

// Eliminar un zapato
const eliminarZapato = async (req, res) => {
  try {
    const { id } = req.params;

    const zapatoEliminado = await Zapato.findByIdAndDelete(id);

    if (!zapatoEliminado) {
      return res.status(404).json({
        mensaje: 'No se encontró el zapato',
      });
    }

    res.json({
      mensaje: 'Zapato eliminado correctamente',
      dato: zapatoEliminado,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al eliminar el zapato',
      error: error.message,
    });
  }
};

module.exports = {
  obtenerZapatos,
  crearZapato,
  actualizarZapato,
  eliminarZapato,
};