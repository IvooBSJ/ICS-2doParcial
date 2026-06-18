export function validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export function validarPassword(password: string): boolean {
    return (
        password.length >= 12 &&
        /[A-Z]/.test(password) &&
        /\d/.test(password)
    );
}
