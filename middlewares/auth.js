// backend/middlewares/auth.js

const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware de autenticación: verifica credenciales y bloquea tras 3 intentos
exports.authMiddleware = async (req, res, next) => {
    const { nombre, password } = req.body;
    const usuario = await Usuario.findByNombre(nombre);

    if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.bloqueado) {
        return res.status(403).json({ error: 'Usuario bloqueado. Contacta al administrador.' });
    }

    const isMatch = await bcrypt.compare(password, usuario.password_hash);
    if (!isMatch) {
        // Incrementar intentos fallidos
        await pool.query('UPDATE usuarios SET intentos_login = intentos_login + 1 WHERE id = $1', [usuario.id]);

        if (usuario.intentos_login + 1 >= 3) { // Cambia 3 por 10 si tu umbral es 10
            await Usuario.bloquearUsuario(usuario.id);
            return res.status(403).json({ error: 'Usuario bloqueado por 10 intentos fallidos.' });
        }

        return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    // Si todo está bien, reiniciar intentos y generar token
    await Usuario.reiniciarIntentos(usuario.id);
    const token = jwt.sign(
        { id: usuario.id, rol: usuario.rol , nombre: usuario.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
    );
    req.token = token;
    req.usuario = usuario;
    next();
};

// Middleware para validar roles permitidos
exports.checkRol = (allowedRoles) => (req, res, next) => {
    if (!req.usuario || !req.usuario.rol) {
        return res.status(403).json({ error: 'Usuario no autenticado o rol no definido.' });
    }

    if (allowedRoles.includes(req.usuario.rol)) {
        next();
    } else {
        return res.status(403).json({
            error: `Acceso no autorizado. Su rol (${req.usuario.rol}) no tiene los permisos necesarios.`
        });
    }
};

// Middleware para verificar el token en rutas protegidas
exports.verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        console.error('❌ Token no proporcionado en Headers');
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
        console.log('🔑 Token recibido en Headers:', token);

        if (!process.env.JWT_SECRET) {
            console.error('❌ Error: JWT_SECRET no está definido en el entorno.');
            return res.status(500).json({ error: 'Error interno del servidor: JWT_SECRET no configurado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token decodificado correctamente:', decoded);

        const usuario = await Usuario.findById(decoded.id);
        if (!usuario) {
            console.error(`❌ Usuario con ID ${decoded.id} no encontrado en BD`);
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        console.log('✅ Usuario encontrado en BD:', usuario);
        req.usuario = usuario;
        next();
    } catch (error) {
        console.error('❌ Error verificando el token:', error.message);
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }
};