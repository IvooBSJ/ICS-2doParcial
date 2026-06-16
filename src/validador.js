export function validarEmail(email) {
    const validar = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return validar.test(email);
}

export function validarPassword(password) {
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password);
}
