# Carga de stock inicial (Brief 4)

Dos formas de cargar las cantidades reales por formato. La **fuente de verdad** es
`qty_*`; los booleanos `stock_*` y `stock_low` los recalcula solo el trigger de la base.

## Opción A — Panel admin (a mano)
`/admin` → pestaña **Stock** → editar los campos de cantidad por formato (Sellado / 10ml /
5ml / 3ml). Se guarda al salir del campo. Ideal para ajustes puntuales.

## Opción B — Carga masiva por CSV (recomendada para la primera carga)
1. Abre `scripts/stock-inicial.csv` (ya viene con los 40 perfumes y las cantidades
   actuales como punto de partida). Edita solo las columnas `qty_*`. Deja en `0` los
   formatos que no vendes (p. ej. `qty_sellado` de un decant-only).
2. Vista previa (no escribe nada):
   ```
   node scripts/cargar-stock.mjs
   ```
   Muestra el diff perfume por perfume y avisa de ids que no existan en el catálogo.
3. Aplicar de verdad:
   ```
   node scripts/cargar-stock.mjs --apply
   ```

Notas:
- Lee `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` desde `.env.local`
  (service role → salta RLS). **No subir esa key.**
- El CSV se matchea por `id` (columna 1); `marca`/`nombre` son solo para leerlo cómodo.
- Podés usar otro archivo con `--csv ruta/al.csv`.
