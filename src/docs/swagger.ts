import type { OpenAPIV3 } from "openapi-types";

// ──────────────────────────────────────────────────────────────────────────────
// Schemas reutilizables
// ──────────────────────────────────────────────────────────────────────────────

const ErrorResponse: OpenAPIV3.SchemaObject = {
    type: "object",
    properties: {
        status: { type: "string", example: "error" },
        msg: { type: "string", example: "Descripción del error" },
        errors: { type: "array", items: { type: "object" }, description: "Errores de validación (opcional)" },
    },
};

const SuccessResponse = (dataSchema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): OpenAPIV3.SchemaObject => ({
    type: "object",
    properties: {
        status: { type: "string", example: "success" },
        msg: { type: "string", example: "Operación exitosa" },
        data: dataSchema,
    },
});

// ── Entidades ─────────────────────────────────────────────────────────────────

const RolSchema: OpenAPIV3.SchemaObject = {
    type: "object",
    properties: {
        id: { type: "integer", example: 1 },
        nombre: { type: "string", example: "admin" },
        descripcion: { type: "string", example: "Administrador del sistema", nullable: true },
        activo: { type: "boolean", example: true },
    },
};

const PermisoSchema: OpenAPIV3.SchemaObject = {
    type: "object",
    properties: {
        id: { type: "integer", example: 1 },
        codigo: { type: "string", example: "materiales.consultar" },
        nombre: { type: "string", example: "Consultar materiales" },
        descripcion: { type: "string", example: "GET /materiales", nullable: true },
        modulo: { type: "string", example: "MATERIALES" },
    },
};

const UsuarioSchema: OpenAPIV3.SchemaObject = {
    type: "object",
    properties: {
        id: { type: "integer", example: 1 },
        nombre: { type: "string", example: "Admin User" },
        email: { type: "string", format: "email", example: "admin@admin.com", nullable: true },
        estado: { type: "string", enum: ["activo", "inactivo"], example: "activo" },
        rol: {
            type: "object",
            properties: {
                id: { type: "integer", example: 1 },
                nombre: { type: "string", example: "admin" },
            },
        },
        permisos: {
            type: "array",
            items: { type: "string" },
            example: ["dashboard.consultar", "usuarios.crear", "materiales.consultar"],
        },
        createdAt: { type: "string", format: "date-time", example: "2026-01-01T00:00:00.000Z" },
    },
};

const MaterialSchema: OpenAPIV3.SchemaObject = {
    type: "object",
    properties: {
        id: { type: "integer", example: 1 },
        itemMaterial: { type: "string", example: "MAT-001" },
        nombreMaterial: { type: "string", example: "Tela algodón 100%" },
        unidadMedida: { type: "string", example: "metros" },
        estado: { type: "string", enum: ["activo", "inactivo"], example: "activo" },
        createdAt: { type: "string", format: "date-time", example: "2026-01-01T00:00:00.000Z" },
    },
};

const BodegaSchema: OpenAPIV3.SchemaObject = {
    type: "object",
    properties: {
        id: { type: "integer", example: 1 },
        referencia: { type: "string", example: "BOD-001" },
        descripcion: { type: "string", example: "Bodega principal norte" },
        estado: { type: "string", enum: ["activo", "inactivo"], example: "activo" },
        createdAt: { type: "string", format: "date-time", example: "2026-01-01T00:00:00.000Z" },
    },
};

// ── Respuestas comunes ─────────────────────────────────────────────────────────

const r401: OpenAPIV3.ResponseObject = {
    description: "No autorizado — token ausente o inválido",
    content: { "application/json": { schema: ErrorResponse } },
};
const r403: OpenAPIV3.ResponseObject = {
    description: "Prohibido — sin permisos para este recurso",
    content: { "application/json": { schema: ErrorResponse } },
};
const r400: OpenAPIV3.ResponseObject = {
    description: "Solicitud inválida — error de validación",
    content: { "application/json": { schema: ErrorResponse } },
};
const r404: OpenAPIV3.ResponseObject = {
    description: "Recurso no encontrado",
    content: { "application/json": { schema: ErrorResponse } },
};
const r409: OpenAPIV3.ResponseObject = {
    description: "Conflicto — registro duplicado",
    content: { "application/json": { schema: ErrorResponse } },
};
const r500: OpenAPIV3.ResponseObject = {
    description: "Error interno del servidor",
    content: { "application/json": { schema: ErrorResponse } },
};

