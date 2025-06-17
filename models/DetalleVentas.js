//models/DetalleVentas.js
const pool = require('../config/db');

class DetalleVenta {
  // 🔎 Buscar detalle de venta por ID
  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM detalle_ventas WHERE id = $1', [id]);
    return rows[0];
  }

  // ➕ Insertar nuevo detalle de venta
  static async createDetalleVenta(datos) {
    const { venta_id, producto_id, cantidad, precio_unitario } = datos;

    const query = `
      INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, creado_en)
      VALUES ($1, $2, $3, $4, NOW()) RETURNING *`;

    const valores = [venta_id, producto_id, cantidad, precio_unitario];
    const { rows } = await pool.query(query, valores);

    return rows[0];
  }

  // 🔄 Actualizar detalle de venta por ID
  static async updateDetalleVenta(id, datos) {
    const { venta_id, producto_id, cantidad, precio_unitario } = datos;

    // 🔎 Obtener detalle de venta existente para preservar valores
    const detalleExistente = await pool.query('SELECT venta_id, producto_id, cantidad, precio_unitario FROM detalle_ventas WHERE id = $1', [id]);
    if (detalleExistente.rowCount === 0) {
      return null; // 🚫 Detalle no encontrado
    }

    // 🔄 Usar los valores actuales si no se envían en el request
    const ventaIdFinal = venta_id || detalleExistente.rows[0].venta_id;
    const productoIdFinal = producto_id || detalleExistente.rows[0].producto_id;
    const cantidadFinal = cantidad !== undefined ? cantidad : detalleExistente.rows[0].cantidad;
    const precioUnitarioFinal = precio_unitario || detalleExistente.rows[0].precio_unitario;

    const query = `
      UPDATE detalle_ventas SET venta_id=$1, producto_id=$2, cantidad=$3, precio_unitario=$4, actualizado_en=NOW()
      WHERE id=$5 RETURNING *`;

    const valores = [ventaIdFinal, productoIdFinal, cantidadFinal, precioUnitarioFinal, id];
    const { rows } = await pool.query(query, valores);

    return rows[0];
  }

  // 🚀 Eliminar detalle de venta
  static async deleteDetalleVenta(id) {
    const query = 'DELETE FROM detalle_ventas WHERE id=$1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = DetalleVenta;
