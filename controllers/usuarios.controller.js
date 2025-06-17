const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🔐 Login
exports.login = async (req, res) => {
  const { nombre, password } = req.body;

  try {
    const usuario = await Usuario.findByNombre(nombre);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (usuario.bloqueado) return res.status(403).json({ error: 'Usuario bloqueado' });

    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) {
      await Usuario.incrementarIntento(usuario.id);
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    await Usuario.reiniciarIntentos(usuario.id);
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol , nombre: usuario.nombre },
      process.env.JWT_SECRET || 'secreto123',
      { expiresIn: '2h' }
    );

    res.status(200).json({ token, rol: usuario.rol, id_usuario: usuario.id });
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    res.status(500).json({ error: 'Error interno en login' });
  }
};

// ➕ Registrar nuevo usuario
exports.registrarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.create(req.body);
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuario });
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error.message);
    res.status(500).json({ error: 'Error interno al registrar usuario' });
  }
};

// 📄 Obtener todos los usuarios
exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error.message);
    res.status(500).json({ error: 'Error interno al obtener usuarios' });
  }
};

// ✏️ Actualizar usuario
exports.updateUsuario = async (req, res) => {
  try {
    const actualizado = await Usuario.actualizar(req.params.id, req.body);
    if (!actualizado) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.status(200).json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error.message);
    res.status(500).json({ error: 'Error interno al actualizar usuario' });
  }
};

// ❌ Eliminar usuario
exports.deleteUsuario = async (req, res) => {
  try {
    const eliminado = await Usuario.eliminar(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error.message);
    res.status(500).json({ error: 'Error interno al eliminar usuario' });
  }
};

// 🔁 Resetear contraseña
exports.resetearPassword = async (req, res) => {
  const { nuevaPassword } = req.body;
  try {
    const hash = await bcrypt.hash(nuevaPassword, 10);
    await Usuario.actualizarPassword(req.params.id, hash);
    res.status(200).json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error al resetear contraseña:', error.message);
    res.status(500).json({ error: 'Error interno al resetear contraseña' });
  }
};

// 🔐 Cambiar bloqueo
exports.cambiarBloqueo = async (req, res) => {
  const { bloqueado } = req.body;
  try {
    await Usuario.cambiarBloqueo(req.params.id, bloqueado);
    res.status(200).json({ mensaje: `Usuario ${bloqueado ? 'bloqueado' : 'desbloqueado'} correctamente` });
  } catch (error) {
    console.error('❌ Error al cambiar estado de bloqueo:', error.message);
    res.status(500).json({ error: 'Error interno al bloquear usuario' });
  }
};
