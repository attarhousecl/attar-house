import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Verifica que la petición venga de un admin con sesión Supabase válida.
// Devuelve el `user` o `null`. Úsalo al inicio de los route handlers sensibles
// (endpoints de IA, operaciones privilegiadas) que se llaman desde el panel admin.
//
// Nota: getUser() valida el JWT contra el servidor de Supabase Auth (a diferencia
// de getSession(), que confía en la cookie sin verificar). Esto es lo correcto
// para autorización.
export async function getAdminUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // En un route handler solo leemos la sesión; no refrescamos cookies aquí.
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}
