-- Moderación de reseñas desde el panel admin (API con service role):
-- la migración 20260704_reviews solo dio select+insert a service_role;
-- aprobar (update) y eliminar (delete) requieren estos grants.
-- RLS sigue igual: anon/authenticated solo leen aprobadas.
-- (Aplicada en el proyecto lplegpsqsraqtumiqape el 2026-07-19.)
grant update, delete on table public.reviews to service_role;
