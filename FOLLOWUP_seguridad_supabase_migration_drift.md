# Follow-up · Carril Seguridad / Infra

## Supabase Preview check en rojo (drift de migraciones)

**Estado:** pendiente · **Prioridad:** media (no bloquea deploys de Vercel)

### Qué pasa
En el HEAD de `main` (a partir del merge del PR #6 `feat/reviews-cookie`, 2026-07-04)
el check **"Supabase Preview"** de GitHub sale en **failure** con el mensaje:

```
Remote migration versions not found in local migrations directory.
```

Es un **desfase (drift)** entre las migraciones que existen en el proyecto Supabase
remoto y las que hay versionadas en el repo (`supabase/migrations/`). El remoto tiene
versiones que localmente no están registradas.

### Qué NO lo causó
No lo provocaron los PRs #4 (`sec/anti-bot`) ni #5 (`whatsapp-ratelimit`): ninguno
tocó migraciones ni la base de datos. El check aparece asociado al merge del PR #6
simplemente porque es el commit HEAD actual; el drift es **preexistente**.

### Cómo arreglarlo (sugerido)
1. `supabase login` y `supabase link --project-ref lplegpsqsraqtumiqape` (si no está enlazado).
2. `supabase db pull` para traer las migraciones remotas que faltan al repo.
3. Commitear los archivos nuevos en `supabase/migrations/` en una rama `sec/…` y PR.
4. Verificar que el check "Supabase Preview" pase en verde en ese PR.

> Ojo: revisar el diff de `db pull` antes de commitear, no aplicar a ciegas. Si alguna
> migración remota se creó a mano por fuera del flujo, conviene entender qué cambió.

### Referencias
- Proyecto Supabase: `lplegpsqsraqtumiqape`
- Detalle del check: dashboard de Supabase → Integrations
