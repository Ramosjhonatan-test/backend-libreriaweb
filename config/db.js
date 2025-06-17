// Conexión a la base de datos
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'libreria',
  password: process.env.DB_PASSWORD || '1522',
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;