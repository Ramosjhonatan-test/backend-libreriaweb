const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class Usuario {
  // Registrar nuevo usuario
static async create({ nombre, rol, password }) {
  if (!password) throw new Error('Falta la contraseña');
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO usuarios (nombre, rol, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, nombre, rol, bloqueado, intentos_login
  `;
  const valores = [nombre, rol, hashedPassword];
  const { rows } = await pool.query(query, valores);
  return rows[0];
}


  // Buscar usuario por ID
  static async findById(id) {
    const query = 'SELECT * FROM usuarios WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  // Buscar usuario por nombre
  static async findByNombre(nombre) {
    console.log(`🔍 Buscando usuario con nombre: "${nombre}"`);
    const query = 'SELECT * FROM usuarios WHERE nombre = $1';
    const { rows } = await pool.query(query, [nombre]);
    console.log(`✅ Usuario encontrado en BD:`, rows[0]);
    return rows[0];
  }

  // Obtener todos los usuarios
  static async findAll() {
    const query = `
      SELECT *
      FROM usuarios
      ORDER BY id ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  // Actualizar usuario (campos dinámicos)
static async actualizar(id, cambios) {
  const campos = [];
  const valores = [];
  let contador = 1;

  for (const clave in cambios) {
    campos.push(`${clave} = $${contador}`);
    valores.push(cambios[clave]);
    contador++;
  }

  if (campos.length === 0) return null;

  const query = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = $${contador} RETURNING *`;
  valores.push(id);

  const { rows } = await pool.query(query, valores);
  return rows[0]; // devuelve null si el usuario no existe
}


  // Eliminar usuario
static async eliminar(id) {
  const { rows } = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
  return rows[0]; // Devuelve null si no existe
}


  // Actualizar contraseña
  static async actualizarPassword(id, nuevaHash) {
    await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [nuevaHash, id]);
  }

  // Cambiar estado de bloqueo
  static async cambiarBloqueo(id, estado) {
    await pool.query('UPDATE usuarios SET bloqueado = $1 WHERE id = $2', [estado, id]);
  }

  // Aumentar intentos de login
  static async incrementarIntento(id) {
    await pool.query('UPDATE usuarios SET intentos_login = intentos_login + 1 WHERE id = $1', [id]);
  }

  // Reiniciar intentos fallidos
  static async reiniciarIntentos(id) {
    await pool.query('UPDATE usuarios SET intentos_login = 0 WHERE id = $1', [id]);
  }

  // Bloquear manualmente (si decides activarlo por intentos)
  static async bloquearUsuario(id) {
    await pool.query('UPDATE usuarios SET bloqueado = true WHERE id = $1', [id]);
  }
}

module.exports = Usuario;
