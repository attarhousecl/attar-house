"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// A dónde vuelve el cliente al confirmar su correo. Sin esto, Supabase usa el
// "Site URL" del panel — que por defecto es http://localhost:3000 y mandaba a
// los clientes a localhost desde el sitio en producción. Siempre al dominio real.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://attarhouse.cl";

// Sesión de CLIENTE (Supabase Auth) — independiente del panel admin, que usa
// su propia autenticación en lib/adminAuth. Con esta sesión el cliente puede
// dejar reseñas, comprar y revisar su historial de pedidos.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user || null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data?.user || null, error };
  }, []);

  // La cuenta de cliente SIEMPRE lleva correo + celular: el teléfono viaja en
  // user_metadata y se usa para prellenar checkout y coordinar despachos.
  const signUp = useCallback(async (name, email, password, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, phone },
        emailRedirectTo: `${SITE_URL}/cuenta`,
      },
    });
    // Si el proyecto exige confirmación por correo, no hay session todavía.
    return { user: data?.user || null, session: data?.session || null, error };
  }, []);

  // Actualiza datos del perfil (ej: agregar celular a cuentas antiguas).
  const updateProfile = useCallback(async (data) => {
    const { error } = await supabase.auth.updateUser({ data });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // Token de acceso para llamadas a nuestras APIs (reseñas, mis pedidos).
  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }, []);

  const displayName =
    user?.user_metadata?.full_name || (user?.email ? user.email.split("@")[0] : "");
  const phone = user?.user_metadata?.phone || "";

  return (
    <AuthContext.Provider
      value={{ user, loading, displayName, phone, signIn, signUp, signOut, getToken, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
