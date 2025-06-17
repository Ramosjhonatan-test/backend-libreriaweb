//controllers/clientes.controller.js
const pool = require('../config/db');
const Cliente = require('../models/Clientes');

exports.createCliente = async (req, res) => {
  try {
    const nuevoCliente = await Cliente.createCliente(req.body);
    res.status(201).json({ mensaje: 'Cliente registrado exitosamente', cliente: nuevoCliente });
  } catch (error) {
    console.error(`❌ Error al registrar cliente:`, error.message);
    res.status(500).json({ error: 'Error interno al registrar cliente' });
  }
};

exports.getClientes = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clientes ORDER BY creado_en DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error al obtener clientes:', error.message);
    res.status(500).json({ error: 'Error interno al obtener clientes' });
  }
};

exports.updateCliente = async (req, res) => {
  try {
    const clienteActualizado = await Cliente.updateCliente(req.params.id, req.body);
    if (!clienteActualizado) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.status(200).json({ mensaje: 'Cliente actualizado correctamente', cliente: clienteActualizado });
  } catch (error) {
    console.error('❌ Error al actualizar cliente:', error.message);
    res.status(500).json({ error: 'Error interno al actualizar cliente' });
  }
};

exports.deleteCliente = async (req, res) => {
  try {
    const clienteEliminado = await Cliente.deleteCliente(req.params.id);
    if (!clienteEliminado) return res.status(404).json({ error: 'Cliente no encontrado' });

    res.status(200).json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar cliente:', error.message);
    res.status(500).json({ error: 'Error interno al eliminar cliente' });
  }
};
