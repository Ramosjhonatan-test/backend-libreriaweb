//routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardModel = require('../models/dashboard');

router.get('/dashboard', async (req, res) => {
  try {
    const data = await dashboardModel.obtenerKPIs();
    res.json(data);
  } catch (err) {
    console.error('Error en dashboard:', err);
    res.status(500).json({ mensaje: 'Error al cargar datos del dashboard' });
  }
});

module.exports = router;
