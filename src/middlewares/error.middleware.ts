import { NextFunction, Request, Response } from "express";
import { sendErrorResponse } from "../utils/JSONResponse.js";
import { AppError } from "../utils/AppError.js";
import { errorPrisma } from "../utils/PrismaErrors.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const errorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        return sendErrorResponse(res, err.statusCode, err.message, err.errores);
    }
    if (err instanceof PrismaClientKnownRequestError) {
        return errorPrisma(res, err);
    }
    if (err instanceof Error) {
        return sendErrorResponse(res, 500, err.message || "Error interno del servidor");
    }
    return sendErrorResponse(res, 500, "Error interno del servidor");
};
