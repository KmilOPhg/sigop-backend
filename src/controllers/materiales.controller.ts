import { Response } from "express";
import { sendSuccessResponse } from "../utils/JSONResponse.js";
import { AppError } from "../utils/AppError.js";
import {
    listarMateriales,
    crearMaterial,
    actualizarMaterial,
    inhabilitarMaterial,
} from "../services/materiales.service.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

// GET /api/materiales?estado=activo|inactivo
export async function listarMaterialesController(req: AuthenticatedRequest, res: Response) {
    const estado = (req.query.estado as string) || "activo";
    const data = await listarMateriales(estado);
    return sendSuccessResponse(res, 200, "Materiales obtenidos correctamente", data);
}

// POST /api/materiales
export async function crearMaterialController(req: AuthenticatedRequest, res: Response) {
    const data = await crearMaterial(
        {
            itemMaterial: req.body.itemMaterial,
            nombreMaterial: req.body.nombreMaterial,
            unidadMedida: req.body.unidadMedida,
        },
        req.user?.id
    );
    return sendSuccessResponse(res, 201, "Material creado correctamente", data);
}

// PUT /api/materiales/:id
export async function actualizarMaterialController(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError("El id debe ser un número", 400);
    const data = await actualizarMaterial(id, {
        nombreMaterial: req.body.nombreMaterial,
        unidadMedida: req.body.unidadMedida,
    });
    return sendSuccessResponse(res, 200, "Material actualizado correctamente", data);
}

// PATCH /api/materiales/:id/inhabilitar
export async function inhabilitarMaterialController(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError("El id debe ser un número", 400);
    const data = await inhabilitarMaterial(id, req.body.estado);
    return sendSuccessResponse(res, 200, "Estado del material actualizado correctamente", data);
}
