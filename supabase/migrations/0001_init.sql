-- Fase 0: esquema base para la Calculadora de Consumo de Tinta
-- Ejecutar completo en Supabase > SQL Editor (una sola vez).

create extension if not exists "pgcrypto";

-- ============================================================
-- ROLES DE USUARIO
-- ============================================================
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rol text not null check (rol in ('planta', 'produccion', 'administracion')),
  created_at timestamptz not null default now()
);

-- Función auxiliar: rol del usuario autenticado actual.
-- security definer para poder leer user_roles incluso dentro de policies
-- de otras tablas sin generar recursión de RLS.
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select rol from public.user_roles where user_id = auth.uid();
$$;

-- ============================================================
-- TRIGGER GENÉRICO updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- MARCAS / CLIENTES  (AEO, Aerie, Offline / ANNJOY, ...)
-- ============================================================
create table if not exists public.marcas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  cliente text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- FICHA TÉCNICA DE TINTAS (un valor fijo por tinta)
-- ============================================================
create table if not exists public.tintas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  tipo text,
  densidad numeric(10, 4) not null,
  fuente_densidad text,
  volumen_anilox numeric(10, 4) not null,
  porc_transferencia numeric(6, 4) not null,
  porc_merma numeric(6, 4) not null,
  estado text not null default 'por_verificar'
    check (estado in ('confiable', 'por_verificar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_tintas_updated_at on public.tintas;
create trigger trg_tintas_updated_at
before update on public.tintas
for each row execute function public.set_updated_at();

-- ============================================================
-- ÓRDENES DE PRODUCCIÓN (OP)
-- ============================================================
create table if not exists public.ordenes_produccion (
  id uuid primary key default gen_random_uuid(),
  op_numero text not null unique,
  marca_id uuid references public.marcas(id),
  bolsa_descripcion text,
  alto_total numeric(10, 3),
  ancho_total numeric(10, 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_op_updated_at on public.ordenes_produccion;
create trigger trg_op_updated_at
before update on public.ordenes_produccion
for each row execute function public.set_updated_at();

-- ============================================================
-- CONSUMOS: teórico / reportado / medido, por OP y por tinta
-- ============================================================
create table if not exists public.consumos (
  id uuid primary key default gen_random_uuid(),
  op_id uuid not null references public.ordenes_produccion(id) on delete cascade,
  tinta_id uuid not null references public.tintas(id),
  porc_cobertura numeric(6, 4),
  kg_teorico numeric(12, 4),
  kg_reportado numeric(12, 4),
  kg_medido numeric(12, 4),
  kg_extra numeric(12, 4) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (op_id, tinta_id)
);

drop trigger if exists trg_consumos_updated_at on public.consumos;
create trigger trg_consumos_updated_at
before update on public.consumos
for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.user_roles enable row level security;
alter table public.marcas enable row level security;
alter table public.tintas enable row level security;
alter table public.ordenes_produccion enable row level security;
alter table public.consumos enable row level security;

-- user_roles: cada usuario ve su propio rol; solo administración gestiona roles
drop policy if exists "usuarios ven su propio rol" on public.user_roles;
create policy "usuarios ven su propio rol"
on public.user_roles for select
using (user_id = auth.uid());

drop policy if exists "administracion gestiona roles" on public.user_roles;
create policy "administracion gestiona roles"
on public.user_roles for all
using (public.current_user_role() = 'administracion')
with check (public.current_user_role() = 'administracion');

-- marcas: lectura para cualquier usuario con rol asignado; escritura solo administración
drop policy if exists "lectura marcas usuarios con rol" on public.marcas;
create policy "lectura marcas usuarios con rol"
on public.marcas for select
using (public.current_user_role() is not null);

drop policy if exists "administracion escribe marcas" on public.marcas;
create policy "administracion escribe marcas"
on public.marcas for all
using (public.current_user_role() = 'administracion')
with check (public.current_user_role() = 'administracion');

-- tintas: lectura para cualquier usuario con rol; escritura solo administración
drop policy if exists "lectura tintas usuarios con rol" on public.tintas;
create policy "lectura tintas usuarios con rol"
on public.tintas for select
using (public.current_user_role() is not null);

drop policy if exists "administracion escribe tintas" on public.tintas;
create policy "administracion escribe tintas"
on public.tintas for all
using (public.current_user_role() = 'administracion')
with check (public.current_user_role() = 'administracion');

-- ordenes_produccion: lectura para cualquier usuario con rol;
-- insert/update para producción y administración; delete solo administración
drop policy if exists "lectura ordenes usuarios con rol" on public.ordenes_produccion;
create policy "lectura ordenes usuarios con rol"
on public.ordenes_produccion for select
using (public.current_user_role() is not null);

drop policy if exists "produccion y administracion insertan ordenes" on public.ordenes_produccion;
create policy "produccion y administracion insertan ordenes"
on public.ordenes_produccion for insert
with check (public.current_user_role() in ('produccion', 'administracion'));

drop policy if exists "produccion y administracion actualizan ordenes" on public.ordenes_produccion;
create policy "produccion y administracion actualizan ordenes"
on public.ordenes_produccion for update
using (public.current_user_role() in ('produccion', 'administracion'))
with check (public.current_user_role() in ('produccion', 'administracion'));

drop policy if exists "solo administracion borra ordenes" on public.ordenes_produccion;
create policy "solo administracion borra ordenes"
on public.ordenes_produccion for delete
using (public.current_user_role() = 'administracion');

-- consumos: mismas reglas que ordenes_produccion
drop policy if exists "lectura consumos usuarios con rol" on public.consumos;
create policy "lectura consumos usuarios con rol"
on public.consumos for select
using (public.current_user_role() is not null);

drop policy if exists "produccion y administracion insertan consumos" on public.consumos;
create policy "produccion y administracion insertan consumos"
on public.consumos for insert
with check (public.current_user_role() in ('produccion', 'administracion'));

drop policy if exists "produccion y administracion actualizan consumos" on public.consumos;
create policy "produccion y administracion actualizan consumos"
on public.consumos for update
using (public.current_user_role() in ('produccion', 'administracion'))
with check (public.current_user_role() in ('produccion', 'administracion'));

drop policy if exists "solo administracion borra consumos" on public.consumos;
create policy "solo administracion borra consumos"
on public.consumos for delete
using (public.current_user_role() = 'administracion');
