const mongoose = require('mongoose');

const zapatoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    tipo: {
      type: String,
      required: true,
      trim: true,
    },
    marca: {
      type: String,
      required: true,
      trim: true,
    },
    material: {
      type: String,
      trim: true,
      default: '',
    },
    talla: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    sede: {
      type: String,
      trim: true,
      default: 'General',
    },
    estado: {
      type: String,
      trim: true,
      default: 'Disponible',
    },
    sucursales: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'Zapatos',
  }
);

module.exports = mongoose.model('Zapato', zapatoSchema);