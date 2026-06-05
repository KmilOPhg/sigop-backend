import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { enviarCorreo } from "../utils/mailer.js";
import type { AuthResponse, MeResponse } from "../types/auth.types.js";

// Verificar credenciales y emitir JWT
export const login = async (email: string, password: string): Promise<AuthResponse> => {
    // Buscar usuario por email incluyendo el rol
    const usuario = await prisma.usuario.findUnique({
        where: { email },
        include: { rol: true },
    });
    if (!usuario) throw new AppError("Credenciales incorrectas", 401);

    // Verificar que la cuenta esté activa
    if (usuario.estado !== "activo") {
        throw new AppError("Tu cuenta está inactiva. Contacta al administrador.", 401);
    }

    // Verificar contraseña con bcrypt
    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) throw new AppError("Credenciales incorrectas", 401);

    // Generar JWT con 8 horas de vigencia
    const token = jwt.sign(
        {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rolId: usuario.rolId,
            estado: usuario.estado,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "8h" }
    );

    return {
        token,
        usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol.nombre,
            estado: usuario.estado,
        },
    };
};

// Generar token de reset y enviar correo al email del administrador
export const forgotPassword = async (email: string, emailAdmin: string): Promise<void> => {
    // Verificar que el usuario solicitante existe
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) throw new AppError("No se encontró un usuario con ese correo", 404);

    // Generar token único y fecha de expiración (1 hora)
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    // Guardar token en BD
    await prisma.usuario.update({
        where: { id: usuario.id },
        data: { resetToken: token, resetTokenExpiry: expiry },
    });

    // Construir enlace de restablecimiento apuntando al frontend
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Enviar correo al administrador (comportamiento original SIGOP)
    await enviarCorreo(
        emailAdmin,
        "Solicitud de restablecimiento de contraseña — SIGOP",
        `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f9faf5;">
            <div style="background: #0e1c2b; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; font-size: 20px; margin: 0; font-weight: 900; letter-spacing: -0.02em;">SIGOP</h1>
                <p style="color: #8b99ac; font-size: 11px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 0.1em;">Control de Producción</p>
            </div>
            <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e2e3df; border-top: none;">
                <h2 style="color: #0e1c2b; font-size: 16px; font-weight: 700; margin: 0 0 8px;">Solicitud de restablecimiento</h2>
                <p style="color: #454652; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">
                    El usuario <strong>${usuario.nombre}</strong> ha solicitado restablecer su contraseña.
                </p>
                <p style="color: #454652; font-size: 13px; margin: 0 0 24px;">Correo: <strong>${email}</strong></p>
                <a href="${resetLink}"
                   style="display: inline-block; background: linear-gradient(90deg, #0e1c2b, #233141); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
                    Restablecer Contraseña
                </a>
                <p style="color: #767683; font-size: 11px; margin: 24px 0 0;">Este enlace expirará en 1 hora. Si no reconoce esta solicitud, ignore este correo.</p>
            </div>
        </div>
        `
    );
};

// Validar token y actualizar contraseña
export const resetPassword = async (email: string, token: string, password: string): Promise<void> => {
    // Buscar usuario por email
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) throw new AppError("Token inválido o expirado", 400);

    // Verificar token
    if (usuario.resetToken !== token) throw new AppError("Token inválido o expirado", 400);

    // Verificar expiración
    if (!usuario.resetTokenExpiry || usuario.resetTokenExpiry < new Date()) {
        throw new AppError("El enlace de restablecimiento ha expirado. Solicita uno nuevo.", 400);
    }

    // Actualizar contraseña y limpiar token
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.usuario.update({
        where: { id: usuario.id },
        data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });
};

// Obtener perfil del usuario autenticado con permisos
export const getMe = async (usuarioId: number): Promise<MeResponse> => {
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        include: {
            rol: {
                include: {
                    rolPermisos: {
                        include: { permiso: true },
                    },
                },
            },
        },
    });
    if (!usuario) throw new AppError("Usuario no encontrado", 404);

    return {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        estado: usuario.estado,
        rol: {
            id: usuario.rol.id,
            nombre: usuario.rol.nombre,
        },
        permisos: usuario.rol.rolPermisos.map((rp: { permiso: { codigo: string } }) => rp.permiso.codigo),
    };
};
