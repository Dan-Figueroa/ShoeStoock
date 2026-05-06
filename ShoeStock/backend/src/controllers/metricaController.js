const Metrica = require('../models/Metrica');

const clasificarEstado = (tiempoRespuesta) => {
  if (tiempoRespuesta <= 300) {
    return 'normal';
  }

  if (tiempoRespuesta <= 700) {
    return 'lento';
  }

  return 'saturado';
};

const registrarMetrica = async (req, res) => {
  try {
    const {
      peticiones,
      tiempo_respuesta,
      nodos,
      registros_insertados,
    } = req.body;

    const estado = clasificarEstado(tiempo_respuesta);

    const nuevaMetrica = new Metrica({
      peticiones,
      tiempo_respuesta,
      nodos,
      registros_insertados,
      estado,
    });

    const metricaGuardada = await nuevaMetrica.save();

    res.status(201).json({
      mensaje: 'Métrica registrada correctamente',
      dato: metricaGuardada,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al registrar la métrica',
      error: error.message,
    });
  }
};

const obtenerMetricas = async (req, res) => {
  try {
    const metricas = await Metrica.find().sort({ timestamp: -1 });

    res.json({
      total: metricas.length,
      datos: metricas,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al consultar las métricas',
      error: error.message,
    });
  }
};

const resumenMetricas = async (req, res) => {
  try {
    const resultado = await Metrica.aggregate([
      {
        $group: {
          _id: '$estado',
          total_registros: { $sum: 1 },
          promedio_tiempo_respuesta: { $avg: '$tiempo_respuesta' },
          promedio_peticiones: { $avg: '$peticiones' },
          promedio_nodos: { $avg: '$nodos' },
        },
      },
      {
        $sort: { total_registros: -1 },
      },
    ]);

    res.json({
      indicador: 'Resumen de comportamiento del sistema',
      datos: resultado,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al generar el resumen de métricas',
      error: error.message,
    });
  }
};

module.exports = {
  registrarMetrica,
  obtenerMetricas,
  resumenMetricas,
};