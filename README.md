# SIGOP Backend

> API REST para el **Sistema de Información y Control de Producción** — construida con Node.js, Express, TypeScript, Prisma y PostgreSQL.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js 22 + TypeScript 5 |
| Framework HTTP | Express 4 |
| ORM | Prisma 6 (PostgreSQL) |
| Autenticación | JWT (jsonwebtoken) + bcrypt |
| Validación | express-validator |
| Email | Nodemailer |
| Documentación | Swagger UI / OpenAPI 3.0 |
| Logger | Morgan |
| Dev server | tsx watch |

---

## Requisitos previos

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14 corriendo localmente (o en la nube)
- Acceso SMTP para el envío de correos de recuperación (puede usarse Gmail/Mailtrap en desarrollo)

---

## Instalación y puesta en marcha

```bash
# 1. Clonar / ubicarse en el directorio
cd sigop-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
#    Editar .env con los valores de tu entorno (ver sección Variables de entorno)

# 4. Generar el cliente de Prisma
npx prisma generate

# 5. Ejecutar migraciones (crea las tablas en PostgreSQL)
npx prisma migrate dev --name init

# 6. Poblar la base de datos con datos iniciales
npm run db:seed

# 7. Iniciar el servidor en modo desarrollo
npm run dev
```

El servidor queda disponible en **http://localhost:1206**

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot-reload (`tsx watch`) |
| `npm run build` | Compilar TypeScript a `dist/` |
| `npm run prod` | Iniciar desde el build compilado |
| `npm run typecheck` | Verificar tipos sin compilar |
| `npm run db:migrate` | Crear y aplicar una migración nueva |
| `npm run db:seed` | Ejecutar el seed (roles, permisos, usuarios) |
| `npm run db:reset` | Eliminar y recrear la base de datos |
| `npm run db:reset:seed` | Reset + seed en un solo paso |
| `npm run deploy` | Aplicar migraciones + seed (para producción) |

---

## Variables de entorno

Copiar `.env.example` a `.env` y completar los valores:

```env
# Servidor
PORT=1206

# Base de datos PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/sigop_backend?schema=public"

# JWT — usar un secreto fuerte en producción (openssl rand -hex 64)
JWT_SECRET="cambia_este_secreto_en_produccion"

# URL del frontend (para construir el enlace de reset de contraseña)
FRONTEND_URL="http://localhost:5173"

# Correo saliente (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu@email.com
MAIL_PASS=tu_password_de_aplicacion
MAIL_FROM="SIGOP <noreply@sigop.com>"
```

