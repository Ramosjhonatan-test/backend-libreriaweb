const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/enviar', upload.single('archivo'), async (req, res) => {
  try {
    // Validación de archivo
    if (!req.file) {
      console.warn('⚠️ No se recibió ningún archivo.');
      return res.status(400).json({ error: 'No se recibió ningún archivo para enviar.' });
    }

    const { originalname, buffer } = req.file;
    const destinatario = req.body.destinatario;
    const tipo = req.body.tipo || 'reporte'; // 'factura' u otro tipo opcional

    if (!destinatario) {
      console.warn('⚠️ No se proporcionó destinatario.');
      return res.status(400).json({ error: 'El destinatario es obligatorio.' });
    }

    console.log('📤 Enviando archivo a:', destinatario);
    console.log('📎 Nombre del archivo:', originalname);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CORREO_REMITENTE,
        pass: process.env.CORREO_PASS_APP
      }
    });

    const asunto = tipo === 'factura'
      ? '🧾 Tu factura de Librería R&R'
      : '📦 Reporte de la librería R&R 📦';

    const cuerpo = tipo === 'factura'
      ? `Hola, gracias por tu compra. En el archivo adjunto encontrarás la factura correspondiente.\n\nAtentamente,\nLibrería R&R`
      : `Adjunto encontrarás el reporte solicitado.\n\nSaludos,\nLibrería R&R`;

    const mailOptions = {
      from: `"Librería R&R" <${process.env.CORREO_REMITENTE}>`,
      to: destinatario,
      subject: asunto,
      text: cuerpo,
      attachments: [
        {
          filename: originalname || 'documento.pdf',
          content: buffer
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado:', info.messageId);
    res.json({ mensaje: 'Correo enviado con éxito', idMensaje: info.messageId });

  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
    res.status(500).json({ error: 'Error al enviar correo' });
  }
});

module.exports = router;
