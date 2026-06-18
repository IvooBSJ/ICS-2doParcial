// api/validar.js
// Implementación del endpoint POST /api/validar
// La lógica de validación proviene del módulo TypeScript compilado en dist/

import { validarEmail, validarPassword } from '../dist/validador.js';

export default function handler(req, res) {
  // Solo aceptar POST según la spec
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password } = req.body || {};

  // Validar que los campos requeridos estén presentes
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son requeridos' });
  }

  // Lógica de validación (reutiliza src/validador.js)
  const emailValido = validarEmail(email);
  const passwordValida = validarPassword(password);

  // Construir mensaje según resultado
  let mensaje;
  if (emailValido && passwordValida) {
    mensaje = 'Registro exitoso';
  } else if (!emailValido && !passwordValida) {
    mensaje = 'Email y contraseña inválidos';
  } else if (!emailValido) {
    mensaje = 'Email inválido';
  } else {
    mensaje = 'Contraseña inválida';
  }

  return res.status(200).json({ emailValido, passwordValida, mensaje });
}
