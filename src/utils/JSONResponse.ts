import { Response } from "express";

export const sendErrorResponse = (res: Response, statusCode: number, message: string, errors?: unknown) => {
    const response: Record<string, unknown> = { status: "error", msg: message };
    if (errors) response.errors = errors;
    res.status(statusCode).json(response);
};

export const sendSuccessResponse = (res: Response, statusCode: number, message: string, data?: unknown) => {
    const response: Record<string, unknown> = { status: "success", msg: message };
    if (data !== undefined) response.data = data;
    res.status(statusCode).json(response);
};
