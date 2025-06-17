//routes/empleados.routes.js
const express = require('express');
const router = express.Router();
const { createEmpleado, asignarUsuario, getEmpleados, updateEmpleado, deleteEmpleado } = require('../controllers/empleados.controller');

const { verifyToken, checkRol } = require('../middlewares/auth');

router.post('/', verifyToken, checkRol('admin'), createEmpleado); // ✅ Solo el admin puede registrar empleados
router.patch('/:id/asignar-usuario', verifyToken, checkRol('admin'), asignarUsuario);
router.get('/', verifyToken, getEmpleados); // 🚀 Obtener lista de empleados
router.put('/:id', verifyToken, checkRol('admin'), updateEmpleado); // 🚀 Editar empleado
router.delete('/:id', verifyToken, checkRol('admin'), deleteEmpleado); // 🚀 Eliminar empleado

module.exports = router;
