//routes/detalleVentas.routes.js
const express = require('express');
const router = express.Router();
const { createDetalleVenta, getDetalleVentas, updateDetalleVenta, deleteDetalleVenta } = require('../controllers/detalleVentas.controller');
const { verifyToken, checkRol } = require('../middlewares/auth');

router.post('/', verifyToken, checkRol(['admin', 'vendedor']), createDetalleVenta); // ✅ Solo el admin puede registrar detalles de ventas
router.get('/', verifyToken, getDetalleVentas); // 🚀 Obtener lista de detalles de venta
router.put('/:id', verifyToken, checkRol(['admin', 'vendedor']), updateDetalleVenta); // 🚀 Editar detalle de venta
router.delete('/:id', verifyToken, checkRol(['admin', 'vendedor']), deleteDetalleVenta); // 🚀 Eliminar detalle de venta

module.exports = router;
