import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { sendErrorResponse } from "./JSONResponse.js";
import { Response } from "express";

export const errorPrisma = (res: Response, error: PrismaClientKnownRequestError) => {
    switch (error.code) {
        case "P2003": {
            const meta = error.meta as Record<string, unknown> | undefined;
            const field = typeof meta?.field_name === "string" ? meta.field_name : "";
            const modelName = typeof meta?.modelName === "string" ? meta.modelName : "";
            const contextoError = `${field} ${modelName} ${error.message}`.toLowerCase();
            const diccionario: Record<string, string> = {
                rolId: "El Rol",
                usuarioId: "El Usuario",
                materialId: "El Material",
                bodegaId: "La Bodega",
            };
            const campoEncontrado = Object.keys(diccionario).find((k) =>
                contextoError.includes(k.toLowerCase())
            );
            const entidad = campoEncontrado ? diccionario[campoEncontrado] : "El registro relacionado";
            return sendErrorResponse(res, 400, `${entidad} especificado no existe`);
        }
        case "P2002": {
            const campo = error.meta?.target;
            const diccionario: Record<string, string> = {
                email: "Correo Electrónico",
                itemMaterial: "Ítem de Material",
                referencia: "Referencia de Bodega",
            };
            if (Array.isArray(campo) && campo.length >= 1) {
                const traducido = diccionario[campo[0]] || campo[0];
                return sendErrorResponse(res, 409, `El ${traducido} ya está registrado`);
            }
            return sendErrorResponse(res, 409, "Ya existe un registro con esos datos");
        }
        case "P2025":
            return sendErrorResponse(res, 404, "El registro especificado no existe");
        default:
            return sendErrorResponse(res, 500, error.message || "Error desconocido en la base de datos");
    }
};
