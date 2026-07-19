-- Segundo admin (admin.local@attarhouse.cl, uid 3529b031-4c22-46f4-b713-7b503aef7fb5)
-- para pruebas del panel. Las policies de escritura admin pasan de un uid fijo
-- a una lista de uids admin. Complementa ADMIN_EMAILS del middleware/adminAuth.
-- (Aplicada en el proyecto lplegpsqsraqtumiqape el 2026-07-19.)
do $$
declare
  admins constant uuid[] := array[
    '17005bc8-1c31-4512-b7ae-67e3a1caa1fe'::uuid,  -- attarhousecl@gmail.com (dueño)
    '3529b031-4c22-46f4-b713-7b503aef7fb5'::uuid   -- admin.local@attarhouse.cl
  ];
begin
  execute format('drop policy if exists "admin_write_accesorios" on public.accesorios');
  execute format('create policy "admin_write_accesorios" on public.accesorios for all to authenticated using (auth.uid() = any (%L::uuid[])) with check (auth.uid() = any (%L::uuid[]))', admins, admins);

  execute format('drop policy if exists "admin_all_compras" on public.compras');
  execute format('create policy "admin_all_compras" on public.compras for all to authenticated using (auth.uid() = any (%L::uuid[])) with check (auth.uid() = any (%L::uuid[]))', admins, admins);

  execute format('drop policy if exists "admin_all_objetivos" on public.objetivos');
  execute format('create policy "admin_all_objetivos" on public.objetivos for all to authenticated using (auth.uid() = any (%L::uuid[])) with check (auth.uid() = any (%L::uuid[]))', admins, admins);

  execute format('drop policy if exists "admin_all_orders" on public.orders');
  execute format('create policy "admin_all_orders" on public.orders for all to authenticated using (auth.uid() = any (%L::uuid[])) with check (auth.uid() = any (%L::uuid[]))', admins, admins);

  execute format('drop policy if exists "admin_write_perfumes" on public.perfumes');
  execute format('create policy "admin_write_perfumes" on public.perfumes for all to authenticated using (auth.uid() = any (%L::uuid[])) with check (auth.uid() = any (%L::uuid[]))', admins, admins);

  execute format('drop policy if exists "admin_all_ventas" on public.ventas');
  execute format('create policy "admin_all_ventas" on public.ventas for all to authenticated using (auth.uid() = any (%L::uuid[])) with check (auth.uid() = any (%L::uuid[]))', admins, admins);
end $$;
