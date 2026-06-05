import { Response } from "express";
import { sendSuccessResponse } from "../utils/JSONResponse.js";
import { login, forgotPassword, resetPassword, getMe } from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

// POST /api/auth/login
export async function loginController(req: AuthenticatedRequest, res: Response) {
    const { email, password } = req.body;
    const data = await login(email, password);
    return sendSuccessResponse(res, 200, "Inicio de sesión exitoso", data);
}

// POST /api/auth/forgot-password
export async function forgotPasswordController(req: AuthenticatedRequest, res: Response) {
    const { email, emailAdmin } = req.body;
    await forgotPassword(email, emailAdmin);
    return sendSuccessResponse(res, 200, "Correo de recuperación enviado al administrador");
}

// POST /api/auth/reset-password
export async function resetPasswordController(req: AuthenticatedRequest, res: Response) {
    const { email, token, password } = req.body;
    await resetPassword(email, token, password);
    return sendSuccessResponse(res, 200, "Contraseña restablecida correctamente");
}

// GET /api/auth/me
export async function getMeController(req: AuthenticatedRequest, res: Response) {
    if (!req.user?.id) throw new AppError("Usuario no autenticado", 401);
    const data = await getMe(req.user.id);
    return sendSuccessResponse(res, 200, "Perfil obtenido correctamente", data);
}
