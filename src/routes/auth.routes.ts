import { Router } from "express";
import { body } from "express-validator";
import {
    loginController,
    forgotPasswordController,
    resetPasswordController,
    getMeController,
} from "../controllers/auth.controller.js";
import { authenticateToken, validateRequest } from "../middlewares/auth.middleware.js";
import asyncWrapper from "../utils/AsyncWrapper.js";

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: JWT y datos del usuario
 */
// POST /api/auth/login
router.post(
    "/login",
    [
        body("email", "El email es inválido").isEmail().normalizeEmail(),
        body("password", "La contraseña es obligatoria").notEmpty(),
        validateRequest,
    ],
    asyncWrapper(loginController)
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Auth]
 *     security: []
 */
// POST /api/auth/forgot-password
router.post(
    "/forgot-password",
    [
        body("email", "El email del usuario es inválido").isEmail().normalizeEmail(),
        body("emailAdmin", "El email del administrador es inválido").isEmail().normalizeEmail(),
        validateRequest,
    ],
    asyncWrapper(forgotPasswordController)
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token
 *     tags: [Auth]
 *     security: []
 */
// POST /api/auth/reset-password
router.post(
    "/reset-password",
    [
        body("email", "El email es inválido").isEmail().normalizeEmail(),
        body("token", "El token es obligatorio").notEmpty(),
        body("password", "La contraseña debe tener al menos 6 caracteres").isLength({ min: 6 }),
        validateRequest,
    ],
    asyncWrapper(resetPasswordController)
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Auth]
 */
// GET /api/auth/me
router.get("/me", [authenticateToken], asyncWrapper(getMeController));

export default router;
