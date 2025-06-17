//models/Clientes.js
const pool = require('../config/db');
class Cliente {
  // 🔎 Buscar cliente por ID
  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
    return rows[0];
  }

  // ➕ Insertar nuevo cliente
  static async createCliente(datos) {
    const { nombre, telefono, email } = datos;

    const query = `
      INSERT INTO clientes (nombre, telefono, email, creado_en)
      VALUES ($1, $2, $3, NOW()) RETURNING *`;

    const valores = [nombre, telefono, email];
    const { rows } = await pool.query(query, valores);

    return rows[0];
  }

  // 🔄 Actualizar cliente por ID
static async updateCliente(id, datos) {
  const { nombre, telefono, email } = datos;

  // 🔎 Obtener cliente existente para preservar valores
  const clienteExistente = await pool.query('SELECT nombre, telefono, email FROM clientes WHERE id = $1', [id]);
  if (clienteExistente.rowCount === 0) {
    return null; // 🚫 Cliente no encontrado
  }

  // 🔄 Usar los valores actuales si no se envían en el request
  const nombreFinal = nombre || clienteExistente.rows[0].nombre;
  const telefonoFinal = telefono || clienteExistente.rows[0].telefono;
  const emailFinal = email || clienteExistente.rows[0].email;

  const query = `
    UPDATE clientes SET nombre=$1, telefono=$2, email=$3, actualizado_en=NOW()
    WHERE id=$4 RETURNING *`;

  const valores = [nombreFinal, telefonoFinal, emailFinal, id];
  const { rows } = await pool.query(query, valores);

  return rows[0];
}


  // 🚀 Eliminar cliente
  static async deleteCliente(id) {
    const query = 'DELETE FROM clientes WHERE id=$1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Cliente;
