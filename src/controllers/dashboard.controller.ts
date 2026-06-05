import { Response } from "express";
import { sendSuccessResponse } from "../utils/JSONResponse.js";
import { getDashboardData, getBodegasPorReferencia, getMaterialesPorItem } from "../services/dashboard.service.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

// GET /api/dashboard/data
export async function getDashboardDataController(req: AuthenticatedRequest, res: Response) {
    const data = await getDashboardData();
    return sendSuccessResponse(res, 200, "Datos del dashboard obtenidos correctamente", data);
}

// GET /api/dashboard/bodegas/:referencia
export async function getBodegasPorReferenciaController(req: AuthenticatedRequest, res: Response) {
    const referencia = String(req.params.referencia);
    const data = await getBodegasPorReferencia(referencia);
    return sendSuccessResponse(res, 200, "Bodegas obtenidas correctamente", data);
}

// GET /api/dashboard/materiales/:item
export async function getMaterialesPorItemController(req: AuthenticatedRequest, res: Response) {
    const item = String(req.params.item);
    const data = await getMaterialesPorItem(item);
    return sendSuccessResponse(res, 200, "Materiales obtenidos correctamente", data);
}
