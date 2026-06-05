import { Response } from "express";
import { sendSuccessResponse } from "../utils/JSONResponse.js";
import { AppError } from "../utils/AppError.js";
import {
    listarBodegas,
    crearBodega,
    actualizarBodega,
    inhabilitarBodega,
} from "../services/bodegas.service.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

// GET /api/bodegas?estado=activo|inactivo
export async function listarBodegasController(req: AuthenticatedRequest, res: Response) {
    const estado = (req.query.estado as string) || "activo";
    const data = await listarBodegas(estado);
    return sendSuccessResponse(res, 200, "Bodegas obtenidas correctamente", data);
}

// POST /api/bodegas
export async function crearBodegaController(req: AuthenticatedRequest, res: Response) {
    const data = await crearBodega({
        referencia: req.body.referencia,
        descripcion: req.body.descripcion,
    });
    return sendSuccessResponse(res, 201, "Bodega creada correctamente", data);
}

// PUT /api/bodegas/:id
export async function actualizarBodegaController(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError("El id debe ser un número", 400);
    const data = await actualizarBodega(id, {
        referencia: req.body.referencia,
        descripcion: req.body.descripcion,
    });
    return sendSuccessResponse(res, 200, "Bodega actualizada correctamente", data);
}

// PATCH /api/bodegas/:id/inhabilitar
export async function inhabilitarBodegaController(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError("El id debe ser un número", 400);
    const data = await inhabilitarBodega(id, req.body.estado);
    return sendSuccessResponse(res, 200, "Estado de la bodega actualizado correctamente", data);
}
