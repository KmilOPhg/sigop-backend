import { prisma } from "../../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { CrearBodega, ActualizarBodega, BodegaListado } from "../types/bodega.types.js";

// Mapear bodega a shape de respuesta
const mapBodega = (b: {
    id: number;
    referencia: string;
    descripcion: string;
    estado: string;
    createdAt: Date;
}): BodegaListado => ({
    id: b.id,
    referencia: b.referencia,
    descripcion: b.descripcion,
    estado: b.estado,
    createdAt: b.createdAt,
});

// Listar bodegas filtradas por estado
export const listarBodegas = async (estado: string): Promise<BodegaListado[]> => {
    const bodegas = await prisma.bodega.findMany({
        where: { estado },
        orderBy: { createdAt: "desc" },
    });
    return bodegas.map(mapBodega);
};

// Obtener bodega por ID
export const obtenerBodega = async (id: number): Promise<BodegaListado> => {
    const bodega = await prisma.bodega.findUnique({ where: { id } });
    if (!bodega) throw new AppError("Bodega no encontrada", 404);
    return mapBodega(bodega);
};

// Crear bodega
export const crearBodega = async (data: CrearBodega): Promise<BodegaListado> => {
    // Verificar referencia única
    const existente = await prisma.bodega.findUnique({ where: { referencia: data.referencia } });
    if (existente) throw new AppError("La referencia de bodega ya está registrada", 409);

    const bodega = await prisma.bodega.create({
        data: {
            referencia: data.referencia,
            descripcion: data.descripcion,
            estado: "activo",
        },
    });
    return mapBodega(bodega);
};

// Actualizar bodega
export const actualizarBodega = async (id: number, data: ActualizarBodega): Promise<BodegaListado> => {
    // Verificar que la bodega existe
    const existente = await prisma.bodega.findUnique({ where: { id } });
    if (!existente) throw new AppError("Bodega no encontrada", 404);

    // Verificar referencia única excluyendo la bodega actual
    const referenciaExistente = await prisma.bodega.findFirst({
        where: { referencia: data.referencia, id: { not: id } },
    });
    if (referenciaExistente) throw new AppError("La referencia de bodega ya está registrada", 409);

    const bodega = await prisma.bodega.update({
        where: { id },
        data: {
            referencia: data.referencia,
            descripcion: data.descripcion,
        },
    });
    return mapBodega(bodega);
};

// Inhabilitar o habilitar bodega (cambio de estado)
export const inhabilitarBodega = async (id: number, estado: string): Promise<BodegaListado> => {
    // Verificar que la bodega existe
    const existente = await prisma.bodega.findUnique({ where: { id } });
    if (!existente) throw new AppError("Bodega no encontrada", 404);

    const bodega = await prisma.bodega.update({
        where: { id },
        data: { estado },
    });
    return mapBodega(bodega);
};
