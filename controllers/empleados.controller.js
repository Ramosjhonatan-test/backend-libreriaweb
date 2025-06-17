const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// ➕ Registrar nuevo empleado con usuario_id opcional
exports.createEmpleado = async (req, res) => {
  const {
    nombre_completo,
    ci,
    telefono,
    email,
    direccion,
    foto_url,
    fecha_contratacion,
    puesto,
    usuario_id // ← nuevo campo
  } = req.body;

  try {
    const query = `
      INSERT INTO empleados (
        nombre_completo, ci, telefono, email, direccion, foto_url,
        fecha_contratacion, puesto, usuario_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;

    const valores = [
      nombre_completo, ci, telefono, email, direccion,
      foto_url, fecha_contratacion, puesto, usuario_id
    ];

    const { rows } = await pool.query(query, valores);
    res.status(201).json({ mensaje: 'Empleado registrado exitosamente', empleado: rows[0] });
  } catch (error) {
    console.error(`❌ Error al registrar empleado:`, error.message);
    res.status(500).json({ error: 'Error interno al registrar empleado' });
  }
};


// 🔐 Asignar usuario a empleado existente
exports.asignarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, password } = req.body;

  try {
    // 1. Validar existencia del empleado
    console.log('🔍 Buscando empleado con ID:', id, 'Tipo:', typeof id);
    //const empleadoExistente = await pool.query('SELECT * FROM empleados WHERE id = $1', [id]);
    const { rows: empleadoRows } = await pool.query('SELECT * FROM empleados WHERE id = $1', [id]);
    const empleado = empleadoRows[0];
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // 2. Verificar si ya tiene usuario asignado
    if (empleado.usuario_id) {
      return res.status(409).json({ error: 'Este empleado ya tiene un usuario asignado' });
    }

    // 3. Verificar que el nombre de usuario sea único
    const { rowCount: usuarioExistente } = await pool.query('SELECT 1 FROM usuarios WHERE nombre = $1', [nombre]);
    if (usuarioExistente > 0) {
      return res.status(400).json({ error: 'Ese nombre de usuario ya está en uso' });
    }

    // 4. Crear usuario con contraseña hasheada
    const password_hash = await bcrypt.hash(password, 10);
    const rolAsignado = 'vendedor'; // o según la lógica de negocio

    const { rows: usuarioRows } = await pool.query(
      `INSERT INTO usuarios (nombre, password_hash, rol)
       VALUES ($1, $2, $3) RETURNING *`,
      [nombre, password_hash, rolAsignado]
    );

    const usuarioCreado = usuarioRows[0];

    // 5. Asociar usuario recién creado al empleado
    await pool.query(
      'UPDATE empleados SET usuario_id = $1, actualizado_en = NOW() WHERE id = $2',
      [usuarioCreado.id, id]
    );

    // 6. Obtener empleado actualizado
    const { rows: empleadoActualizado } = await pool.query('SELECT * FROM empleados WHERE id = $1', [id]);

    // 7. Respuesta completa
    res.status(201).json({

      mensaje: 'Usuario creado y asignado correctamente',
      usuario: usuarioCreado,
      empleado: empleadoActualizado[0]
    });

  } catch (error) {
    console.error('❌ Error al asignar usuario:', error.message);
    res.status(500).json({ error: 'Error interno al asignar usuario' });
  }
};


// 🚀 Obtener lista de empleados con nombre de usuario
exports.getEmpleados = async (req, res) => {
  try {
    const query = `
      SELECT 
        e.*, 
        u.nombre AS nombre_usuario
      FROM empleados e
      LEFT JOIN usuarios u ON e.usuario_id = u.id
      ORDER BY e.creado_en DESC`;

    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error al obtener empleados:', error.message);
    res.status(500).json({ error: 'Error interno al obtener empleados' });
  }
};


exports.updateEmpleado = async (req, res) => {
  const { id } = req.params;
  const {
    nombre_completo, ci, telefono, email,
    direccion, foto_url, fecha_contratacion, puesto, usuario_id
  } = req.body;

  try {
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
    res.status(200).json({ mensaje: 'Empleado actualizado correctamente', empleado: rows[0] });
  } catch (error) {
    console.error('❌ Error al actualizar empleado:', error.message);
    res.status(500).json({ error: 'Error interno al actualizar empleado' });
  }
};

exports.deleteEmpleado = async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM empleados WHERE id=$1 RETURNING *';
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    res.status(200).json({ mensaje: 'Empleado eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar empleado:', error.message);
    res.status(500).json({ error: 'Error interno al eliminar empleado' });
  }
};
