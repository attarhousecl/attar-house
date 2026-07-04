# FOLLOW-UP (carril ADMIN) — Moderación de reseñas en el panel

> Generado por el chat de Brief 2 (`feat/reviews-cookie`). **Carril: Admin.**
> No es urgente: la moderación ya funciona a mano; esto es la UI para el dueño.

## Contexto
El Brief 2 dejó vivas las reseñas de clientes: tabla `public.reviews` en Supabase
(`lplegpsqsraqtumiqape`), anónimas, **una por producto por sesión**, y **moderadas**
(no se muestran en la tienda hasta que `approved = true`).

Hoy la aprobación se hace **a mano en Supabase**:
```sql
-- aprobar
update public.reviews set approved = true where id = '<uuid>';
-- rechazar / borrar
delete from public.reviews where id = '<uuid>';
```
Falta la UI en el panel admin para que el dueño lo haga sin tocar SQL.

## Esquema de la tabla `public.reviews`
| columna       | tipo        | nota                                             |
|---------------|-------------|--------------------------------------------------|
| id            | uuid        | PK                                               |
| perfume_id    | text        | FK → `perfumes.id`                               |
| author_name   | text        |                                                  |
| rating        | int (1–5)   |                                                  |
| comment       | text        |                                                  |
| approved      | boolean     | **false** = pendiente; true = pública            |
| session_hash  | text        | sha256 de cookie; no mostrar, es interno         |
| created_at    | timestamptz |                                                  |

## Qué construir (carril Admin: `app/admin/**`)
1. Una vista **"Reseñas"** en el panel (ej. `app/admin/resenas/page.js`) que liste las
   **pendientes** (`approved = false`) primero: producto, autor, rating, comentario, fecha.
2. Botones **Aprobar** (`approved = true`) y **Rechazar/Eliminar** (delete) por fila.
3. Idealmente contador de pendientes en el menú admin.

## Cómo hacer los writes (IMPORTANTE — RLS)
`reviews` tiene RLS y **solo permite SELECT público de aprobadas**; **no hay policy de
insert/update/delete para anon**. Por diseño, los cambios de moderación deben ir por el
**backend con service role**, no con la anon key desde el cliente. Dos opciones:
- **Recomendado:** una API route protegida con `getAdminUser()` (`lib/adminAuth.js`) que
  haga el update/delete con `supabaseAdmin` (service role). Sigue el patrón de las rutas
  admin existentes. *(Ojo: `app/api/**` es carril Seguridad — coordinar ese pedacito, o
  pedir al chat de Seguridad la ruta `PATCH/DELETE /api/admin/reviews`.)*
- Alternativa rápida: leer pendientes en el panel usando el cliente de servidor autenticado
  del admin (si ya tiene sesión Supabase con permisos), pero el camino service-role es el
  seguro y consistente con lo demás.

## Qué NO hacer
- No exponer writes de `reviews` con la anon key en el cliente (se saltaría la moderación).
- No mostrar `session_hash` en la UI.

## Referencias
- Migración/estructura: `supabase/migrations/20260704_reviews.sql`
- API pública de envío: `app/api/reviews/route.js`
- Componente tienda: `components/ReviewSection.js`
