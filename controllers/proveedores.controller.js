const pool = require('../config/db');
const Proveedor = require('../models/Proveedores');

exports.createProveedor = async (req, res) => {
  try {
    const nuevoProveedor = await Proveedor.createProveedor(req.body);
    res.status(201).json({ mensaje: 'Proveedor registrado exitosamente', proveedor: nuevoProveedor });
  } catch (error) {
    console.error(`❌ Error al registrar proveedor:`, error.message);
    res.status(500).json({ error: 'Error interno al registrar proveedor' });
  }
};

exports.getProveedores = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM proveedores ORDER BY creado_en DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error al obtener proveedores:', error.message);
    res.status(500).json({ error: 'Error interno al obtener proveedores' });
  }
};

exports.updateProveedor = async (req, res) => {
  try {
    const proveedorActualizado = await Proveedor.updateProveedor(req.params.id, req.body);
    if (!proveedorActualizado) return res.status(404).json({ error: 'Proveedor no encontrado' });

    res.status(200).json({ mensaje: 'Proveedor actualizado correctamente', proveedor: proveedorActualizado });
  } catch (error) {
    console.error('❌ Error al actualizar proveedor:', error.message);
    res.status(500).json({ error: 'Error interno al actualizar proveedor' });
  }
};

exports.deleteProveedor = async (req, res) => {
  try {
    const proveedorEliminado = await Proveedor.deleteProveedor(req.params.id);
    if (!proveedorEliminado) return res.status(404).json({ error: 'Proveedor no encontrado' });

    res.status(200).json({ mensaje: 'Proveedor eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar proveedor:', error.message);
    res.status(500).json({ error: 'Error interno al eliminar proveedor' });
  }
};
