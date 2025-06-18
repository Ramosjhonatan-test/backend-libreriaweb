const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db'); // ajustá esta ruta si tu pool está en otro lugar

const router = express.Router();

router.get('/setup', async (req, res) => {
  try {
    const sqlPath = path.join(__dirname, '../scripts/init.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf-8');
    await pool.query(sqlScript);
    res.status(200).json({ ok: true, mensaje: '✅ Base de datos inicializada correctamente' });
  } catch (error) {
    console.error('❌ Error ejecutando init.sql:', error);
    res.status(500).json({ error: 'Fallo al crear la estructura de la base de datos' });
  }
});

module.exports = router;
