const Venta = require('../models/Venta');
const Zapato = require('../models/Zapato');

// Registrar una nueva venta
const registrarVenta = async (req, res) => {
  try {
    const { productoId, cantidad, sucursal } = req.body;

    if (!productoId || !cantidad || !sucursal) {
      return res.status(400).json({
        mensaje: 'Producto, cantidad y sucursal son obligatorios',
      });
    }

    const cantidadVendida = Number(cantidad);

    if (cantidadVendida <= 0) {
      return res.status(400).json({
        mensaje: 'La cantidad debe ser mayor a cero',
      });
    }

    const zapato = await Zapato.findById(productoId);

    if (!zapato) {
      return res.status(404).json({
        mensaje: 'Producto no encontrado',
      });
    }

    let stockSucursalDisponible = 0;
    let sucursalEncontrada = null;

    if (Array.isArray(zapato.sucursales)) {
      sucursalEncontrada = zapato.sucursales.find(
        (item) => item.nombre === sucursal
      );

      if (sucursalEncontrada) {
        stockSucursalDisponible = Number(sucursalEncontrada.stock || 0);
      }
    }

    if (sucursal !== 'General' && !sucursalEncontrada) {
      return res.status(400).json({
        mensaje: `El producto no tiene stock registrado en la sucursal ${sucursal}`,
      });
    }

    if (sucursal !== 'General' && stockSucursalDisponible < cantidadVendida) {
      return res.status(400).json({
        mensaje: `Stock insuficiente en la sucursal ${sucursal}`,
        stockDisponible: stockSucursalDisponible,
      });
    }

    if (Number(zapato.stock || 0) < cantidadVendida) {
      return res.status(400).json({
        mensaje: 'Stock general insuficiente para realizar la venta',
        stockDisponible: zapato.stock,
      });
    }

    const totalVenta = cantidadVendida * Number(zapato.precio);

    const nuevaVenta = new Venta({
      productoId: zapato._id,
      nombreProducto: zapato.nombre,
      tipo: zapato.tipo,
      marca: zapato.marca,
      cantidad: cantidadVendida,
      precioUnitario: Number(zapato.precio),
      total: totalVenta,
      sucursal,
      estado: 'Completada',
    });

    const ventaGuardada = await nuevaVenta.save();

    // Descontar stock general
    zapato.stock = Number(zapato.stock || 0) - cantidadVendida;

    // Descontar stock específico de la sucursal
    if (sucursal !== 'General' && sucursalEncontrada) {
      sucursalEncontrada.stock = Number(sucursalEncontrada.stock || 0) - cantidadVendida;
    }

    // Calcular estado automático del producto
    if (zapato.stock <= 0) {
      zapato.estado = 'Agotado';
    } else if (zapato.stock <= 5) {
      zapato.estado = 'Inventario bajo';
    } else {
      zapato.estado = 'Disponible';
    }

    await zapato.save();

    res.status(201).json({
      mensaje: 'Venta registrada correctamente',
      venta: ventaGuardada,
      productoActualizado: zapato,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al registrar la venta',
      error: error.message,
    });
  }
};

// Obtener todas las ventas
const obtenerVentas = async (req, res) => {
  try {
    const ventas = await Venta.find().sort({ createdAt: -1 });

    res.json({
      total: ventas.length,
      datos: ventas,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener las ventas',
      error: error.message,
    });
  }
};

// Obtener resumen de ventas
const obtenerResumenVentas = async (req, res) => {
  try {
    const resumen = await Venta.aggregate([
      {
        $group: {
          _id: null,
          totalVentas: { $sum: 1 },
          productosVendidos: { $sum: '$cantidad' },
          ingresosTotales: { $sum: '$total' },
        },
      },
    ]);

    const ventasPorSucursal = await Venta.aggregate([
      {
        $group: {
          _id: '$sucursal',
          totalVentas: { $sum: 1 },
          productosVendidos: { $sum: '$cantidad' },
          ingresos: { $sum: '$total' },
        },
      },
      {
        $sort: { ingresos: -1 },
      },
    ]);

    const productosMasVendidos = await Venta.aggregate([
      {
        $group: {
          _id: '$nombreProducto',
          cantidadVendida: { $sum: '$cantidad' },
          ingresos: { $sum: '$total' },
        },
      },
      {
        $sort: { cantidadVendida: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    res.json({
      resumenGeneral: resumen[0] || {
        totalVentas: 0,
        productosVendidos: 0,
        ingresosTotales: 0,
      },
      ventasPorSucursal,
      productosMasVendidos,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener el resumen de ventas',
      error: error.message,
    });
  }
};

module.exports = {
  registrarVenta,
  obtenerVentas,
  obtenerResumenVentas,
};