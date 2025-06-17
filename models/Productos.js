const pool = require('../config/db');

class Producto {
  // 🔎 Buscar producto por ID
  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    return rows[0];
  }

  // ➕ Insertar nuevo producto
  static async createProducto(datos) {
    const { nombre, tipo, precio, stock, codigo_barras, descripcion, imagen_url, proveedor_id } = datos;

    const query = `
      INSERT INTO productos (nombre, tipo, precio, stock, codigo_barras, descripcion, imagen_url, proveedor_id, creado_en)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`;

    const valores = [nombre, tipo, precio, stock, codigo_barras, descripcion, imagen_url, proveedor_id];
    const { rows } = await pool.query(query, valores);

    return rows[0];
  }

  // 🔄 Actualizar producto por ID
static async updateProducto(id, datos) {
  const { nombre, tipo, precio, stock, codigo_barras, descripcion, imagen_url, proveedor_id } = datos;

  // 🔎 Obtener producto existente para preservar valores
  const productoExistente = await pool.query('SELECT nombre, tipo, precio, stock, codigo_barras, descripcion, imagen_url, proveedor_id FROM productos WHERE id = $1', [id]);
  if (productoExistente.rowCount === 0) {
    return null; // 🚫 Producto no encontrado
  }

  // 🔄 Usar los valores actuales si no se envían en el request
  const nombreFinal = nombre || productoExistente.rows[0].nombre;
  const tipoFinal = tipo || productoExistente.rows[0].tipo;
  const precioFinal = precio || productoExistente.rows[0].precio;
  const stockFinal = stock !== undefined ? stock : productoExistente.rows[0].stock;
  const codigoBarrasFinal = codigo_barras || productoExistente.rows[0].codigo_barras;
  const descripcionFinal = descripcion || productoExistente.rows[0].descripcion;
  const imagenUrlFinal = imagen_url || productoExistente.rows[0].imagen_url;
  const proveedorIdFinal = proveedor_id || productoExistente.rows[0].proveedor_id;

  const query = `
    UPDATE productos SET nombre=$1, tipo=$2, precio=$3, stock=$4, codigo_barras=$5, 
    descripcion=$6, imagen_url=$7, proveedor_id=$8, actualizado_en=NOW()
    WHERE id=$9 RETURNING *`;

  const valores = [nombreFinal, tipoFinal, precioFinal, stockFinal, codigoBarrasFinal, descripcionFinal, imagenUrlFinal, proveedorIdFinal, id];
  const { rows } = await pool.query(query, valores);

  return rows[0];
}


  // 🚀 Eliminar producto
  static async deleteProducto(id) {
    const query = 'DELETE FROM productos WHERE id=$1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Producto;
