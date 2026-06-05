import { Router } from "express";
import { body, param, query } from "express-validator";
import {
    listarBodegasController,
    crearBodegaController,
    actualizarBodegaController,
    inhabilitarBodegaController,
} from "../controllers/bodegas.controller.js";
import { authenticateToken, checkPermissions, validateRequest } from "../middlewares/auth.middleware.js";
import asyncWrapper from "../utils/AsyncWrapper.js";

const router = Router();

/**
 * @swagger
 * /bodegas:
 *   get:
 *     summary: Listar bodegas (filtrar por estado)
 *     tags: [Bodegas]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [activo, inactivo] }
 */
// GET /api/bodegas
router.get(
    "/",
    [
        authenticateToken,
        checkPermissions(["bodegas.consultar"]),
        query("estado").optional().isIn(["activo", "inactivo"]),
        validateRequest,
    ],
    asyncWrapper(listarBodegasController)
);

/**
 * @swagger
 * /bodegas:
 *   post:
 *     summary: Crear bodega
 *     tags: [Bodegas]
 */
// POST /api/bodegas
router.post(
    "/",
    [
        authenticateToken,
        checkPermissions(["bodegas.crear"]),
        body("referencia", "La referencia es obligatoria").notEmpty().trim(),
        body("descripcion", "La descripción es obligatoria").notEmpty().trim(),
        validateRequest,
    ],
    asyncWrapper(crearBodegaController)
);

/**
 * @swagger
 * /bodegas/{id}:
 *   put:
 *     summary: Actualizar bodega
 *     tags: [Bodegas]
 */
// PUT /api/bodegas/:id
router.put(
    "/:id",
    [
        authenticateToken,
        checkPermissions(["bodegas.actualizar"]),
        param("id", "El id debe ser numérico").isInt({ min: 1 }),
        body("referencia", "La referencia es obligatoria").notEmpty().trim(),
        body("descripcion", "La descripción es obligatoria").notEmpty().trim(),
        validateRequest,
    ],
    asyncWrapper(actualizarBodegaController)
);

/**
 * @swagger
 * /bodegas/{id}/inhabilitar:
 *   patch:
 *     summary: Cambiar estado de la bodega
 *     tags: [Bodegas]
 */
// PATCH /api/bodegas/:id/inhabilitar
router.patch(
    "/:id/inhabilitar",
    [
        authenticateToken,
        checkPermissions(["bodegas.deshabilitar"]),
        param("id", "El id debe ser numérico").isInt({ min: 1 }),
        body("estado", "El estado debe ser activo o inactivo").isIn(["activo", "inactivo"]),
        validateRequest,
    ],
    asyncWrapper(inhabilitarBodegaController)
);

export default router;
