import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { CrearUsuario, ActualizarUsuario, UsuarioListado } from "../types/usuario.types.js";

// Mapear usuario a shape de respuesta
const mapUsuario = (u: {
    id: number;
    nombre: string;
    email: string | null;
    estado: string;
    createdAt: Date;
    rol: {
        id: number;
        nombre: string;
        rolPermisos: { permiso: { codigo: string } }[];
    };
}): UsuarioListado => ({
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    estado: u.estado,
    rol: { id: u.rol.id, nombre: u.rol.nombre },
    permisos: u.rol.rolPermisos.map((rp) => rp.permiso.codigo),
    createdAt: u.createdAt,
});

// Listar todos los usuarios con rol y permisos
export const listarUsuarios = async (): Promise<UsuarioListado[]> => {
    const usuarios = await prisma.usuario.findMany({
        include: {
            rol: {
                include: {
                    rolPermisos: { include: { permiso: true } },
                },
            },
        },
        orderBy: { createdAt: "asc" },
    });
    return usuarios.map(mapUsuario);
};

// Obtener un usuario por ID
export const obtenerUsuario = async (id: number): Promise<UsuarioListado> => {
    const usuario = await prisma.usuario.findUnique({
        where: { id },
        include: {
            rol: {
                include: {
                    rolPermisos: { include: { permiso: true } },
                },
            },
        },
    });
    if (!usuario) throw new AppError("Usuario no encontrado", 404);
    return mapUsuario(usuario);
};

// Crear usuario con rol y permisos opcionales
export const crearUsuario = async (data: CrearUsuario): Promise<UsuarioListado> => {
    // Verificar que el rol existe
    const rol = await prisma.rol.findUnique({ where: { id: data.rolId } });
    if (!rol) throw new AppError("El rol especificado no existe", 400);

    // Verificar email único
    const emailExistente = await prisma.usuario.findUnique({ where: { email: data.email } });
    if (emailExistente) throw new AppError("El correo electrónico ya está registrado", 409);

    const passwordHash = await bcrypt.hash(data.password, 10);

    const usuario = await prisma.usuario.create({
        data: {
            nombre: data.nombre,
            email: data.email,
            passwordHash,
            rolId: data.rolId,
        },
        include: {
            rol: {
                include: {
                    rolPermisos: { include: { permiso: true } },
                },
            },
        },
    });

    return mapUsuario(usuario);
};

// Actualizar usuario
export const actualizarUsuario = async (id: number, data: ActualizarUsuario): Promise<UsuarioListado> => {
    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({ where: { id } });
    if (!usuarioExistente) throw new AppError("Usuario no encontrado", 404);

    // Verificar que el rol existe
    const rol = await prisma.rol.findUnique({ where: { id: data.rolId } });
    if (!rol) throw new AppError("El rol especificado no existe", 400);

    // Verificar email único excluyendo el usuario actual
    const emailExistente = await prisma.usuario.findFirst({
        where: { email: data.email, id: { not: id } },
    });
    if (emailExistente) throw new AppError("El correo electrónico ya está registrado", 409);

    const updateData: {
        nombre: string;
        email: string;
        estado: string;
        rolId: number;
        passwordHash?: string;
    } = {
        nombre: data.nombre,
        email: data.email,
        estado: data.estado,
        rolId: data.rolId,
    };

    if (data.password) {
        updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const usuario = await prisma.usuario.update({
        where: { id },
        data: updateData,
        include: {
            rol: {
                include: {
                    rolPermisos: { include: { permiso: true } },
                },
            },
        },
    });

    return mapUsuario(usuario);
};

// Cambiar estado del usuario (activo/inactivo)
export const actualizarEstadoUsuario = async (id: number, estado: string): Promise<UsuarioListado> => {
    // Verificar que el usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({ where: { id } });
    if (!usuarioExistente) throw new AppError("Usuario no encontrado", 404);

    const usuario = await prisma.usuario.update({
        where: { id },
        data: { estado },
        include: {
            rol: {
                include: {
                    rolPermisos: { include: { permiso: true } },
                },
            },
        },
    });

    return mapUsuario(usuario);
};

// Listar todos los roles disponibles
export const listarRoles = async () => {
    return await prisma.rol.findMany({
        select: { id: true, nombre: true, descripcion: true, activo: true },
        orderBy: { id: "asc" },
    });
};

// Listar todos los permisos disponibles agrupados por módulo
export const listarPermisos = async () => {
    const permisos = await prisma.permiso.findMany({
        select: { id: true, codigo: true, nombre: true, descripcion: true, modulo: true },
        orderBy: [{ modulo: "asc" }, { codigo: "asc" }],
    });

    // Agrupar por módulo
    const grupos: Record<string, typeof permisos> = {};
    for (const permiso of permisos) {
        if (!grupos[permiso.modulo]) grupos[permiso.modulo] = [];
        grupos[permiso.modulo].push(permiso);
    }

    return grupos;
};