> **Tip para Gmail:** activar la autenticación en dos pasos y crear una [contraseña de aplicación](https://support.google.com/accounts/answer/185833).
> **Para desarrollo:** usar [Mailtrap](https://mailtrap.io) para capturar los correos sin enviarlos realmente.

---

## Documentación interactiva

Con el servidor corriendo, abre en el navegador:

```
http://localhost:1206/api-docs
```

La especificación OpenAPI 3.0 completa también está disponible como JSON en:

```
http://localhost:1206/api-docs.json
```

---

## Arquitectura

```
sigop-backend/
├── prisma/
│   └── schema.prisma          # Modelos de BD (Usuario, Rol, Permiso, Material, Bodega)
├── lib/
│   └── prisma.ts              # Singleton del cliente Prisma
└── src/
    ├── app.ts                 # Express app (middlewares, rutas, Swagger UI)
    ├── index.ts               # Punto de entrada — conecta BD e inicia el servidor
    ├── server.ts              # Lógica de conexión a PostgreSQL
    ├── controllers/           # Reciben la petición, delegan al servicio y responden
    ├── services/              # Lógica de negocio + consultas Prisma
    ├── routes/                # Definición de rutas con validaciones y middlewares
    ├── middlewares/
    │   ├── auth.middleware.ts  # authenticateToken · checkPermissions · validateRequest
    │   └── error.middleware.ts # Handler global de errores
    ├── types/                 # Tipos TypeScript por dominio
    ├── utils/
    │   ├── AppError.ts        # Error personalizado con statusCode
    │   ├── AsyncWrapper.ts    # Envuelve controladores async sin try/catch
    │   ├── JSONResponse.ts    # Helpers sendSuccessResponse / sendErrorResponse
    │   ├── PrismaErrors.ts    # Mapeo de errores Prisma (P2002, P2025, etc.)
    │   └── mailer.ts          # Transporter de Nodemailer
    ├── scripts/
    │   └── seed.ts            # Seed: roles, permisos, usuarios iniciales
    └── docs/
        └── swagger.ts         # Especificación OpenAPI 3.0 completa
```

---

## Modelo de datos

```
Usuario ──── Rol ──── RolPermiso ──── Permiso
    │
    └── Material
```

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Usuarios del sistema con hash de contraseña y token de reset |
| `roles` | Roles disponibles (admin, editor) |
| `permisos` | Permisos granulares por módulo (`modulo.verbo`) |
| `rol_permisos` | Relación muchos a muchos entre roles y permisos |
| `materiales` | Inventario de materiales con estado activo/inactivo |
| `bodega` | Bodegas con estado activo/inactivo |

---

## Endpoints

### Auth — `/api/auth`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/login` | — | Inicia sesión, devuelve JWT (8h) |
| `POST` | `/forgot-password` | — | Genera token y envía enlace al email del admin |
| `POST` | `/reset-password` | — | Valida token y actualiza contraseña |
| `GET`  | `/me` | ✓ | Perfil del usuario autenticado con permisos |

### Dashboard — `/api/dashboard`

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| `GET` | `/data` | `dashboard.consultar` | Stats + datos para 4 gráficas ECharts |
| `GET` | `/bodegas/:referencia` | `dashboard.consultar` | Bodegas de una referencia (click en barra) |
| `GET` | `/materiales/:item` | `dashboard.consultar` | Materiales de un ítem (click en barra) |

### Usuarios — `/api/usuarios`

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| `GET`   | `/` | `usuarios.consultar` | Listar con rol y permisos |
| `POST`  | `/` | `usuarios.crear` | Crear usuario |
| `PUT`   | `/:id` | `usuarios.actualizar` | Actualizar datos |
| `PATCH` | `/:id/estado` | `usuarios.deshabilitar` | Toggle activo/inactivo |

### Roles y Permisos

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/roles` | Lista de roles disponibles |
| `GET` | `/api/permisos` | Permisos agrupados por módulo |

### Materiales — `/api/materiales`

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| `GET`   | `/?estado=activo\|inactivo` | `materiales.consultar` | Listar con filtro |
| `POST`  | `/` | `materiales.crear` | Crear material |
| `PUT`   | `/:id` | `materiales.actualizar` | Actualizar nombre y unidad |
| `PATCH` | `/:id/inhabilitar` | `materiales.deshabilitar` | Toggle activo/inactivo |

### Bodegas — `/api/bodegas`

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| `GET`   | `/?estado=activo\|inactivo` | `bodegas.consultar` | Listar con filtro |
| `POST`  | `/` | `bodegas.crear` | Crear bodega |
| `PUT`   | `/:id` | `bodegas.actualizar` | Actualizar referencia y descripción |
| `PATCH` | `/:id/inhabilitar` | `bodegas.deshabilitar` | Toggle activo/inactivo |

---

## Sistema de permisos

Los permisos siguen la convención `modulo.verbo`:

```
dashboard.consultar

usuarios.crear       usuarios.consultar    usuarios.actualizar    usuarios.deshabilitar

materiales.crear     materiales.consultar  materiales.actualizar  materiales.deshabilitar

bodegas.crear        bodegas.consultar     bodegas.actualizar     bodegas.deshabilitar
```

| Rol | Permisos |
|-----|----------|
| `admin` | Todos los permisos |
| `editor` | `dashboard.consultar` · `materiales.consultar` · `materiales.actualizar` · `bodegas.consultar` · `bodegas.actualizar` |

---

## Credenciales iniciales (seed)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `admin@admin.com` | `Admin1234!` | admin |
| `editor@editor.com` | `Editor1234!` | editor |

> **Importante:** cambiar estas contraseñas antes de desplegar en producción.

---

## Formato de respuestas

Todas las respuestas siguen la misma estructura:

```json
// Éxito
{ "status": "success", "msg": "Descripción", "data": { ... } }

// Error
{ "status": "error", "msg": "Descripción del error", "errors": [ ... ] }
```

Los códigos HTTP usados son: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`.

---

## Flujo de recuperación de contraseña

1. El usuario ingresa su email y el email del administrador en el formulario de olvido de contraseña.
2. El backend genera un token UUID aleatorio con expiración de 1 hora.
3. **El enlace de reset se envía al correo del administrador** (comportamiento original del sistema Laravel).
4. El administrador reenvía el enlace al usuario.
5. El usuario visita `{FRONTEND_URL}/reset-password?token=<token>&email=<email>`.
6. El backend valida el token, actualiza la contraseña con hash bcrypt y limpia el token.
