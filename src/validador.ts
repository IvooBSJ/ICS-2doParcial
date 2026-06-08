export function validarEmail(email: string): boolean {
    const validar = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return validar.test(email);
}

export function validarPassword(password: string): boolean {
    // Mínimo 8 caracteres, al menos una mayúscula y un número
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password);
}

export function validarDNI(dni: string): boolean {
    // DNI: 7 u 8 dígitos
    const validar = /^\d{7,8}$/;
    return validar.test(dni);
}