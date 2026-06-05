import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";

// ─── Roles ────────────────────────────────────────────────────────────────────

async function seedRoles() {
    const roles = [
        { nombre: "admin", descripcion: "Administrador del sistema — acceso total" },
        { nombre: "editor", descripcion: "Editor — gestión de inventarios" },
    ] as const;

    for (const r of roles) {
        await prisma.rol.upsert({
            where: { nombre: r.nombre },
            create: { nombre: r.nombre, descripcion: r.descripcion, activo: true },
            update: { descripcion: r.descripcion, activo: true },
        });
    }

    const result = await prisma.rol.findMany({ select: { id: true, nombre: true } });
    console.log("✔ Roles:");
    console.table(result);
    return result;
}

// ─── Permisos ─────────────────────────────────────────────────────────────────

async function seedPermisos() {
    const permisos = [
        // Dashboard
        { codigo: "dashboard.consultar", nombre: "Ver dashboard", descripcion: "GET /dashboard/data", modulo: "DASHBOARD" },
        // Usuarios
        { codigo: "usuarios.crear", nombre: "Crear usuarios", descripcion: "POST /usuarios", modulo: "USUARIOS" },
        { codigo: "usuarios.consultar", nombre: "Consultar usuarios", descripcion: "GET /usuarios", modulo: "USUARIOS" },
        { codigo: "usuarios.actualizar", nombre: "Actualizar usuarios", descripcion: "PUT /usuarios/:id", modulo: "USUARIOS" },
        { codigo: "usuarios.deshabilitar", nombre: "Deshabilitar usuarios", descripcion: "PATCH /usuarios/:id/estado", modulo: "USUARIOS" },
        // Materiales
        { codigo: "materiales.crear", nombre: "Crear materiales", descripcion: "POST /materiales", modulo: "MATERIALES" },
        { codigo: "materiales.consultar", nombre: "Consultar materiales", descripcion: "GET /materiales", modulo: "MATERIALES" },
        { codigo: "materiales.actualizar", nombre: "Actualizar materiales", descripcion: "PUT /materiales/:id", modulo: "MATERIALES" },
        { codigo: "materiales.deshabilitar", nombre: "Inhabilitar materiales", descripcion: "PATCH /materiales/:id/inhabilitar", modulo: "MATERIALES" },
        // Bodegas
        { codigo: "bodegas.crear", nombre: "Crear bodegas", descripcion: "POST /bodegas", modulo: "BODEGAS" },
        { codigo: "bodegas.consultar", nombre: "Consultar bodegas", descripcion: "GET /bodegas", modulo: "BODEGAS" },
        { codigo: "bodegas.actualizar", nombre: "Actualizar bodegas", descripcion: "PUT /bodegas/:id", modulo: "BODEGAS" },
        { codigo: "bodegas.deshabilitar", nombre: "Inhabilitar bodegas", descripcion: "PATCH /bodegas/:id/inhabilitar", modulo: "BODEGAS" },
    ];

    for (const permiso of permisos) {
        await prisma.permiso.upsert({
            where: { codigo: permiso.codigo },
            create: permiso,
            update: permiso,
        });
    }

    const result = await prisma.permiso.findMany({ select: { id: true, codigo: true, modulo: true } });
    console.log("✔ Permisos:");
    console.table(result);
    return result;
}

// ─── RolPermisos ──────────────────────────────────────────────────────────────

async function seedRolPermisos(roles: { id: number; nombre: string }[]) {
    const adminRol = roles.find((r) => r.nombre === "admin")!;
    const editorRol = roles.find((r) => r.nombre === "editor")!;

    const todosLosPermisos = await prisma.permiso.findMany({ select: { id: true, codigo: true } });

    // Admin: todos los permisos
    for (const permiso of todosLosPermisos) {
        await prisma.rolPermiso.upsert({
            where: { rolId_permisoId: { rolId: adminRol.id, permisoId: permiso.id } },
            create: { rolId: adminRol.id, permisoId: permiso.id },
            update: {},
        });
    }

    // Editor: permisos de consulta y edición limitada
    const codigosEditor = [
        "dashboard.consultar",
        "materiales.consultar",
        "materiales.actualizar",
        "bodegas.consultar",
        "bodegas.actualizar",
    ];
    const permisosEditor = todosLosPermisos.filter((p: { id: number; codigo: string }) => codigosEditor.includes(p.codigo));
    for (const permiso of permisosEditor) {
        await prisma.rolPermiso.upsert({
            where: { rolId_permisoId: { rolId: editorRol.id, permisoId: permiso.id } },
            create: { rolId: editorRol.id, permisoId: permiso.id },
            update: {},
        });
    }

    console.log("✔ RolPermisos asignados.");
}

// ─── Usuarios ─────────────────────────────────────────────────────────────────

async function seedUsuarios(roles: { id: number; nombre: string }[]) {
    const adminRol = roles.find((r) => r.nombre === "admin")!;
    const editorRol = roles.find((r) => r.nombre === "editor")!;

    const usuarios = [
        { nombre: "Admin User", email: "admin@admin.com", password: "Admin1234!", rolId: adminRol.id },
        { nombre: "Editor User", email: "editor@editor.com", password: "Editor1234!", rolId: editorRol.id },
    ];

    for (const u of usuarios) {
        const passwordHash = await bcrypt.hash(u.password, 10);
        await prisma.usuario.upsert({
            where: { email: u.email },
            create: { nombre: u.nombre, email: u.email, passwordHash, rolId: u.rolId },
            update: { nombre: u.nombre, passwordHash, rolId: u.rolId },
        });
    }

    const result = await prisma.usuario.findMany({ select: { id: true, nombre: true, email: true } });
    console.log("✔ Usuarios:");
    console.table(result);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log("🌱 Iniciando seed...\n");
    const roles = await seedRoles();
    await seedPermisos();
    await seedRolPermisos(roles);
    await seedUsuarios(roles);
    console.log("\n✅ Seed completado.");
    console.log("Credenciales:");
    console.log("  admin@admin.com   / Admin1234!");
    console.log("  editor@editor.com / Editor1234!");
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("❌ Error en seed:", e);
        process.exit(1);
    });
