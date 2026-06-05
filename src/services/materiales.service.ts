import { prisma } from "../../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { CrearMaterial, ActualizarMaterial, MaterialListado } from "../types/material.types.js";

// Mapear material a shape de respuesta
const mapMaterial = (m: {
    id: number;
    itemMaterial: string;
    nombreMaterial: string;
    unidadMedida: string;
    estado: string;
    createdAt: Date;
}): MaterialListado => ({
    id: m.id,
    itemMaterial: m.itemMaterial,
    nombreMaterial: m.nombreMaterial,
    unidadMedida: m.unidadMedida,
    estado: m.estado,
    createdAt: m.createdAt,
});

// Listar materiales filtrados por estado
export const listarMateriales = async (estado: string): Promise<MaterialListado[]> => {
    const materiales = await prisma.material.findMany({
        where: { estado },
        orderBy: { createdAt: "desc" },
    });
    return materiales.map(mapMaterial);
};

// Obtener material por ID
export const obtenerMaterial = async (id: number): Promise<MaterialListado> => {
    const material = await prisma.material.findUnique({ where: { id } });
    if (!material) throw new AppError("Material no encontrado", 404);
    return mapMaterial(material);
};

// Crear material
export const crearMaterial = async (data: CrearMaterial, usuarioId?: number): Promise<MaterialListado> => {
    // Verificar ítem único
    const existente = await prisma.material.findUnique({ where: { itemMaterial: data.itemMaterial } });
    if (existente) throw new AppError("El ítem de material ya está registrado", 409);

    const material = await prisma.material.create({
        data: {
            itemMaterial: data.itemMaterial,
            nombreMaterial: data.nombreMaterial,
            unidadMedida: data.unidadMedida,
            estado: "activo",
            usuarioId: usuarioId ?? null,
        },
    });
    return mapMaterial(material);
};

// Actualizar material
export const actualizarMaterial = async (id: number, data: ActualizarMaterial): Promise<MaterialListado> => {
    // Verificar que el material existe
    const existente = await prisma.material.findUnique({ where: { id } });
    if (!existente) throw new AppError("Material no encontrado", 404);

    const material = await prisma.material.update({
        where: { id },
        data: {
            nombreMaterial: data.nombreMaterial,
            unidadMedida: data.unidadMedida,
        },
    });
    return mapMaterial(material);
};

// Inhabilitar o habilitar material (cambio de estado)
export const inhabilitarMaterial = async (id: number, estado: string): Promise<MaterialListado> => {
    // Verificar que el material existe
    const existente = await prisma.material.findUnique({ where: { id } });
    if (!existente) throw new AppError("Material no encontrado", 404);

    const material = await prisma.material.update({
        where: { id },
        data: { estado },
    });
    return mapMaterial(material);
};
