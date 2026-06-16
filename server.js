// server.js - Servidor Express para entorno de desarrollo local
// Equivalente local a lo que Vercel hace en producción:
//   - Sirve index.html como archivo estático
//   - Expone /api/validar como endpoint REST

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import handler from './api/validar.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Parsear JSON en el body de los requests
app.use(express.json());

// Servir archivos estáticos desde la raíz del proyecto
app.use(express.static(__dirname));

// Montar el endpoint de la API
app.post('/api/validar', (req, res) => handler(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/api/validar`);
});
