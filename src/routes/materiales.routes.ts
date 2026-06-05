import { Router } from "express";
import { body, param, query } from "express-validator";
import {
    listarMaterialesController,
    crearMaterialController,
    actualizarMaterialController,
    inhabilitarMaterialController,
} from "../controllers/materiales.controller.js";
import { authenticateToken, checkPermissions, validateRequest } from "../middlewares/auth.middleware.js";
import asyncWrapper from "../utils/AsyncWrapper.js";

const router = Router();

/**
 * @swagger
 * /materiales:
 *   get:
 *     summary: Listar materiales (filtrar por estado)
 *     tags: [Materiales]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema: { type: string, enum: [activo, inactivo] }
 */
// GET /api/materiales
router.get(
    "/",
    [
        authenticateToken,
        checkPermissions(["materiales.consultar"]),
        query("estado").optional().isIn(["activo", "inactivo"]),
        validateRequest,
    ],
    asyncWrapper(listarMaterialesController)
);

/**
 * @swagger
 * /materiales:
 *   post:
 *     summary: Crear material
 *     tags: [Materiales]
 */
// POST /api/materiales
router.post(
    "/",
    [
        authenticateToken,
        checkPermissions(["materiales.crear"]),
        body("itemMaterial", "El ítem del material es obligatorio").notEmpty().trim(),
        body("nombreMaterial", "El nombre del material es obligatorio").notEmpty().trim(),
        body("unidadMedida", "La unidad de medida es obligatoria").notEmpty().trim(),
        validateRequest,
    ],
    asyncWrapper(crearMaterialController)
);

/**
 * @swagger
 * /materiales/{id}:
 *   put:
 *     summary: Actualizar material
 *     tags: [Materiales]
 */
// PUT /api/materiales/:id
router.put(
    "/:id",
    [
        authenticateToken,
        checkPermissions(["materiales.actualizar"]),
        param("id", "El id debe ser numérico").isInt({ min: 1 }),
        body("nombreMaterial", "El nombre del material es obligatorio").notEmpty().trim(),
        body("unidadMedida", "La unidad de medida es obligatoria").notEmpty().trim(),
        validateRequest,
    ],
    asyncWrapper(actualizarMaterialController)
);

/**
 * @swagger
 * /materiales/{id}/inhabilitar:
 *   patch:
 *     summary: Cambiar estado del material
 *     tags: [Materiales]
 */
// PATCH /api/materiales/:id/inhabilitar
router.patch(
    "/:id/inhabilitar",
    [
        authenticateToken,
        checkPermissions(["materiales.deshabilitar"]),
        param("id", "El id debe ser numérico").isInt({ min: 1 }),
        body("estado", "El estado debe ser activo o inactivo").isIn(["activo", "inactivo"]),
        validateRequest,
    ],
    asyncWrapper(inhabilitarMaterialController)
);

export default router;
