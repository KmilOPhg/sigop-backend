import { prisma } from "../../lib/prisma.js";

// Stats y datos para las gráficas del dashboard
export const getDashboardData = async () => {
    // Bodegas agrupadas por referencia con estado
    const bodegasRaw = await prisma.bodega.findMany({
        select: { referencia: true, descripcion: true, estado: true },
        orderBy: { referencia: "asc" },
    });

    // Agrupar bodegas por referencia
    const bodegasMap = new Map<string, { referencia: string; nombre: string; estado: string; total: number }>();
    for (const b of bodegasRaw) {
        const key = b.referencia;
        if (bodegasMap.has(key)) {
            bodegasMap.get(key)!.total += 1;
        } else {
            bodegasMap.set(key, { referencia: b.referencia, nombre: b.descripcion, estado: b.estado, total: 1 });
        }
    }
    const bodegasReferencias = Array.from(bodegasMap.values());

    // Materiales agrupados por item con estado
    const materialesRaw = await prisma.material.findMany({
        select: { itemMaterial: true, nombreMaterial: true, estado: true },
        orderBy: { itemMaterial: "asc" },
    });

    // Agrupar materiales por item
    const materialesMap = new Map<string, { item: string; nombre: string; estado: string; total: number }>();
    for (const m of materialesRaw) {
        const key = m.itemMaterial;
        if (materialesMap.has(key)) {
            materialesMap.get(key)!.total += 1;
        } else {
            materialesMap.set(key, { item: m.itemMaterial, nombre: m.nombreMaterial, estado: m.estado, total: 1 });
        }
    }
    const materialesItems = Array.from(materialesMap.values());

    // Contadores totales para tarjetas y gráficas donut
    const totales = {
        bodegas: {
            activas: await prisma.bodega.count({ where: { estado: "activo" } }),
            inactivas: await prisma.bodega.count({ where: { estado: "inactivo" } }),
        },
        materiales: {
            activas: await prisma.material.count({ where: { estado: "activo" } }),
            inactivas: await prisma.material.count({ where: { estado: "inactivo" } }),
        },
    };

    return { bodegasReferencias, materialesItems, totales };
};

// Bodegas de una referencia específica
export const getBodegasPorReferencia = async (referencia: string) => {
    return await prisma.bodega.findMany({
        where: { referencia },
        select: { id: true, referencia: true, descripcion: true, estado: true },
    });
};

// Materiales de un ítem específico
export const getMaterialesPorItem = async (item: string) => {
    return await prisma.material.findMany({
        where: { itemMaterial: item },
        select: { id: true, itemMaterial: true, nombreMaterial: true, unidadMedida: true, estado: true },
    });
};
