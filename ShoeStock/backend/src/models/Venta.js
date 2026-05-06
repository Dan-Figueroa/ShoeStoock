const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema(
  {
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zapato',
      required: true,
    },

    nombreProducto: {
      type: String,
      required: true,
    },

    tipo: {
      type: String,
      required: true,
    },

    marca: {
      type: String,
      required: true,
    },

    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },

    precioUnitario: {
      type: Number,
      required: true,
    },

    total: {
      type: Number,
      required: true,
    },

    sucursal: {
      type: String,
      enum: ['Centro', 'Norte', 'Sur', 'General'],
      default: 'General',
    },

    estado: {
      type: String,
      enum: ['Completada', 'Cancelada'],
      default: 'Completada',
    },

    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Venta', ventaSchema);