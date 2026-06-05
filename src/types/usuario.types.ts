// Crear usuario
export type CrearUsuario = {
    nombre: string;
    email: string;
    password: string;
    rolId: number;
    permisos?: string[];
};

// Actualizar usuario
export type ActualizarUsuario = {
    nombre: string;
    email: string;
    password?: string;
    estado: string;
    rolId: number;
    permisos?: string[];
};

// Cambiar estado del usuario
export type ActualizarEstadoUsuario = {
    estado: string;
};

// Usuario en listado
export type UsuarioListado = {
    id: number;
    nombre: string;
    email: string | null;
    estado: string;
    rol: {
        id: number;
        nombre: string;
    };
    permisos: string[];
    createdAt: Date;
};
