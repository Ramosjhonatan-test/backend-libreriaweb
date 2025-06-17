//modelos/dashboard.js
const db = require('../config/db'); // ajustalo según tu conexión

async function obtenerKPIs() {
  const ventasDia = await db.query(`
    SELECT COALESCE(SUM(total), 0) AS total
    FROM ventas
    WHERE DATE(fecha) = CURRENT_DATE
  `);

  const totalMes = await db.query(`
    SELECT COALESCE(SUM(total), 0) AS total
    FROM ventas
    WHERE EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
  `);

  const topProducto = await db.query(`
    SELECT p.nombre, SUM(dv.cantidad) AS total_vendida
    FROM detalle_ventas dv
    JOIN productos p ON p.id = dv.producto_id
    GROUP BY p.nombre
    ORDER BY total_vendida DESC
    LIMIT 1
  `);
  // anadido recientemente
  const productosStock = await db.query(`SELECT COUNT(*) FROM productos WHERE stock > 0`);

    const clientesFrecuentes = await db.query(`
    SELECT c.nombre, COUNT(*) AS total_compras
    FROM ventas v
    JOIN clientes c ON c.id = v.cliente_id
    GROUP BY c.nombre
    ORDER BY total_compras DESC
    LIMIT 3
  `);

    const ventasPorDia = await db.query(`
    SELECT TO_CHAR(fecha, 'DD/MM') AS dia, SUM(total) AS total
    FROM ventas
    WHERE EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
    GROUP BY dia
    ORDER BY MIN(fecha)
  `);

const rankingUsuarios = await db.query(`
  SELECT u.nombre, COUNT(*) AS ventas_realizadas
  FROM ventas v
  JOIN empleados e ON e.id = v.empleado_id
  JOIN usuarios u ON u.id = e.usuario_id
  WHERE EXTRACT(MONTH FROM v.fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM v.fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
  GROUP BY u.nombre
  ORDER BY ventas_realizadas DESC
  LIMIT 5
`);

const productosRecientes = await db.query(`
  SELECT nombre, stock, creado_en AS fecha_ingreso
  FROM productos
  ORDER BY creado_en DESC
  LIMIT 5
`);

const rankingEmpleados = await db.query(`
  SELECT e.nombre_completo, COUNT(*) AS ventas_realizadas
  FROM ventas v
  JOIN empleados e ON e.id = v.empleado_id
  WHERE EXTRACT(MONTH FROM v.fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM v.fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
  GROUP BY e.nombre_completo
  ORDER BY ventas_realizadas DESC
  LIMIT 5
`);

const productosBajoStock = await db.query(`
  SELECT nombre, stock
  FROM productos
  WHERE stock < 100
  ORDER BY stock ASC
  LIMIT 10
`);


  return {
    ventasDia: parseFloat(ventasDia.rows[0].total),
    totalMes: parseFloat(totalMes.rows[0].total),
    topProducto: topProducto.rows[0] || { nombre: 'N/A', total_vendida: 0 },
    productosEnStock: parseInt(productosStock.rows[0].count),
    clientesFrecuentes: clientesFrecuentes.rows,
    graficoVentasMes: ventasPorDia.rows,
    rankingUsuarios: rankingUsuarios.rows,
    productosRecientes: productosRecientes.rows,
    rankingEmpleados: rankingEmpleados.rows,
    productosBajoStock: productosBajoStock.rows,

  };
}

module.exports = { obtenerKPIs };
