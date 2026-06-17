# API Spec — Validador de Registro

> Especificación técnica de la API REST implementada con Express y desplegada en Vercel Serverless Functions.  
> Este documento sirve como fuente de verdad del contrato y la arquitectura (Spec Driven Development).

---

## 1. Resumen

| Atributo | Valor |
|---|---|
| Nombre | API Validador |
| Versión | 1.0.0 |
| Protocolo | HTTP/REST |
| Formato de datos | JSON |
| Runtime | Node.js (ESModules, `"type": "module"`) |
| Framework local | Express 4 |
| Despliegue | Vercel Serverless Functions |

**Propósito:** Exponer un único endpoint que valide el email y la contraseña ingresados en un formulario de registro de usuario, devolviendo un resultado estructurado para que el frontend pueda mostrar feedback al usuario.

---

## 2. Estructura del Proyecto

```
/
├── api/
│   └── validar.js          # Handler del endpoint (Vercel + Express)
├── src/
│   ├── validador.js         # Lógica de negocio pura (sin dependencias HTTP)
│   └── validador.test.js    # Tests unitarios con Jest
├── server.js                # Servidor Express para desarrollo local
├── package.json
└── vercel.json              # Configuración de routing para Vercel
```

**Regla de arquitectura:** La lógica de validación vive en `src/validador.js` y es completamente independiente de Express o Vercel. El handler en `api/validar.js` solo maneja el protocolo HTTP (leer body, escribir respuesta), delegando toda la lógica al módulo de `src/`.

---

## 3. Endpoints

### `POST /api/validar`

Valida el email y la contraseña recibidos en el body.

#### 3.1 Request

- **Method:** `POST`
- **Content-Type:** `application/json`

**Body (requerido):**

