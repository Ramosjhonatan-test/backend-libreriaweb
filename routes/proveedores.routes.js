const express = require('express');
const router = express.Router();
const { createProveedor, getProveedores, updateProveedor, deleteProveedor } = require('../controllers/proveedores.controller');
const { verifyToken, checkRol } = require('../middlewares/auth');

router.post('/', verifyToken, checkRol('admin'), createProveedor); // ✅ Solo el admin puede registrar proveedores
router.get('/', verifyToken, getProveedores); // 🚀 Obtener lista de proveedores
router.put('/:id', verifyToken, checkRol('admin'), updateProveedor); // 🚀 Editar proveedor
router.delete('/:id', verifyToken, checkRol('admin'), deleteProveedor); // 🚀 Eliminar proveedor

module.exports = router;
