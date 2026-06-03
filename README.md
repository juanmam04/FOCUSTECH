# Focus Tech — E-commerce

Tienda online de tecnología (auriculares, cargadores, cables y accesorios) con frontend React, backend Express y base de datos **PostgreSQL (Supabase)**.

## Estructura

```
FOCUSTECH/
├── frontend/     # React + Vite
├── backend/      # Node.js + Express + PostgreSQL (Supabase)
└── README.md
```

## Requisitos

- Node.js 20+
- Proyecto [Supabase](https://supabase.com) con PostgreSQL

## 1. Base de datos (Supabase)

1. En **Supabase → Settings → Database**, copiá la contraseña del proyecto.
2. En **`.env.local`** (raíz del proyecto), configurá `DATABASE_URL` y `DB_PASSWORD` (Session pooler, puerto **5432**):

```
postgresql://postgres.vdblqxmwbhtwlwckvila:[TU-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```

3. Creá las tablas y datos iniciales:

```bash
# Editá .env.local en la raíz con tu contraseña real (reemplazá [YOUR-PASSWORD])
cd backend
npm install
npm run db:schema
npm run db:seed
```

El seed crea:

- **Admin:** `admin@focustech.com` / `Admin123456`
- Categorías: Auriculares, Cargadores, Cables, Accesorios
- Productos de prueba

## 2. Instalar dependencias (raíz del proyecto)

Desde la carpeta `FOCUSTECH`:

```bash
npm run install:all
```

(O manualmente: `npm install` en la raíz, luego `npm install` en `backend` y `frontend`.)

## 3. Iniciar en desarrollo

**Desde la raíz** (recomendado — levanta backend y frontend a la vez):

```bash
npm run dev
```

- API: `http://localhost:5000`
- Tienda: `http://localhost:1748`

También podés iniciar por separado:

```bash
npm run dev:backend   # solo API
npm run dev:frontend  # solo tienda
```

### Solo backend o solo frontend

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

- Acceso admin: `http://localhost:1748/acceso` → redirige a `http://localhost:1748/panel`

### Variables de entorno (frontend)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base de la API (default: `/api` con proxy Vite) |
| `VITE_UPLOADS_URL` | URL del servidor de uploads |
| `VITE_WHATSAPP_NUMBER` | Número WhatsApp sin + (ej. `59899000000`) |

## Funcionalidades

### Tienda (público)

- Home con categorías y productos destacados desde API
- Catálogo con filtros, búsqueda y orden
- Detalle de producto con galería y relacionados
- Carrito en `localStorage`
- Checkout con transferencia o WhatsApp
- Confirmación de pedido con enlace a WhatsApp

### Admin (JWT)

- Dashboard con métricas
- CRUD productos (imágenes con Multer)
- CRUD categorías
- Gestión de pedidos y estados

### Pagos

- Transferencia bancaria y coordinación por WhatsApp
- **Supabase:** cliente en `frontend/src/utils/supabase/` (adaptado a Vite, ver abajo)
- **Mercado Pago:** preparado en `backend/src/config/mercadopago.js` (sin implementar)

### Supabase (Vite, no Next.js)

Variables en `frontend/.env.local`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

| Guía Next.js | Este proyecto |
|--------------|---------------|
| `NEXT_PUBLIC_*` | `VITE_*` |
| `middleware.ts` | `session.js` + `SupabaseProvider` |
| `page.tsx` server | `useSupabase()` en componentes cliente |

```jsx
import { useSupabase } from './context/SupabaseProvider';
const { supabase, user } = useSupabase();
```

## Endpoints principales

| Método | Ruta | Acceso |
|--------|------|--------|
| POST | `/api/auth/login` | Público |
| GET | `/api/products` | Público (activos) |
| POST | `/api/orders` | Público |
| GET | `/api/admin/dashboard` | Admin |
| POST | `/api/products` | Admin |

## Scripts

| Dónde | Comando | Descripción |
|-------|---------|-------------|
| **raíz** | `npm run dev` | Backend + frontend juntos |
| raíz | `npm run install:all` | Instala deps en los 3 package.json |
| raíz | `npm run db:schema` | Crear tablas en Supabase PostgreSQL |
| raíz | `npm run db:analytics` | Tablas de tráfico y métricas (si ya tenés schema) |
| raíz | `npm run db:seed` | Datos iniciales |
| backend | `npm run dev` | Solo API (nodemon) |
| frontend | `npm run dev` | Solo tienda (Vite) |
| frontend | `npm run build` | Build producción |

## Producción

1. Configurá `FRONTEND_URL` en el backend para CORS.
2. Serví el build del frontend y la API en el mismo dominio o configurá CORS.
3. Para imágenes en producción, migrá de `/uploads` local a Cloudinary o S3 (estructura preparada en Multer).

## Licencia

Proyecto privado — Focus Tech.
