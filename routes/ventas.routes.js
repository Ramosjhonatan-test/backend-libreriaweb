//routes/ventas.routes.js
const express = require('express');
const router = express.Router();
const { createVenta, getVentas, updateVenta, deleteVenta } = require('../controllers/ventas.controller');
const { verifyToken, checkRol } = require('../middlewares/auth');

router.post('/', verifyToken, checkRol(['admin', 'vendedor']), createVenta); // ✅ Solo el admin puede registrar ventas
router.get('/', verifyToken, getVentas); // 🚀 Obtener lista de ventas
router.put('/:id', verifyToken, checkRol(['admin', 'vendedor']), updateVenta); // 🚀 Editar venta
router.delete('/:id', verifyToken, checkRol(['admin', 'vendedor']), deleteVenta); // 🚀 Eliminar venta

module.exports = router;
