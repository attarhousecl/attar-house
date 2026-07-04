-- BRIEF 2 — Reseñas: anónimas, moderadas, una por sesión.
-- perfumes.id es text, por eso perfume_id es text.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  perfume_id text references public.perfumes(id) on delete cascade,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  approved boolean not null default false,   -- moderación: false hasta que el dueño aprueba
  session_hash text,                          -- sha256 de la cookie de sesión: refuerza "1 por persona"
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

-- Lectura pública SOLO de reseñas aprobadas (una reseña recién dejada NO se ve).
drop policy if exists "read approved reviews" on public.reviews;
create policy "read approved reviews" on public.reviews
  for select using (approved = true);

-- IMPORTANTE (endurecimiento sobre el brief): NO se crea policy de insert para
-- anon/public. Los inserts entran SOLO por la API route /api/reviews con service
-- role (que fuerza approved=false). Si se permitiera insert con la anon key, un
-- cliente malicioso podría mandar approved=true en el payload y saltarse la
-- moderación. Con service-role-only eso es imposible.

-- Lectura rápida de reseñas aprobadas por producto.
create index if not exists reviews_perfume_approved_idx
  on public.reviews (perfume_id) where approved = true;

-- Refuerzo duro de "una reseña por sesión/persona" (además del chequeo en la API).
create unique index if not exists reviews_session_hash_key
  on public.reviews (session_hash) where session_hash is not null;
