//models/ventas.js
const pool = require('../config/db');7


class Venta {
  // 🔎 Buscar venta por ID
  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM ventas WHERE id = $1', [id]);
    return rows[0];
  }

  // ➕ Insertar nueva venta
  static async createVenta(datos) {
    const { cliente_id, empleado_id, total, tipo_pago } = datos;

    const query = `
      INSERT INTO ventas (cliente_id, empleado_id, total, tipo_pago, fecha)
      VALUES ($1, $2, $3, $4, NOW()) RETURNING *`;

    const valores = [cliente_id, empleado_id, total, tipo_pago];
    const { rows } = await pool.query(query, valores);

    return rows[0];
  }

  // 🔄 Actualizar venta por ID
  static async updateVenta(id, datos) {
  const { cliente_id, empleado_id, total, tipo_pago } = datos;

  // 🔎 Obtener la venta existente para preservar valores
  const ventaExistente = await pool.query('SELECT cliente_id, empleado_id FROM ventas WHERE id = $1', [id]);
  if (ventaExistente.rowCount === 0) {
    return null; // 🚫 Venta no encontrada
  }

  // 🔄 Usar los valores actuales si no se envían en el request
  const clienteIdFinal = cliente_id || ventaExistente.rows[0].cliente_id;
  const empleadoIdFinal = empleado_id || ventaExistente.rows[0].empleado_id;

  const query = `
    UPDATE ventas SET cliente_id=$1, empleado_id=$2, total=$3, tipo_pago=$4, fecha=NOW()
    WHERE id=$5 RETURNING *`;

  const valores = [clienteIdFinal, empleadoIdFinal, total, tipo_pago, id];
  const { rows } = await pool.query(query, valores);

  return rows[0];
}


  // 🚀 Eliminar venta
  static async deleteVenta(id) {
    const query = 'DELETE FROM ventas WHERE id=$1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Venta;
