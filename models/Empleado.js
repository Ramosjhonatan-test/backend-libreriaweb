const pool = require('../config/db');

class Empleado {
  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM empleados WHERE id = $1', [id]);
    return rows[0];
  }

  static async createEmpleado(datos) {
    const {
      nombre_completo, ci, telefono, email,
      direccion, foto_url, fecha_contratacion, puesto,
      usuario_id
    } = datos;

    const query = `
      INSERT INTO empleados (
        nombre_completo, ci, telefono, email, direccion,
        foto_url, fecha_contratacion, puesto, usuario_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`;

    const valores = [
      nombre_completo, ci, telefono, email,
      direccion, foto_url, fecha_contratacion, puesto,
      usuario_id
    ];

    const { rows } = await pool.query(query, valores);
    return rows[0];
  }

  static async updateEmpleado(id, datos) {
    const {
      nombre_completo, ci, telefono, email,
      direccion, foto_url, fecha_contratacion, puesto,
      usuario_id
    } = datos;

    const query = `
      UPDATE empleados SET
        nombre_completo=$1, ci=$2, telefono=$3, email=$4,
        direccion=$5, foto_url=$6, fecha_contratacion=$7,
        puesto=$8, usuario_id=$9, actualizado_en=NOW()
      WHERE id=$10 RETURNING *`;

    const valores = [
      nombre_completo, ci, telefono, email,
      direccion, foto_url, fecha_contratacion, puesto,
      usuario_id, id
    ];

    const { rows } = await pool.query(query, valores);
    return rows[0];
  }
}

module.exports = Empleado;
