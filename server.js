require('dotenv').config(); // 🔹 Cargar variables de entorno al inicio
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const usuariosRoutes = require('./routes/usuarios.routes');
const empleadosRoutes = require('./routes/empleados.routes');
const productosRoutes = require('./routes/productos.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const clientesRoutes = require('./routes/clientes.routes');
const ventasRoutes = require('./routes/ventas.routes');
const detalleVentasRoutes = require('./routes/detalleVentas.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const pool = require('./config/db');
const app = express();

// 📌 Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); // ✅ Aumenta el límite a 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // ✅ Aplica a formularios
app.use(morgan('dev')); // 🔹 Registra cada solicitud en la consola

// 📌 Verificación de conexión a la BD antes de iniciar el servidor
pool.connect()
  .then(() => {
    console.log(`✅ Conectado a BD: ${process.env.DB_NAME}`);
    iniciarServidor();
  })
  .catch(err => {
    console.error(`❌ Error de conexión a la BD:`, err);
    process.exit(1); // 🔹 Evita iniciar el servidor si falla la BD
  });

// 📌 Rutas principales
app.use('/api/usuarios', require('./routes/usuarios.routes')); // ✅ Incluye `POST`, `GET`, `PUT`, `DELETE`
app.use('/api/empleados', empleadosRoutes); // 🚀 Incluye `GET`, `PUT`, `DELETE`
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/proveedores', require('./routes/proveedores.routes'));
app.use('/api/clientes', require('./routes/clientes.routes'));
app.use('/api/ventas', require('./routes/ventas.routes'));
app.use('/api/detalle-ventas', require('./routes/detalleVentas.routes'));

app.use('/api', dashboardRoutes);
app.use('/api/reportes', require('./routes/reportes.routes'));



// 📌 Middleware global para capturar errores
app.use((err, req, res, next) => {
  console.error(`❌ Error en la solicitud:`, err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

// 📌 Middleware para manejar rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// 📌 Función para iniciar servidor solo si la BD está activa
function iniciarServidor() {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
    console.log(`🛡️  Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=================================`);
  });
}
