# Calculadora de Tinta — Fase 0

Aplicativo para calcular el consumo teórico de tinta a partir de la ficha
técnica y hacer seguimiento contra el consumo real. Ver el plan de fases
completo (`Plan_Fases_Aplicativo_Tintas.docx`).

Esta es la **Fase 0**: infraestructura base (proyecto, base de datos, login)
lista y probada, sin lógica de negocio todavía.

- Repo: https://github.com/nicowhite09/Calculadora_de_tinta
- Proyecto Supabase: `Calculadora_de_tinta`

## Stack

React + TypeScript (Vite) · Tailwind CSS · Supabase (Postgres + Auth + RLS)
· Microsoft Entra ID (vía Supabase Auth) · Vercel

## Checklist de configuración (hacer una sola vez)

### 1. Base de datos en Supabase

1. Entra a tu proyecto `Calculadora_de_tinta` en https://supabase.com/dashboard.
2. Ve a **SQL Editor** → **New query**.
3. Copia y pega el contenido completo de `supabase/migrations/0001_init.sql`
   y dale **Run**. Esto crea las tablas `tintas`, `marcas`,
   `ordenes_produccion`, `consumos`, `user_roles` y todas las políticas RLS.
4. Verifica en **Table Editor** que las 5 tablas aparecen.

### 2. Variables de entorno del proyecto

1. En Supabase, ve a **Settings → API**.
2. Copia **Project URL** y **anon public key**.
3. En este repo, copia `.env.example` a `.env.local` y pega esos dos valores:

   ```
   cp .env.example .env.local
   ```

4. Nunca subas `.env.local` a git (ya está en `.gitignore`).

### 3. Registro de la app en Azure (Microsoft Entra ID)

1. Ve a https://portal.azure.com → **Microsoft Entra ID** → **App registrations**
   → **New registration**.
2. Nombre sugerido: `Calculadora de Tinta`.
3. En **Redirect URI**, tipo **Web**, pega:

   ```
   https://<tu-project-ref>.supabase.co/auth/v1/callback
   ```

   (el `project-ref` es el subdominio que aparece en tu Project URL de Supabase).
4. Una vez creada, en **Overview** copia el **Application (client) ID** y el
   **Directory (tenant) ID**.
5. Ve a **Certificates & secrets** → **New client secret**, créalo y copia el
   **Value** inmediatamente (no se vuelve a mostrar).
6. En **API permissions**, confirma que estén `openid`, `email`, `profile`
   (suelen venir por defecto).

### 4. Conectar Azure con Supabase Auth

1. En Supabase: **Authentication → Providers → Azure**.
2. Actívalo y pega:
   - **Client ID** (Application ID de Azure)
   - **Client Secret** (el Value que copiaste)
   - **Azure Tenant URL**: `https://login.microsoftonline.com/<tenant-id>/v2.0`
3. Guarda.
4. En **Authentication → URL Configuration**, agrega la URL donde vas a
   probar la app (para desarrollo local: `http://localhost:5173`; más
   adelante, la URL de Vercel).

### 5. Primer usuario y rol

La tabla `user_roles` empieza vacía a propósito — nadie tiene rol hasta que
tú lo asignes:

1. Corre la app localmente (paso 6) e inicia sesión una vez con tu cuenta de
   Microsoft. Esto crea tu usuario en Supabase (`auth.users`) aunque todavía
   no tengas rol.
2. En Supabase → **Table Editor** → `user_roles`, inserta una fila:
   - `user_id`: tu ID (lo ves en **Authentication → Users**, o en la propia
     pantalla de la app después de iniciar sesión).
   - `rol`: `administracion`.
3. Recarga la app: ahora deberías ver tu rol en la pantalla de verificación.

### 6. Correr localmente

```bash
npm install
npm run dev
```

Abre http://localhost:5173. Deberías ver el botón "Iniciar sesión con
Microsoft"; al iniciar sesión, la app te lleva a una pantalla que muestra tu
correo, tu rol y un semáforo de conexión a las 4 tablas de negocio.

### 7. Desplegar en Vercel

1. En https://vercel.com, **Add New → Project** → importa
   `nicowhite09/Calculadora_de_tinta`.
2. En **Environment Variables**, agrega `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` (los mismos valores de tu `.env.local`).
3. Deploy.
4. Copia la URL que te da Vercel (ej. `https://calculadora-de-tinta.vercel.app`)
   y agrégala en Supabase → **Authentication → URL Configuration** como
   Redirect URL adicional, y en Azure como un segundo **Redirect URI**
   (`https://<tu-url-vercel>/`).

## Cómo verificar que la Fase 0 está lista (antes de pasar a la Fase 1)

- [ ] Un usuario real puede iniciar sesión con su cuenta de Microsoft, tanto
      en local como en la URL de Vercel ya desplegada.
- [ ] La pantalla post-login muestra correo, rol y las 4 tablas en verde.
- [ ] Insertar y consultar un registro de prueba en cada tabla desde el
      Table Editor de Supabase funciona sin error de RLS.
- [ ] Un usuario de prueba SIN el rol correcto (o sin fila en `user_roles`)
      no puede leer ni escribir en las tablas restringidas — pruébalo
      creando una segunda cuenta y dejándola sin rol asignado: el semáforo
      de esa tabla debería salir en rojo por RLS.

## Estructura del proyecto

```
src/
  lib/
    supabase/      client.ts, types.ts
    auth/           AuthContext.tsx (login/logout, sesión, rol)
    pdf-parser/     extractHeader.ts, extractInkAreas.ts,
                    resolveShadingColor.ts (placeholders — Fases 3-4)
  components/       ProtectedRoute.tsx
  pages/            Login.tsx, Dashboard.tsx
api/
  parse-ficha.ts    función serverless de Vercel (placeholder — Fase 5)
supabase/
  migrations/
    0001_init.sql   esquema + RLS (Fase 0)
```