```json
{
  "email": "usuario@gmail.com",
  "password": "Segura123"
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `email` | `string` | ✅ | Email del usuario a registrar |
| `password` | `string` | ✅ | Contraseña (mín. 8 chars, 1 mayúscula, 1 número) |

#### 3.2 Reglas de validación

| Campo | Regla | Regex / Condición |
|---|---|---|
| `email` | Formato válido `usuario@dominio.ext` | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `password` | Al menos 8 caracteres | `length >= 8` |
| `password` | Al menos una letra mayúscula | `/[A-Z]/` |
| `password` | Al menos un número | `/[0-9]/` |

#### 3.3 Responses

##### `200 OK` — Resultado de la validación

Se devuelve **siempre** cuando los campos están presentes, independientemente de si los datos son válidos o no.

```json
{
  "emailValido": true,
  "passwordValida": true,
  "mensaje": "Registro exitoso"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `emailValido` | `boolean` | `true` si el email tiene formato válido |
| `passwordValida` | `boolean` | `true` si la contraseña cumple los requisitos |
| `mensaje` | `string` | Descripción del resultado |

**Posibles valores de `mensaje`:**

| `emailValido` | `passwordValida` | `mensaje` |
|---|---|---|
| `true` | `true` | `"Registro exitoso"` |
| `false` | `true` | `"Email inválido"` |
| `true` | `false` | `"Contraseña inválida"` |
| `false` | `false` | `"Email y contraseña inválidos"` |

##### `400 Bad Request` — Campos faltantes

Se devuelve cuando `email` o `password` no están presentes en el body.

```json
{
  "error": "Email y password son requeridos"
}
```

##### `405 Method Not Allowed` — Método HTTP no permitido

Se devuelve cuando se llama al endpoint con un método distinto a `POST`.

```json
{
  "error": "Método no permitido"
}
```

---

## 4. Implementación con Express

### 4.1 Módulo de lógica de negocio — `src/validador.js`

Este módulo es la capa de dominio. No tiene dependencias de HTTP ni de Express.

```js
// src/validador.js
export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validarPassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}
```

### 4.2 Handler del endpoint — `api/validar.js`

Este módulo implementa el contrato definido en la spec. Es compatible tanto con Vercel (serverless) como con Express (local).

```js
// api/validar.js
import { validarEmail, validarPassword } from '../src/validador.js';

export default function handler(req, res) {
  // 405: solo se acepta POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password } = req.body || {};

  // 400: campos requeridos
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son requeridos' });
  }

  // Lógica de validación
  const emailValido = validarEmail(email);
  const passwordValida = validarPassword(password);

  // Construir mensaje según resultado
  let mensaje;
  if (emailValido && passwordValida)       mensaje = 'Registro exitoso';
  else if (!emailValido && !passwordValida) mensaje = 'Email y contraseña inválidos';
  else if (!emailValido)                    mensaje = 'Email inválido';
  else                                      mensaje = 'Contraseña inválida';

  return res.status(200).json({ emailValido, passwordValida, mensaje });
}
```

### 4.3 Servidor Express local — `server.js`

El servidor local replica el entorno de Vercel: sirve los estáticos y monta el handler en la misma ruta.

```js
// server.js
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import handler from './api/validar.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());                                   // parsear body JSON
app.use(express.static(__dirname));                        // servir index.html
app.post('/api/validar', (req, res) => handler(req, res)); // montar endpoint

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
```

---

## 5. Tests Unitarios

Los tests cubren la lógica de `src/validador.js` usando **Jest**. Se ejecutan con `npm test`.

```js
// src/validador.test.js
import { validarEmail, validarPassword } from './validador.js';

describe('Validador de Email', () => {
  test('email válido', () => expect(validarEmail('usuario@gmail.com')).toBe(true));
  test('email sin arroba', () => expect(validarEmail('usuariogmail.com')).toBe(false));
  test('email vacío', () => expect(validarEmail('')).toBe(false));
});

describe('Validador de Password', () => {
  test('password válida', () => expect(validarPassword('Segura123')).toBe(true));
  test('password sin mayúscula', () => expect(validarPassword('segura123')).toBe(false));
  test('password muy corta', () => expect(validarPassword('Aa1')).toBe(false));
});
```

**Cobertura objetivo:** 100% de `src/validador.js` y `api/validar.js`.

Comandos disponibles:

```bash
npm test                 # Ejecutar tests
npm run test:coverage    # Tests + reporte de cobertura (lcov + text)
```

---

## 6. Configuración de Dependencias

```json
// package.json (fragmento relevante)
{
  "type": "module",
  "scripts": {
    "dev":             "node server.js",
    "test":            "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "test:coverage":   "node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "jest": "^29.5.0"
  }
}
```

> **Nota sobre `--experimental-vm-modules`:** Es necesario porque el proyecto usa ESModules (`"type": "module"`) y Jest aún requiere este flag para soportarlos correctamente.

---

## 7. Flujo de Desarrollo (Spec Driven Development)

```
API_SPEC.md  ──▶  api/validar.js  ──▶  src/validador.js
  (contrato)        (handler HTTP)        (lógica pura)
                         │
                    server.js              Tests Jest
                 (dev local Express)    (src/validador.test.js)
```

1. **Definir contrato** → Documentar endpoints, reglas y respuestas esperadas (este documento).
2. **Implementar lógica** → `src/validador.js` sin dependencias HTTP.
3. **Implementar handler** → `api/validar.js` traduce HTTP ↔ lógica de negocio.
4. **Testear** → Tests unitarios sobre la lógica pura.
5. **Levantar local** → `npm run dev` → Express sirve el handler idénticamente a Vercel.
6. **Deploy** → Vercel detecta `api/validar.js` automáticamente como Serverless Function.

---

## 8. Entornos

| Entorno | URL base | Cómo se levanta |
|---|---|---|
| Desarrollo local | `http://localhost:3000` | `npm run dev` (Express) |
| Producción | `https://ics-2do-parcial.vercel.app` | Deploy automático en Vercel |

El handler `api/validar.js` es **el mismo archivo** en ambos entornos. Express en local y Vercel en producción utilizan la misma firma `(req, res)`, lo que garantiza paridad de comportamiento.
