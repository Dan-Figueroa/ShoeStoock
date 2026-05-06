const mongoose = require('mongoose');

const metricaSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
    },
    peticiones: {
      type: Number,
      required: true,
      min: 0,
    },
    tiempo_respuesta: {
      type: Number,
      required: true,
      min: 0,
    },
    nodos: {
      type: Number,
      required: true,
      min: 0,
    },
    registros_insertados: {
      type: Number,
      required: true,
      min: 0,
    },
    estado: {
      type: String,
      enum: ['normal', 'lento', 'saturado'],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'MetricasSistema',
  }
);

module.exports = mongoose.model('Metrica', metricaSchema);