// ──────────────────────────────────────────────────────────────────────────────
// Especificación completa
// ──────────────────────────────────────────────────────────────────────────────

export const swaggerDocument: OpenAPIV3.Document = {
    openapi: "3.0.3",
    info: {
        title: "SIGOP API",
        version: "1.0.0",
        description: `
## Sistema de Información y Control de Producción

API REST completa para la gestión de inventarios, usuarios, bodegas y materiales de SIGOP.

### Autenticación

La API usa **JWT Bearer tokens**. Para obtener un token:

1. Llama \`POST /auth/login\` con tus credenciales.
2. Copia el valor del campo \`data.token\` de la respuesta.
3. Haz clic en **Authorize** (arriba a la derecha) y pega el token.

Todos los endpoints (salvo los de auth) requieren el header:
\`\`\`
Authorization: Bearer <tu-token>
\`\`\`

### Roles y permisos

| Rol    | Permisos |
|--------|----------|
| admin  | Acceso total — todos los módulos |
| editor | dashboard.consultar · materiales.consultar/actualizar · bodegas.consultar/actualizar |

### Credenciales de prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@admin.com | Admin1234! | admin |
| editor@editor.com | Editor1234! | editor |
        `.trim(),
        contact: {
            name: "Equipo SIGOP",
            email: "dev@sigop.com",
        },
        license: {
            name: "ISC",
        },
    },

    servers: [
        {
            url: "http://localhost:1206/api",
            description: "Desarrollo local",
        },
    ],

    components: {
        securitySchemes: {
            BearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "Token JWT obtenido de `POST /auth/login`",
            },
        },
        schemas: {
            Rol: RolSchema,
            Permiso: PermisoSchema,
            Usuario: UsuarioSchema,
            Material: MaterialSchema,
            Bodega: BodegaSchema,
            ErrorResponse,
        },
    },

    security: [{ BearerAuth: [] }],

    tags: [
        { name: "Auth", description: "Autenticación y gestión de sesión" },
        { name: "Dashboard", description: "Estadísticas y datos de gráficas" },
        { name: "Usuarios", description: "CRUD de usuarios con roles y permisos" },
        { name: "Roles", description: "Consulta de roles disponibles" },
        { name: "Permisos", description: "Consulta de permisos agrupados por módulo" },
        { name: "Materiales", description: "Gestión de materiales del inventario" },
        { name: "Bodegas", description: "Gestión de bodegas" },
    ],

    paths: {

        // ── AUTH ─────────────────────────────────────────────────────────────

        "/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Iniciar sesión",
                description: "Valida credenciales y devuelve un JWT válido por 8 horas.",
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string", format: "email", example: "admin@admin.com" },
                                    password: { type: "string", format: "password", example: "Admin1234!" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Sesión iniciada correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({
                                    type: "object",
                                    properties: {
                                        token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                                        usuario: {
                                            type: "object",
                                            properties: {
                                                id: { type: "integer", example: 1 },
                                                nombre: { type: "string", example: "Admin User" },
                                                email: { type: "string", example: "admin@admin.com" },
                                                rol: { type: "string", example: "admin" },
                                                estado: { type: "string", example: "activo" },
                                            },
                                        },
                                    },
                                }),
                            },
                        },
                    },
                    400: r400,
                    401: {
                        description: "Credenciales incorrectas o cuenta inactiva",
                        content: { "application/json": { schema: ErrorResponse } },
                    },
                    500: r500,
                },
            },
        },

        "/auth/forgot-password": {
            post: {
                tags: ["Auth"],
                summary: "Solicitar restablecimiento de contraseña",
                description: `
Genera un token de reset (válido 1 hora) y envía el enlace de restablecimiento
al **correo del administrador** (no al usuario). Este es el comportamiento heredado del sistema original.

El enlace tendrá la forma:
\`{FRONTEND_URL}/reset-password?token=<token>&email=<email>\`
                `.trim(),
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "emailAdmin"],
                                properties: {
                                    email: {
                                        type: "string",
                                        format: "email",
                                        description: "Correo del usuario que solicita el reset",
                                        example: "editor@editor.com",
                                    },
                                    emailAdmin: {
                                        type: "string",
                                        format: "email",
                                        description: "Correo del administrador que recibirá el enlace",
                                        example: "admin@admin.com",
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Correo de recuperación enviado al administrador",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({ type: "object", nullable: true }),
                            },
                        },
                    },
                    400: r400,
                    404: r404,
                    500: r500,
                },
            },
        },

        "/auth/reset-password": {
            post: {
                tags: ["Auth"],
                summary: "Restablecer contraseña",
                description: "Valida el token y actualiza la contraseña. El token es de un solo uso y expira en 1 hora.",
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "token", "password"],
                                properties: {
                                    email: { type: "string", format: "email", example: "editor@editor.com" },
                                    token: { type: "string", example: "a3f9c2e1d4b7..." },
                                    password: { type: "string", minLength: 6, example: "NuevaPass123!" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Contraseña restablecida correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({ type: "object", nullable: true }),
                            },
                        },
                    },
                    400: { description: "Token inválido, expirado o datos incorrectos", content: { "application/json": { schema: ErrorResponse } } },
                    500: r500,
                },
            },
        },

        "/auth/me": {
            get: {
                tags: ["Auth"],
                summary: "Perfil del usuario autenticado",
                description: "Devuelve los datos del usuario actual junto con su rol y todos sus permisos.",
                responses: {
                    200: {
                        description: "Perfil obtenido correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({
                                    type: "object",
                                    properties: {
                                        id: { type: "integer", example: 1 },
                                        nombre: { type: "string", example: "Admin User" },
                                        email: { type: "string", example: "admin@admin.com" },
                                        estado: { type: "string", example: "activo" },
                                        rol: {
                                            type: "object",
                                            properties: {
                                                id: { type: "integer", example: 1 },
                                                nombre: { type: "string", example: "admin" },
                                            },
                                        },
                                        permisos: {
                                            type: "array",
                                            items: { type: "string" },
                                            example: ["dashboard.consultar", "usuarios.crear"],
                                        },
                                    },
                                }),
                            },
                        },
                    },
                    401: r401,
                    500: r500,
                },
            },
        },

        // ── DASHBOARD ─────────────────────────────────────────────────────────

        "/dashboard/data": {
            get: {
                tags: ["Dashboard"],
                summary: "Datos del dashboard",
                description: `
Devuelve tres colecciones para renderizar el dashboard:

- **totales** — Contadores para las 4 tarjetas (bodegas/materiales activos e inactivos).
- **bodegasReferencias** — Lista de bodegas agrupadas por referencia para la gráfica de barras.
- **materialesItems** — Lista de materiales agrupados por ítem para la segunda gráfica de barras.

Requiere el permiso \`dashboard.consultar\`.
                `.trim(),
                responses: {
                    200: {
                        description: "Datos del dashboard obtenidos correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({
                                    type: "object",
                                    properties: {
                                        totales: {
                                            type: "object",
                                            properties: {
                                                bodegas: {
                                                    type: "object",
                                                    properties: {
                                                        activas: { type: "integer", example: 12 },
                                                        inactivas: { type: "integer", example: 3 },
                                                    },
                                                },
                                                materiales: {
                                                    type: "object",
                                                    properties: {
                                                        activas: { type: "integer", example: 48 },
                                                        inactivas: { type: "integer", example: 7 },
                                                    },
                                                },
                                            },
                                        },
                                        bodegasReferencias: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    referencia: { type: "string", example: "BOD-001" },
                                                    nombre: { type: "string", example: "Bodega norte" },
                                                    estado: { type: "string", example: "activo" },
                                                    total: { type: "integer", example: 1 },
                                                },
                                            },
                                        },
                                        materialesItems: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    item: { type: "string", example: "MAT-001" },
                                                    nombre: { type: "string", example: "Tela algodón" },
                                                    estado: { type: "string", example: "activo" },
                                                    total: { type: "integer", example: 1 },
                                                },
                                            },
                                        },
                                    },
                                }),
                            },
                        },
                    },
                    401: r401,
                    403: r403,
                    500: r500,
                },
            },
        },

        "/dashboard/bodegas/{referencia}": {
            get: {
                tags: ["Dashboard"],
                summary: "Bodegas por referencia",
                description: "Devuelve todos los registros de bodega que tienen la referencia indicada. Se usa en el click de la gráfica de barras.",
                parameters: [
                    {
                        name: "referencia",
                        in: "path",
                        required: true,
                        description: "Código de referencia de la bodega",
                        schema: { type: "string", example: "BOD-001" },
                    },
                ],
                responses: {
                    200: {
                        description: "Bodegas obtenidas correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "integer" },
                                            referencia: { type: "string" },
                                            descripcion: { type: "string" },
                                            estado: { type: "string" },
                                        },
                                    },
                                }),
                            },
                        },
                    },
                    400: r400,
                    401: r401,
                    403: r403,
                    500: r500,
                },
            },
        },

        "/dashboard/materiales/{item}": {
            get: {
                tags: ["Dashboard"],
                summary: "Materiales por ítem",
                description: "Devuelve todos los registros de material con el ítem indicado. Se usa en el click de la gráfica de barras.",
                parameters: [
                    {
                        name: "item",
                        in: "path",
                        required: true,
                        description: "Código de ítem del material",
                        schema: { type: "string", example: "MAT-001" },
                    },
                ],
                responses: {
                    200: {
                        description: "Materiales obtenidos correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "integer" },
                                            itemMaterial: { type: "string" },
                                            nombreMaterial: { type: "string" },
                                            unidadMedida: { type: "string" },
                                            estado: { type: "string" },
                                        },
                                    },
                                }),
                            },
                        },
                    },
                    400: r400,
                    401: r401,
                    403: r403,
                    500: r500,
                },
            },
        },

        // ── ROLES ─────────────────────────────────────────────────────────────

        "/roles": {
            get: {
                tags: ["Roles"],
                summary: "Listar roles",
                description: "Devuelve todos los roles del sistema. Requiere autenticación.",
                responses: {
                    200: {
                        description: "Roles obtenidos correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Rol" },
                                }),
                            },
                        },
                    },
                    401: r401,
                    500: r500,
                },
            },
        },

        // ── PERMISOS ──────────────────────────────────────────────────────────

        "/permisos": {
            get: {
                tags: ["Permisos"],
                summary: "Listar permisos agrupados por módulo",
                description: "Devuelve un objeto donde cada clave es el nombre del módulo y el valor es un arreglo de permisos. Útil para construir el PermisosPopup en el frontend.",
                responses: {
                    200: {
                        description: "Permisos obtenidos correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({
                                    type: "object",
                                    additionalProperties: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/Permiso" },
                                    },
                                    example: {
                                        DASHBOARD: [
                                            { id: 1, codigo: "dashboard.consultar", nombre: "Ver dashboard", modulo: "DASHBOARD" },
                                        ],
                                        MATERIALES: [
                                            { id: 6, codigo: "materiales.consultar", nombre: "Consultar materiales", modulo: "MATERIALES" },
                                            { id: 7, codigo: "materiales.crear", nombre: "Crear materiales", modulo: "MATERIALES" },
                                        ],
                                    },
                                }),
                            },
                        },
                    },
                    401: r401,
                    500: r500,
                },
            },
        },

        // ── USUARIOS ──────────────────────────────────────────────────────────

        "/usuarios": {
            get: {
                tags: ["Usuarios"],
                summary: "Listar usuarios",
                description: "Devuelve todos los usuarios con su rol y la lista de permisos heredados del rol. Requiere `usuarios.consultar`.",
                responses: {
                    200: {
                        description: "Usuarios obtenidos correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Usuario" },
                                }),
                            },
                        },
                    },
                    401: r401,
                    403: r403,
                    500: r500,
                },
            },
            post: {
                tags: ["Usuarios"],
                summary: "Crear usuario",
                description: "Crea un nuevo usuario en el sistema. La contraseña se almacena con hash bcrypt. Requiere `usuarios.crear`.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["nombre", "email", "password", "rolId"],
                                properties: {
                                    nombre: { type: "string", example: "Juan Pérez" },
                                    email: { type: "string", format: "email", example: "juan@empresa.com" },
                                    password: { type: "string", minLength: 6, example: "Segura123!" },
                                    rolId: { type: "integer", description: "ID del rol a asignar", example: 2 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Usuario creado correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({ $ref: "#/components/schemas/Usuario" }),
                            },
                        },
                    },
                    400: r400,
                    401: r401,
                    403: r403,
                    409: r409,
                    500: r500,
                },
            },
        },

        "/usuarios/{id}": {
            put: {
                tags: ["Usuarios"],
                summary: "Actualizar usuario",
                description: "Actualiza nombre, email, contraseña (opcional), estado y rol de un usuario. Requiere `usuarios.actualizar`.",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer", example: 2 },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["nombre", "email", "estado", "rolId"],
                                properties: {
                                    nombre: { type: "string", example: "Juan Pérez Editado" },
                                    email: { type: "string", format: "email", example: "juan.editado@empresa.com" },
                                    password: { type: "string", minLength: 6, description: "Dejar vacío para no cambiar la contraseña" },
                                    estado: { type: "string", enum: ["activo", "inactivo"], example: "activo" },
                                    rolId: { type: "integer", example: 2 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Usuario actualizado correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({ $ref: "#/components/schemas/Usuario" }),
                            },
                        },
                    },
                    400: r400,
                    401: r401,
                    403: r403,
                    404: r404,
                    409: r409,
                    500: r500,
                },
            },
        },

        "/usuarios/{id}/estado": {
            patch: {
                tags: ["Usuarios"],
                summary: "Cambiar estado del usuario",
                description: "Activa o desactiva un usuario. Útil para el toggle de estado en la tabla de usuarios. Requiere `usuarios.deshabilitar`.",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer", example: 2 },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["estado"],
                                properties: {
                                    estado: { type: "string", enum: ["activo", "inactivo"], example: "inactivo" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Estado actualizado correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({ $ref: "#/components/schemas/Usuario" }),
                            },
                        },
                    },
                    400: r400,
                    401: r401,
                    403: r403,
                    404: r404,
                    500: r500,
                },
            },
        },

        // ── MATERIALES ────────────────────────────────────────────────────────

        "/materiales": {
            get: {
                tags: ["Materiales"],
                summary: "Listar materiales",
                description: "Devuelve la lista de materiales filtrada por estado. Requiere `materiales.consultar`.",
                parameters: [
                    {
                        name: "estado",
                        in: "query",
                        required: false,
                        description: "Filtro de estado (por defecto: `activo`)",
                        schema: { type: "string", enum: ["activo", "inactivo"], default: "activo" },
                    },
                ],
                responses: {
                    200: {
                        description: "Materiales obtenidos correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Material" },
                                }),
                            },
                        },
                    },
                    401: r401,
                    403: r403,
                    500: r500,
                },
            },
            post: {
                tags: ["Materiales"],
                summary: "Crear material",
                description: "Registra un nuevo material con estado `activo`. El `itemMaterial` debe ser único. Requiere `materiales.crear`.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["itemMaterial", "nombreMaterial", "unidadMedida"],
                                properties: {
                                    itemMaterial: { type: "string", example: "MAT-042" },
                                    nombreMaterial: { type: "string", example: "Poliéster reciclado" },
                                    unidadMedida: { type: "string", example: "kg" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Material creado correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({ $ref: "#/components/schemas/Material" }),
                            },
                        },
                    },
                    400: r400,
                    401: r401,
                    403: r403,
                    409: r409,
                    500: r500,
                },
            },
        },

        "/materiales/{id}": {
            put: {
                tags: ["Materiales"],
                summary: "Actualizar material",
                description: "Actualiza nombre y unidad de medida. El `itemMaterial` no es modificable. Requiere `materiales.actualizar`.",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer", example: 1 },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["nombreMaterial", "unidadMedida"],
                                properties: {
                                    nombreMaterial: { type: "string", example: "Poliéster reciclado premium" },
                                    unidadMedida: { type: "string", example: "toneladas" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Material actualizado correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({ $ref: "#/components/schemas/Material" }),
                            },
                        },
                    },
                    400: r400,
                    401: r401,
                    403: r403,
                    404: r404,
                    500: r500,
                },
            },
        },

        "/materiales/{id}/inhabilitar": {
            patch: {
                tags: ["Materiales"],
                summary: "Cambiar estado del material",
                description: "Habilita o inhabilita un material (soft-disable). Requiere `materiales.deshabilitar`.",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer", example: 1 },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["estado"],
                                properties: {
                                    estado: { type: "string", enum: ["activo", "inactivo"], example: "inactivo" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Estado del material actualizado",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({ $ref: "#/components/schemas/Material" }),
                            },
                        },
                    },
                    400: r400,
                    401: r401,
                    403: r403,
                    404: r404,
                    500: r500,
                },
            },
        },

        // ── BODEGAS ───────────────────────────────────────────────────────────

        "/bodegas": {
            get: {
                tags: ["Bodegas"],
                summary: "Listar bodegas",
                description: "Devuelve la lista de bodegas filtrada por estado. Requiere `bodegas.consultar`.",
                parameters: [
                    {
                        name: "estado",
                        in: "query",
                        required: false,
                        description: "Filtro de estado (por defecto: `activo`)",
                        schema: { type: "string", enum: ["activo", "inactivo"], default: "activo" },
                    },
                ],
                responses: {
                    200: {
                        description: "Bodegas obtenidas correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Bodega" },
                                }),
                            },
                        },
                    },
                    401: r401,
                    403: r403,
                    500: r500,
                },
            },
            post: {
                tags: ["Bodegas"],
                summary: "Crear bodega",
                description: "Registra una nueva bodega con estado `activo`. La `referencia` debe ser única. Requiere `bodegas.crear`.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["referencia", "descripcion"],
                                properties: {
                                    referencia: { type: "string", example: "BOD-007" },
                                    descripcion: { type: "string", example: "Bodega de materias primas sur" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Bodega creada correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({ $ref: "#/components/schemas/Bodega" }),
                            },
                        },
                    },
                    400: r400,
                    401: r401,
                    403: r403,
                    409: r409,
                    500: r500,
                },
            },
        },

        "/bodegas/{id}": {
            put: {
                tags: ["Bodegas"],
                summary: "Actualizar bodega",
                description: "Actualiza referencia y descripción. La nueva referencia debe ser única. Requiere `bodegas.actualizar`.",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer", example: 1 },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["referencia", "descripcion"],
                                properties: {
                                    referencia: { type: "string", example: "BOD-007-A" },
                                    descripcion: { type: "string", example: "Bodega de materias primas sur — zona A" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Bodega actualizada correctamente",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({ $ref: "#/components/schemas/Bodega" }),
                            },
                        },
                    },
                    400: r400,
                    401: r401,
                    403: r403,
                    404: r404,
                    409: r409,
                    500: r500,
                },
            },
        },

        "/bodegas/{id}/inhabilitar": {
            patch: {
                tags: ["Bodegas"],
                summary: "Cambiar estado de la bodega",
                description: "Habilita o inhabilita una bodega (soft-disable). Requiere `bodegas.deshabilitar`.",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer", example: 1 },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["estado"],
                                properties: {
                                    estado: { type: "string", enum: ["activo", "inactivo"], example: "inactivo" },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Estado de la bodega actualizado",
                        content: {
                            "application/json": {
                                schema: SuccessResponse({ $ref: "#/components/schemas/Bodega" }),
                            },
                        },
                    },
                    400: r400,
                    401: r401,
                    403: r403,
                    404: r404,
                    500: r500,
                },
            },
        },
    },
};
