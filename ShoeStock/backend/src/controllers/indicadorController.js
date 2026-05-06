const Zapato = require('../models/Zapato');

const productosPorTipo = async (req, res) => {
  try {
    const resultado = await Zapato.aggregate([
      {
        $group: {
          _id: '$tipo',
          total_productos: { $sum: 1 },
          stock_total: { $sum: '$stock' },
        },
      },
      {
        $sort: { total_productos: -1 },
      },
    ]);

    res.json({
      indicador: 'Productos por tipo de calzado',
      total_grupos: resultado.length,
      datos: resultado,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al generar el indicador de productos por tipo',
      error: error.message,
    });
  }
};

const stockPorSucursal = async (req, res) => {
  try {
    const resultado = await Zapato.aggregate([
      {
        $unwind: '$sucursales',
      },
      {
        $group: {
          _id: '$sucursales.nombre',
          stock_total: { $sum: '$sucursales.stock' },
        },
      },
      {
        $sort: { stock_total: -1 },
      },
    ]);

    res.json({
      indicador: 'Stock total por sucursal',
      total_sucursales: resultado.length,
      datos: resultado,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al generar el indicador de stock por sucursal',
      error: error.message,
    });
  }
};

const precioPromedioPorMarca = async (req, res) => {
  try {
    const resultado = await Zapato.aggregate([
      {
        $group: {
          _id: '$marca',
          precio_promedio: { $avg: '$precio' },
          total_productos: { $sum: 1 },
        },
      },
      {
        $sort: { precio_promedio: -1 },
      },
    ]);

    res.json({
      indicador: 'Precio promedio por marca',
      total_marcas: resultado.length,
      datos: resultado,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al generar el indicador de precio promedio por marca',
      error: error.message,
    });
  }
};

const inventarioBajo = async (req, res) => {
  try {
    const productos = await Zapato.find({ stock: { $lte: 5 } }).sort({ stock: 1 });

    res.json({
      indicador: 'Productos con inventario bajo',
      criterio: 'stock menor o igual a 5',
      total: productos.length,
      datos: productos,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al consultar inventario bajo',
      error: error.message,
    });
  }
};

module.exports = {
  productosPorTipo,
  stockPorSucursal,
  precioPromedioPorMarca,
  inventarioBajo,
};