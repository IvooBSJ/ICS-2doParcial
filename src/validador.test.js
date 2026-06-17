import { validarEmail, validarPassword } from "./validador.js";

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
        expect(validarPassword("Ejemplo123")).toBe(true);
    });
    test("password sin mayúscula", () => {
        expect(validarPassword("ejemplo123")).toBe(false);
    });
    test("password muy corta", () => {
        expect(validarPassword("Aa1")).toBe(false);
    });
    test("password sin número", () => {
        expect(validarPassword("Ejemplo")).toBe(false);
    });
});
