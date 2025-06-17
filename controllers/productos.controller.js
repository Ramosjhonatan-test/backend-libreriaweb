const pool = require('../config/db');
const Producto = require('../models/Productos');

exports.createProducto = async (req, res) => {
  try {
    const nuevoProducto = await Producto.createProducto(req.body);
    res.status(201).json({ mensaje: 'Producto registrado exitosamente', producto: nuevoProducto });
  } catch (error) {
    console.error(`❌ Error al registrar producto:`, error.message);
    res.status(500).json({ error: 'Error interno al registrar producto' });
  }
};

exports.getProductos = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos ORDER BY creado_en DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Error al obtener productos:', error.message);
    res.status(500).json({ error: 'Error interno al obtener productos' });
  }
};

exports.updateProducto = async (req, res) => {
  try {
    const productoActualizado = await Producto.updateProducto(req.params.id, req.body);
    if (!productoActualizado) return res.status(404).json({ error: 'Producto no encontrado' });

    res.status(200).json({ mensaje: 'Producto actualizado correctamente', producto: productoActualizado });
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error.message);
    res.status(500).json({ error: 'Error interno al actualizar producto' });
  }
};

exports.deleteProducto = async (req, res) => {
  try {
    const productoEliminado = await Producto.deleteProducto(req.params.id);
    if (!productoEliminado) return res.status(404).json({ error: 'Producto no encontrado' });

    res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error.message);
    res.status(500).json({ error: 'Error interno al eliminar producto' });
  }
};
