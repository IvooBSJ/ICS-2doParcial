import { validarEmail, validarPassword, validarDNI } from "./validador";

describe("Validador de Email", () => {
    test("email válido", () => {
        expect(validarEmail("usuario@gmail.com")).toBe(true);
    });
    test("email sin arroba", () => {
        expect(validarEmail("usuariogmail.com")).toBe(false);
    });
    test("email vacío", () => {
        expect(validarEmail("")).toBe(false);
    });
});

describe("Validador de Password", () => {
    test("password válida", () => {
        expect(validarPassword("Segura123")).toBe(true);
    });
    test("password sin mayúscula", () => {
        expect(validarPassword("segura123")).toBe(false);
    });
    test("password muy corta", () => {
        expect(validarPassword("Aa1")).toBe(false);
    });
});

describe("Validador de DNI", () => {
    test("DNI válido de 8 dígitos", () => {
        expect(validarDNI("40123456")).toBe(true);
    });
    test("DNI válido de 7 dígitos", () => {
        expect(validarDNI("9876543")).toBe(true);
    });
    test("DNI con letras", () => {
        expect(validarDNI("4012ABC6")).toBe(false);
    });
});