// Crear bodega
export type CrearBodega = {
    referencia: string;
    descripcion: string;
};

// Actualizar bodega
export type ActualizarBodega = {
    referencia: string;
    descripcion: string;
};

// Cambiar estado de la bodega
export type ActualizarEstadoBodega = {
    estado: string;
};

// Bodega en listado
export type BodegaListado = {
    id: number;
    referencia: string;
    descripcion: string;
    estado: string;
    createdAt: Date;
};
