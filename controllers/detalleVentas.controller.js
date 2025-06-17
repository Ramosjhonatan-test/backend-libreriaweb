//controllers/detalleVentas.controller.js
const pool = require('../config/db');
const DetalleVenta = require('../models/DetalleVentas');

exports.createDetalleVenta = async (req, res) => {
  try {
    const nuevoDetalle = await DetalleVenta.createDetalleVenta(req.body);
    res.status(201).json({ mensaje: 'Detalle de venta registrado exitosamente', detalle: nuevoDetalle });
  } catch (error) {
    console.error(`❌ Error al registrar detalle de venta:`, error.message);
    res.status(500).json({ error: 'Error interno al registrar detalle de venta' });
  }
};

exports.getDetalleVentas = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM detalle_ventas ORDER BY creado_en DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error al obtener detalles de venta:', error.message);
    res.status(500).json({ error: 'Error interno al obtener detalles de venta' });
  }
};

exports.updateDetalleVenta = async (req, res) => {
  try {
    const detalleActualizado = await DetalleVenta.updateDetalleVenta(req.params.id, req.body);
    if (!detalleActualizado) return res.status(404).json({ error: 'Detalle de venta no encontrado' });

    res.status(200).json({ mensaje: 'Detalle de venta actualizado correctamente', detalle: detalleActualizado });
  } catch (error) {
    console.error('❌ Error al actualizar detalle de venta:', error.message);
    res.status(500).json({ error: 'Error interno al actualizar detalle de venta' });
  }
};

exports.deleteDetalleVenta = async (req, res) => {
  try {
    const detalleEliminado = await DetalleVenta.deleteDetalleVenta(req.params.id);
    if (!detalleEliminado) return res.status(404).json({ error: 'Detalle de venta no encontrado' });

    res.status(200).json({ mensaje: 'Detalle de venta eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar detalle de venta:', error.message);
    res.status(500).json({ error: 'Error interno al eliminar detalle de venta' });
  }
};
