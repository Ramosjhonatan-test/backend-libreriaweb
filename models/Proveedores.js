const pool = require('../config/db');

class Proveedor {
  // 🔎 Buscar proveedor por ID
  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM proveedores WHERE id = $1', [id]);
    return rows[0];
  }

  // ➕ Insertar nuevo proveedor
  static async createProveedor(datos) {
    const { nombre, contacto, telefono, email, direccion, logo_url, sitio_web, activo } = datos;

    const query = `
      INSERT INTO proveedores (nombre, contacto, telefono, email, direccion, logo_url, sitio_web, activo, creado_en)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`;

    const valores = [nombre, contacto, telefono, email, direccion, logo_url, sitio_web, activo];
    const { rows } = await pool.query(query, valores);

    return rows[0];
  }

  // 🔄 Actualizar proveedor por ID
  static async updateProveedor(id, datos) {
    const { nombre, contacto, telefono, email, direccion, logo_url, sitio_web, activo } = datos;

    const query = `
      UPDATE proveedores SET nombre=$1, contacto=$2, telefono=$3, email=$4, direccion=$5, 
      logo_url=$6, sitio_web=$7, activo=$8, actualizado_en=NOW()
      WHERE id=$9 RETURNING *`;

    const valores = [nombre, contacto, telefono, email, direccion, logo_url, sitio_web, activo, id];
    const { rows } = await pool.query(query, valores);

    return rows[0];
  }

  // 🚀 Eliminar proveedor
  static async deleteProveedor(id) {
    const query = 'DELETE FROM proveedores WHERE id=$1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Proveedor;
