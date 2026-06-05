import { Router } from "express";
import { body, param } from "express-validator";
import {
    listarUsuariosController,
    crearUsuarioController,
    actualizarUsuarioController,
    actualizarEstadoUsuarioController,
    listarRolesController,
    listarPermisosController,
} from "../controllers/usuarios.controller.js";
import { authenticateToken, checkPermissions, validateRequest } from "../middlewares/auth.middleware.js";
import asyncWrapper from "../utils/AsyncWrapper.js";

const routerUsuarios = Router();
const routerRoles = Router();
const routerPermisos = Router();

// ── Roles ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Listar todos los roles
 *     tags: [Roles]
 */
// GET /api/roles
routerRoles.get(
    "/",
    [authenticateToken],
    asyncWrapper(listarRolesController)
);

// ── Permisos ─────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /permisos:
 *   get:
 *     summary: Listar todos los permisos agrupados por módulo
 *     tags: [Permisos]
 */
// GET /api/permisos
routerPermisos.get(
    "/",
    [authenticateToken],
    asyncWrapper(listarPermisosController)
);

// ── Usuarios ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listar usuarios con roles y permisos
 *     tags: [Usuarios]
 */
// GET /api/usuarios
routerUsuarios.get(
    "/",
    [
        authenticateToken,
        checkPermissions(["usuarios.consultar"]),
    ],
    asyncWrapper(listarUsuariosController)
);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 */
// POST /api/usuarios
routerUsuarios.post(
    "/",
    [
        authenticateToken,
        checkPermissions(["usuarios.crear"]),
        body("nombre", "El nombre es obligatorio").notEmpty().trim(),
        body("email", "El email es inválido").isEmail().normalizeEmail(),
        body("password", "La contraseña debe tener al menos 6 caracteres").isLength({ min: 6 }),
        body("rolId", "El rol es obligatorio").isInt({ min: 1 }),
        validateRequest,
    ],
    asyncWrapper(crearUsuarioController)
);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     tags: [Usuarios]
 */
// PUT /api/usuarios/:id
routerUsuarios.put(
    "/:id",
    [
        authenticateToken,
        checkPermissions(["usuarios.actualizar"]),
        param("id", "El id debe ser numérico").isInt({ min: 1 }),
        body("nombre", "El nombre es obligatorio").notEmpty().trim(),
        body("email", "El email es inválido").isEmail().normalizeEmail(),
        body("estado", "El estado debe ser activo o inactivo").isIn(["activo", "inactivo"]),
        body("rolId", "El rol es obligatorio").isInt({ min: 1 }),
        validateRequest,
    ],
    asyncWrapper(actualizarUsuarioController)
);

/**
 * @swagger
 * /usuarios/{id}/estado:
 *   patch:
 *     summary: Cambiar estado del usuario
 *     tags: [Usuarios]
 */
// PATCH /api/usuarios/:id/estado
routerUsuarios.patch(
    "/:id/estado",
    [
        authenticateToken,
        checkPermissions(["usuarios.deshabilitar"]),
        param("id", "El id debe ser numérico").isInt({ min: 1 }),
        body("estado", "El estado debe ser activo o inactivo").isIn(["activo", "inactivo"]),
        validateRequest,
    ],
    asyncWrapper(actualizarEstadoUsuarioController)
);

export { routerUsuarios, routerRoles, routerPermisos };
