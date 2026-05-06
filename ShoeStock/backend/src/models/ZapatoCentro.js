const mongoose = require('mongoose');

const zapatoSucursalSchema = new mongoose.Schema(
  {
    nombre: String,
    tipo: String,
    marca: String,
    material: String,
    talla: String,
    color: String,
    precio: Number,
    stock: Number,
    sede: String,
    estado: String,
  },
  {
    collection: 'Zapatos_Centro',
  }
);

module.exports = mongoose.model('ZapatoCentro', zapatoSucursalSchema);