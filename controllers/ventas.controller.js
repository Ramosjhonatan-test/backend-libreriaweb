//controllers/ventas.controller.js
const pool = require('../config/db');
const Venta = require('../models/Ventas');

exports.createVenta = async (req, res) => {
  const clienteId = req.body.cliente_id || null;
  const detalles = req.body.detalles || [];

  const usuarioId = req.usuario.id;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Buscar empleado vinculado al usuario
    const { rows: empleadoRows } = await client.query(
      'SELECT id FROM empleados WHERE usuario_id = $1',
      [usuarioId]
    );

    if (!empleadoRows.length) {
      throw new Error('No se encontró el empleado asociado al usuario');
    }

    const empleadoId = empleadoRows[0].id;

    // Calcular total
    const total = detalles.reduce((sum, d) => sum + (d.precio_unitario * d.cantidad), 0);

    // Insertar venta
    const queryVenta = `
      INSERT INTO ventas (cliente_id, empleado_id, total, fecha)
      VALUES ($1, $2, $3, NOW()) RETURNING *`;
    const valoresVenta = [clienteId, empleadoId, total];

    const { rows: ventaRows } = await client.query(queryVenta, valoresVenta);
    const ventaId = ventaRows[0].id;

    // Insertar detalles
    for (const detalle of detalles) {
      const queryDetalle = `
        INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario)
        VALUES ($1, $2, $3, $4)`;

      await client.query(queryDetalle, [
        ventaId,
        detalle.producto_id,
        detalle.cantidad,
        detalle.precio_unitario
      ]);
    }

    await client.query('COMMIT');
    res.status(201).json({ mensaje: 'Venta registrada correctamente', venta: ventaRows[0] });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al registrar venta:', error.message);
    res.status(500).json({ error: 'Error interno al registrar venta' });
  } finally {
    client.release();
  }
};


exports.getVentas = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM ventas ORDER BY fecha DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error al obtener ventas:', error.message);
    res.status(500).json({ error: 'Error interno al obtener ventas' });
  }
};

exports.updateVenta = async (req, res) => {
  try {
    const ventaActualizada = await Venta.updateVenta(req.params.id, req.body);
    if (!ventaActualizada) return res.status(404).json({ error: 'Venta no encontrada' });

    res.status(200).json({ mensaje: 'Venta actualizada correctamente', venta: ventaActualizada });
  } catch (error) {
    console.error('❌ Error al actualizar venta:', error.message);
    res.status(500).json({ error: 'Error interno al actualizar venta' });
  }
};

exports.deleteVenta = async (req, res) => {
  try {
    const ventaEliminada = await Venta.deleteVenta(req.params.id);
    if (!ventaEliminada) return res.status(404).json({ error: 'Venta no encontrada' });

    res.status(200).json({ mensaje: 'Venta eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar venta:', error.message);
    res.status(500).json({ error: 'Error interno al eliminar venta' });
  }
};
