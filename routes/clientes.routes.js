//routes/clientes.routes.js
const express = require('express');
const router = express.Router();
const { createCliente, getClientes, updateCliente, deleteCliente } = require('../controllers/clientes.controller');
const { verifyToken, checkRol } = require('../middlewares/auth');

// Registrar cliente: Ahora admin Y vendedor pueden
router.post('/', verifyToken, checkRol(['admin', 'vendedor']), createCliente);

// Obtener lista de clientes: Ambos roles pueden ver
router.get('/', verifyToken, checkRol(['admin', 'vendedor']), getClientes);

// Editar cliente: Ambos roles pueden editar (si es lo que quieres)
router.put('/:id', verifyToken, checkRol(['admin', 'vendedor']), updateCliente);

// Eliminar cliente: Generalmente solo admin, pero puedes ajustar
router.delete('/:id', verifyToken, checkRol(['admin']), deleteCliente); // Ejemplo: solo admin
// Si quisieras que vendedor también elimine: router.delete('/:id', verifyToken, checkRol(['admin', 'vendedor']), deleteCliente);

module.exports = router;