import { Router } from "express";
import { param } from "express-validator";
import {
    getDashboardDataController,
    getBodegasPorReferenciaController,
    getMaterialesPorItemController,
} from "../controllers/dashboard.controller.js";
import { authenticateToken, checkPermissions, validateRequest } from "../middlewares/auth.middleware.js";
import asyncWrapper from "../utils/AsyncWrapper.js";

const router = Router();

/**
 * @swagger
 * /dashboard/data:
 *   get:
 *     summary: Obtener datos del dashboard (stats + gráficas)
 *     tags: [Dashboard]
 */
// GET /api/dashboard/data
router.get(
    "/data",
    [
        authenticateToken,
        checkPermissions(["dashboard.consultar"]),
    ],
    asyncWrapper(getDashboardDataController)
);

/**
 * @swagger
 * /dashboard/bodegas/{referencia}:
 *   get:
 *     summary: Bodegas por referencia
 *     tags: [Dashboard]
 */
// GET /api/dashboard/bodegas/:referencia
router.get(
    "/bodegas/:referencia",
    [
        authenticateToken,
        checkPermissions(["dashboard.consultar"]),
        param("referencia", "La referencia es obligatoria").notEmpty(),
        validateRequest,
    ],
    asyncWrapper(getBodegasPorReferenciaController)
);

/**
 * @swagger
 * /dashboard/materiales/{item}:
 *   get:
 *     summary: Materiales por ítem
 *     tags: [Dashboard]
 */
// GET /api/dashboard/materiales/:item
router.get(
    "/materiales/:item",
    [
        authenticateToken,
        checkPermissions(["dashboard.consultar"]),
        param("item", "El ítem es obligatorio").notEmpty(),
        validateRequest,
    ],
    asyncWrapper(getMaterialesPorItemController)
);

export default router;
