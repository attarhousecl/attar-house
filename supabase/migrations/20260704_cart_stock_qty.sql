-- BRIEF 4 — Stock por cantidad (Opción B).
-- El stock deja de ser booleano y pasa a ser un número por formato que se
-- descuenta con cada venta. Los booleanos stock_* se mantienen como DERIVADOS
-- (qty_* > 0) vía trigger, para que el front actual siga funcionando sin cambios.
--
-- ORDEN IMPORTANTE: primero se agregan las columnas y se hace el backfill de
-- placeholders, y RECIÉN DESPUÉS se crea el trigger de sincronización. Así el
-- backfill no dispara el trigger y los booleanos actuales quedan intactos.

-- 1) Cantidad por formato (parten en 0; el backfill de abajo las siembra).
alter table public.perfumes
  add column if not exists qty_sellado  int not null default 0,
  add column if not exists qty_decant10 int not null default 0,
  add column if not exists qty_decant5  int not null default 0,
  add column if not exists qty_decant3  int not null default 0;

-- 2) Backfill de PLACEHOLDER desde los booleanos actuales (10 si hay, 0 si no).
--    ⚠️ Son valores de relleno: el dueño DEBE cargar las cantidades reales en el
--    panel admin antes de confiar en esto. Se corre antes de crear el trigger.
update public.perfumes set
  qty_sellado  = case when stock_sellado  then 10 else 0 end,
  qty_decant10 = case when stock_decant10 then 10 else 0 end,
  qty_decant5  = case when stock_decant5  then 10 else 0 end,
  qty_decant3  = case when stock_decant3  then 10 else 0 end;

-- 3) Columnas de control en orders: idempotencia del descuento + flag de problema.
alter table public.orders
  add column if not exists stock_decremented boolean not null default false,
  add column if not exists stock_issue       boolean not null default false;

-- 4) Sincroniza los booleanos derivados desde qty_*. La fuente de verdad pasa a
--    ser la cantidad; el front que lee stock_* sigue igual.
create or replace function public.sync_stock_booleans()
returns trigger language plpgsql set search_path = public as $$
begin
  new.stock_sellado  := new.qty_sellado  > 0;
  new.stock_decant10 := new.qty_decant10 > 0;
  new.stock_decant5  := new.qty_decant5  > 0;
  new.stock_decant3  := new.qty_decant3  > 0;
  new.stock_low := (new.qty_sellado + new.qty_decant10 + new.qty_decant5 + new.qty_decant3) <= 3;
  return new;
end $$;

drop trigger if exists trg_sync_stock on public.perfumes;
create trigger trg_sync_stock
  before insert or update on public.perfumes
  for each row execute function public.sync_stock_booleans();

-- 5) Descuento atómico por formato. `for update` bloquea la fila durante la
--    transacción → dos compras simultáneas del último ítem no pasan ambas.
--    Lista blanca de formato para evitar inyección de nombre de columna.
create or replace function public.descontar_stock(p_id text, p_formato text, p_cant int)
returns boolean language plpgsql security definer set search_path = public as $$
declare col text; disp int;
begin
  if p_formato not in ('sellado','decant10','decant5','decant3') then
    raise exception 'formato inválido: %', p_formato;
  end if;
  col := 'qty_' || p_formato;
  execute format('select %I from public.perfumes where id = $1 for update', col)
    into disp using p_id;
  if disp is null or disp < p_cant then
    return false;
  end if;
  execute format('update public.perfumes set %I = %I - $1 where id = $2', col, col)
    using p_cant, p_id;
  return true;
end $$;

-- 6) Descuento por PEDIDO completo, atómico e idempotente. Lo llama el webhook de
--    MercadoPago cuando el pago se aprueba. Bloquea la orden, no re-descuenta si ya
--    se hizo, recorre items (ignora Accesorios), y marca stock_issue si algún ítem
--    no se pudo cumplir (el pago ya se cobró → se avisa al dueño, no se falla).
create or replace function public.descontar_stock_pedido(p_commerce_order text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  o record;
  it jsonb;
  ok boolean;
  failures jsonb := '[]'::jsonb;
  done int := 0;
begin
  select * into o from public.orders where commerce_order = p_commerce_order for update;
  if not found then
    return jsonb_build_object('error', 'order_not_found');
  end if;
  if o.stock_decremented then
    return jsonb_build_object('already', true);
  end if;

  for it in select * from jsonb_array_elements(coalesce(o.items, '[]'::jsonb))
  loop
    if (it->>'format') is distinct from 'Accesorio' then
      ok := public.descontar_stock(it->>'id', it->>'format', greatest(coalesce((it->>'quantity')::int, 1), 1));
      if ok then
        done := done + 1;
      else
        failures := failures || jsonb_build_object(
          'id', it->>'id', 'name', it->>'name',
          'format', it->>'format', 'quantity', coalesce((it->>'quantity')::int, 1));
      end if;
    end if;
  end loop;

  update public.orders
    set stock_decremented = true,
        stock_issue = (jsonb_array_length(failures) > 0)
    where commerce_order = p_commerce_order;

  return jsonb_build_object('decremented', done, 'failures', failures);
end $$;

-- 7) Ventas manuales (WhatsApp / Efectivo Valdivia) NO pasan por el carrito, así
--    que hay que descontarlas igual o el stock se descuadra. 'Web' se salta porque
--    esas ya descuentan vía descontar_stock_pedido (evita doble descuento).
--    El match perfume↔fila es best-effort por nombre (ventas.perfume es texto libre).
create or replace function public.descontar_por_venta()
returns trigger language plpgsql security definer set search_path = public as $$
declare col text;
begin
  if NEW.canal not in ('WhatsApp', 'Efectivo Valdivia') then
    return NEW;
  end if;
  col := case NEW.formato
    when '3ml'     then 'qty_decant3'
    when '5ml'     then 'qty_decant5'
    when '10ml'    then 'qty_decant10'
    when 'Sellado' then 'qty_sellado'
    else null end;
  if col is null then
    return NEW;
  end if;
  -- greatest(...,0): nunca baja de cero aunque el registro manual exceda el stock.
  execute format(
    'update public.perfumes set %I = greatest(%I - $1, 0) where lower(name) = lower($2)',
    col, col) using NEW.cantidad, NEW.perfume;
  return NEW;
end $$;

drop trigger if exists trg_descontar_venta on public.ventas;
create trigger trg_descontar_venta
  after insert on public.ventas
  for each row execute function public.descontar_por_venta();

-- 8) Permisos de ejecución: el descuento va del lado servidor con service role,
--    nunca desde el cliente. Se revoca a public/anon/authenticated.
revoke all on function public.descontar_stock(text, text, int) from public;
revoke all on function public.descontar_stock_pedido(text) from public;
grant execute on function public.descontar_stock(text, text, int) to service_role;
grant execute on function public.descontar_stock_pedido(text) to service_role;
-- descontar_por_venta es función de trigger: no debe ser invocable por RPC desde
-- el cliente. Los triggers igual se disparan (corren como dueño de la tabla).
revoke all on function public.descontar_por_venta() from public, anon, authenticated;
-- (Las columnas qty_* quedan cubiertas por los grants de tabla existentes:
--  authenticated ya tiene UPDATE/SELECT y la policy admin_write_perfumes lo acota
--  al uid del dueño; anon ya tiene SELECT para la tienda. No se toca RLS.)
