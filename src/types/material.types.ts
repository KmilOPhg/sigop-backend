// Crear material
export type CrearMaterial = {
    itemMaterial: string;
    nombreMaterial: string;
    unidadMedida: string;
};

// Actualizar material
export type ActualizarMaterial = {
    nombreMaterial: string;
    unidadMedida: string;
};

// Cambiar estado del material
export type ActualizarEstadoMaterial = {
    estado: string;
};

// Material en listado
export type MaterialListado = {
    id: number;
    itemMaterial: string;
    nombreMaterial: string;
    unidadMedida: string;
    estado: string;
    createdAt: Date;
};
