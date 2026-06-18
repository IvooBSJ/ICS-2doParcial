// api/validar.test.js
// Tests de integración del handler HTTP POST /api/validar

import { jest } from '@jest/globals';
import handler from './validar.js';

// Helpers para simular req y res de Express
function mockReq(method, body) {
  return { method, body };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json  = jest.fn().mockReturnValue(res);
  return res;
}

describe('Handler POST /api/validar', () => {
  test('datos válidos → 200 con registro exitoso', () => {
    const req = mockReq('POST', { email: 'usuario@gmail.com', password: 'Segura123' });
    const res = mockRes();
    handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      emailValido: true,
      passwordValida: true,
      mensaje: 'Registro exitoso',
    });
  });

  test('email inválido → 200 con mensaje de email inválido', () => {
    const req = mockReq('POST', { email: 'noesemail', password: 'Segura123' });
    const res = mockRes();
    handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      emailValido: false,
      passwordValida: true,
      mensaje: 'Email inválido',
    });
  });

  test('password inválida → 200 con mensaje de contraseña inválida', () => {
    const req = mockReq('POST', { email: 'usuario@gmail.com', password: 'abc' });
    const res = mockRes();
    handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      emailValido: true,
      passwordValida: false,
      mensaje: 'Contraseña inválida',
    });
  });

  test('ambos inválidos → 200 con mensaje combinado', () => {
    const req = mockReq('POST', { email: 'noesemail', password: 'abc' });
    const res = mockRes();
    handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      emailValido: false,
      passwordValida: false,
      mensaje: 'Email y contraseña inválidos',
    });
  });

  test('body sin email → 400', () => {
    const req = mockReq('POST', { password: 'Segura123' });
    const res = mockRes();
    handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email y password son requeridos' });
  });

  test('body sin password → 400', () => {
    const req = mockReq('POST', { email: 'usuario@gmail.com' });
    const res = mockRes();
    handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email y password son requeridos' });
  });

  test('método GET → 405', () => {
    const req = mockReq('GET', {});
    const res = mockRes();
    handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Método no permitido' });
  });
});
