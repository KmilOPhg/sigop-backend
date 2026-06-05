import { Response } from "express";
import { sendSuccessResponse } from "../utils/JSONResponse.js";
import { AppError } from "../utils/AppError.js";
import {
    listarUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    actualizarEstadoUsuario,
    listarRoles,
    listarPermisos,
} from "../services/usuarios.service.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

// GET /api/usuarios
export async function listarUsuariosController(req: AuthenticatedRequest, res: Response) {
    const data = await listarUsuarios();
    return sendSuccessResponse(res, 200, "Usuarios obtenidos correctamente", data);
}

// POST /api/usuarios
export async function crearUsuarioController(req: AuthenticatedRequest, res: Response) {
    const data = await crearUsuario({
        nombre: req.body.nombre,
        email: req.body.email,
        password: req.body.password,
        rolId: Number(req.body.rolId),
    });
    return sendSuccessResponse(res, 201, "Usuario creado correctamente", data);
}

// PUT /api/usuarios/:id
export async function actualizarUsuarioController(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError("El id debe ser un número", 400);
    const data = await actualizarUsuario(id, {
        nombre: req.body.nombre,
        email: req.body.email,
        password: req.body.password,
        estado: req.body.estado,
        rolId: Number(req.body.rolId),
    });
    return sendSuccessResponse(res, 200, "Usuario actualizado correctamente", data);
}

// PATCH /api/usuarios/:id/estado
export async function actualizarEstadoUsuarioController(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError("El id debe ser un número", 400);
    const data = await actualizarEstadoUsuario(id, req.body.estado);
    return sendSuccessResponse(res, 200, "Estado del usuario actualizado correctamente", data);
}

// GET /api/roles
export async function listarRolesController(req: AuthenticatedRequest, res: Response) {
    const data = await listarRoles();
    return sendSuccessResponse(res, 200, "Roles obtenidos correctamente", data);
}

// GET /api/permisos
export async function listarPermisosController(req: AuthenticatedRequest, res: Response) {
    const data = await listarPermisos();
    return sendSuccessResponse(res, 200, "Permisos obtenidos correctamente", data);
}
