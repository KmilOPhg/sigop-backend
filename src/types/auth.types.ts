// Datos de login
export type LoginRequest = {
    email: string;
    password: string;
};

// Solicitud de recuperación de contraseña
export type ForgotPasswordRequest = {
    email: string;
    emailAdmin: string;
};

// Restablecer contraseña con token
export type ResetPasswordRequest = {
    token: string;
    email: string;
    password: string;
};

// Respuesta de autenticación exitosa
export type AuthResponse = {
    token: string;
    usuario: {
        id: number;
        nombre: string;
        email: string;
        rol: string;
        estado: string;
    };
};

// Perfil del usuario autenticado
export type MeResponse = {
    id: number;
    nombre: string;
    email: string | null;
    estado: string;
    rol: {
        id: number;
        nombre: string;
    };
    permisos: string[];
};
