const express = require('express');
const router = express.Router();
const {
  login,
  registrarUsuario,
  getUsuarios,
  updateUsuario,
  deleteUsuario,
  resetearPassword,
  cambiarBloqueo
} = require('../controllers/usuarios.controller');
const { verifyToken, checkRol } = require('../middlewares/auth');

// Login (sin protección)
router.post('/login', login);

// Registro: solo admin
router.post('/register', verifyToken, checkRol(['admin']), registrarUsuario);

// Obtener todos: admin
router.get('/', verifyToken, checkRol(['admin']), getUsuarios);

// Editar usuario: admin
router.put('/:id', verifyToken, checkRol(['admin']), updateUsuario);

// Eliminar: solo admin
router.delete('/:id', verifyToken, checkRol(['admin']), deleteUsuario);

// Resetear contraseña
router.patch('/:id/reset-password', verifyToken, checkRol(['admin']), resetearPassword);

// Bloqueo/desbloqueo
router.patch('/:id/bloqueo', verifyToken, checkRol(['admin']), cambiarBloqueo);

module.exports = router;
