const express = require('express');
const router = express.Router();
const { createProducto, getProductos, updateProducto, deleteProducto } = require('../controllers/productos.controller');
const { verifyToken, checkRol } = require('../middlewares/auth');

router.post('/', verifyToken, checkRol('admin'), createProducto); // ✅ Solo el admin puede registrar productos
router.get('/', verifyToken, getProductos); // 🚀 Obtener lista de productos
router.put('/:id', verifyToken, checkRol('admin'), updateProducto); // 🚀 Editar producto
router.delete('/:id', verifyToken, checkRol('admin'), deleteProducto); // 🚀 Eliminar producto

module.exports = router;
