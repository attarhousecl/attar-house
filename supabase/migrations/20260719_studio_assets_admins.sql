-- studio-assets: escritura/lectura autenticada SOLO para uids admin.
-- Antes aplicaba a cualquier `authenticated`; con el registro de clientes
-- abierto, eso permitía a cualquier cuenta subir archivos al bucket público.
-- (La lectura pública de los PNG sigue funcionando porque el bucket es public.)
-- (Aplicada en el proyecto lplegpsqsraqtumiqape el 2026-07-19.)
do $$
declare
  admins constant uuid[] := array[
    '17005bc8-1c31-4512-b7ae-67e3a1caa1fe'::uuid,  -- attarhousecl@gmail.com (dueño)
    '3529b031-4c22-46f4-b713-7b503aef7fb5'::uuid   -- admin.local@attarhouse.cl
  ];
begin
  execute 'drop policy if exists "studio_assets_write" on storage.objects';
  execute format('create policy "studio_assets_write" on storage.objects for insert to authenticated with check (bucket_id = ''studio-assets'' and auth.uid() = any (%L::uuid[]))', admins);

  execute 'drop policy if exists "studio_assets_update" on storage.objects';
  execute format('create policy "studio_assets_update" on storage.objects for update to authenticated using (bucket_id = ''studio-assets'' and auth.uid() = any (%L::uuid[]))', admins);

  execute 'drop policy if exists "studio_assets_read" on storage.objects';
  execute format('create policy "studio_assets_read" on storage.objects for select to authenticated using (bucket_id = ''studio-assets'' and auth.uid() = any (%L::uuid[]))', admins);
end $$;
