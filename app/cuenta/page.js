"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { isValidPhoneCL } from "@/lib/checkoutValidation";
import WhatsAppLink from "@/components/WhatsAppLink";

const STATUS_LABEL = { paid: "Pagado", pending: "Pendiente", rejected: "Rechazado", error: "Error" };
const STATUS_CLASS = { paid: "ok", pending: "warn", rejected: "bad", error: "bad" };

function fmtFecha(date) {
  try {
    return new Date(date).toLocaleString("es-CL", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

// ---------- Formulario de acceso (login / registro) ----------
function AuthForm() {
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();
  const [modo, setModo] = useState("login"); // login | registro
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    if (!email.trim() || !pass) { setMsg({ tipo: "error", texto: "Completa tu correo y contraseña." }); return; }
    if (modo === "registro" && !nombre.trim()) { setMsg({ tipo: "error", texto: "Cuéntanos tu nombre." }); return; }
    // El celular es OBLIGATORIO en la cuenta: se usa para coordinar despachos.
    if (modo === "registro" && !celular.trim()) { setMsg({ tipo: "error", texto: "Necesitamos tu celular para coordinar tus pedidos." }); return; }
    if (modo === "registro" && !isValidPhoneCL(celular)) { setMsg({ tipo: "error", texto: "Ingresa un celular chileno válido (ej: 9 1234 5678)." }); return; }
    if (pass.length < 6) { setMsg({ tipo: "error", texto: "La contraseña debe tener al menos 6 caracteres." }); return; }

    setEnviando(true);
    try {
      if (modo === "login") {
        const { error } = await signIn(email.trim(), pass);
        if (error) {
          setMsg({ tipo: "error", texto: "Correo o contraseña incorrectos." });
        } else {
          showToast("✓ ¡Bienvenido de vuelta!");
        }
      } else {
        const { session, error } = await signUp(nombre.trim(), email.trim(), pass, celular.trim());
        if (error) {
          const m = error.message || "";
          let texto = "No pudimos crear tu cuenta. Intenta nuevamente.";
          if (/already/i.test(m)) {
            texto = "Ese correo ya tiene una cuenta. Prueba iniciar sesión.";
          } else if (/rate limit/i.test(m) || error.status === 429) {
            texto = "Alcanzamos el límite de correos de confirmación por ahora. Espera unos minutos (hasta 1 hora) y vuelve a intentarlo.";
          } else if (/invalid/i.test(m) && /email/i.test(m)) {
            texto = "Ese correo no parece válido. Revísalo e intenta de nuevo.";
          } else if (/password/i.test(m)) {
            texto = "La contraseña no cumple los requisitos (mínimo 6 caracteres).";
          }
          setMsg({ tipo: "error", texto });
        } else if (!session) {
          setMsg({ tipo: "ok", texto: "Te enviamos un correo para confirmar tu cuenta. Revísalo y vuelve a iniciar sesión." });
        } else {
          showToast("✓ Cuenta creada, ¡bienvenido!");
        }
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="account-card">
      <div className="account-tabs" role="tablist">
        <button
          type="button" role="tab" aria-selected={modo === "login"}
          className={`account-tab ${modo === "login" ? "active" : ""}`}
          onClick={() => { setModo("login"); setMsg(null); }}
        >
          Iniciar sesión
        </button>
        <button
          type="button" role="tab" aria-selected={modo === "registro"}
          className={`account-tab ${modo === "registro" ? "active" : ""}`}
          onClick={() => { setModo("registro"); setMsg(null); }}
        >
          Crear cuenta
        </button>
      </div>

      <p className="account-intro">
        {modo === "login"
          ? "Entra para ver tus pedidos, dejar reseñas y comprar más rápido."
          : "Con tu cuenta puedes comprar, seguir tus pedidos y dejar reseñas de tus fragancias."}
      </p>

      <form onSubmit={submit} className="account-form">
        {modo === "registro" && (
          <>
            <div>
              <label className="form-label" htmlFor="acc-nombre">Nombre</label>
              <input
                id="acc-nombre" className="form-input" type="text" maxLength={60}
                value={nombre} onChange={(e) => setNombre(e.target.value)}
                autoComplete="name" placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="form-label" htmlFor="acc-celular">Celular</label>
              <input
                id="acc-celular" className="form-input" type="tel" maxLength={15}
                inputMode="numeric" autoComplete="tel"
                value={celular} onChange={(e) => setCelular(e.target.value)}
                placeholder="9 1234 5678"
              />
            </div>
          </>
        )}
        <div>
          <label className="form-label" htmlFor="acc-email">Correo</label>
          <input
            id="acc-email" className="form-input" type="email" maxLength={254}
            value={email} onChange={(e) => setEmail(e.target.value)}
            autoComplete="email" placeholder="tucorreo@gmail.com"
          />
        </div>
        <div>
          <label className="form-label" htmlFor="acc-pass">Contraseña</label>
          <input
            id="acc-pass" className="form-input" type="password" maxLength={72}
            value={pass} onChange={(e) => setPass(e.target.value)}
            autoComplete={modo === "login" ? "current-password" : "new-password"}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {msg && <div className={`account-msg ${msg.tipo}`}>{msg.texto}</div>}

        <button type="submit" className="btn-gold-solid account-submit" disabled={enviando}>
          {enviando ? "Un momento…" : modo === "login" ? "Entrar" : "Crear mi cuenta"}
        </button>
      </form>
    </div>
  );
}

// Cuentas creadas antes de que el celular fuera obligatorio: se pide aquí.
function PhoneRequired() {
  const { updateProfile } = useAuth();
  const { showToast } = useToast();
  const [celular, setCelular] = useState("");
  const [msg, setMsg] = useState(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e) {
    e.preventDefault();
    setMsg(null);
    if (!isValidPhoneCL(celular)) {
      setMsg("Ingresa un celular chileno válido (ej: 9 1234 5678).");
      return;
    }
    setGuardando(true);
    const { error } = await updateProfile({ phone: celular.trim() });
    setGuardando(false);
    if (error) {
      setMsg("No pudimos guardar tu celular. Intenta nuevamente.");
    } else {
      showToast("✓ Celular guardado");
    }
  }

  return (
    <form onSubmit={guardar} className="account-phone-required">
      <div className="account-phone-head">
        <i className="ph ph-device-mobile" aria-hidden="true"></i>
        <div>
          <strong>Falta tu celular</strong>
          <p>Tu cuenta debe tener un celular para coordinar despachos y avisarte de tus pedidos.</p>
        </div>
      </div>
      <div className="account-phone-row">
        <input
          className="form-input" type="tel" maxLength={15}
          inputMode="numeric" autoComplete="tel"
          value={celular} onChange={(e) => setCelular(e.target.value)}
          placeholder="9 1234 5678" aria-label="Celular"
          style={{ marginBottom: 0 }}
        />
        <button type="submit" className="btn-gold-solid account-phone-save" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar"}
        </button>
      </div>
      {msg && <div className="account-msg error" style={{ marginTop: "10px", marginBottom: 0 }}>{msg}</div>}
    </form>
  );
}

// ---------- Panel del cliente ----------
function AccountPanel() {
  const { user, displayName, phone, signOut, getToken } = useAuth();
  const [orders, setOrders] = useState(null); // null = cargando

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token) { if (!cancel) setOrders([]); return; }
        const res = await fetch("/api/mis-pedidos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!cancel) setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch {
        if (!cancel) setOrders([]);
      }
    })();
    return () => { cancel = true; };
  }, [getToken]);

  return (
    <div className="account-panel">
      <div className="account-header">
        <div>
          <div className="kicker">Mi cuenta</div>
          <h1 className="account-title">Hola, {displayName} 👋</h1>
          <p className="account-email mono">
            {user.email}
            {phone ? ` · 📱 ${phone}` : ""}
          </p>
        </div>
        <button type="button" className="quiz-btn-ghost" onClick={signOut}>
          Cerrar sesión
        </button>
      </div>

      {!phone && <PhoneRequired />}

      <div className="account-grid">
        <Link href="/catalogo" className="account-shortcut">
          <i className="ph ph-magnifying-glass" aria-hidden="true"></i>
          <span>Explorar el catálogo</span>
        </Link>
        <Link href="/#quiz" className="account-shortcut">
          <i className="ph ph-sparkle" aria-hidden="true"></i>
          <span>Descubrir mi aroma</span>
        </Link>
        <Link href="/catalogo?tab=favoritos" className="account-shortcut">
          <i className="ph ph-heart" aria-hidden="true"></i>
          <span>Mis favoritos</span>
        </Link>
      </div>

      <h2 className="account-section-title">Mis pedidos</h2>
      {orders === null ? (
        <div className="sk" style={{ height: "120px" }} aria-label="Cargando pedidos" />
      ) : orders.length === 0 ? (
        <div className="account-empty">
          <p>Aún no registras pedidos con este correo ({user.email}).</p>
          <p style={{ marginTop: "6px" }}>
            ¿Compraste con otro correo? Búscalo por número en{" "}
            <Link href="/mis-pedidos" style={{ color: "var(--accent)" }}>seguimiento de pedidos</Link>{" "}
            o <WhatsAppLink href="https://wa.me/56632249728" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>escríbenos por WhatsApp</WhatsAppLink>.
          </p>
        </div>
      ) : (
        <div className="account-orders">
          {orders.map((order) => (
            <div key={order.commerce_order} className="account-order">
              <div className="account-order-head">
                <div>
                  <div className="account-order-id mono">{order.commerce_order}</div>
                  <div className="account-order-date">{fmtFecha(order.created_at)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={`account-status ${STATUS_CLASS[order.status] || ""}`}>
                    {STATUS_LABEL[order.status] || order.status}
                  </span>
                  <div className="account-order-total">${(order.total || 0).toLocaleString("es-CL")}</div>
                </div>
              </div>
              <div className="account-order-items">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="account-order-item">
                    <span>{item.name} · {item.format} ×{item.quantity}</span>
                    <span className="mono">${((item.price || 0) * (item.quantity || 1)).toLocaleString("es-CL")}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CuentaContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  // Si venía de un flujo (reseña, checkout), vuelve ahí al iniciar sesión.
  useEffect(() => {
    if (!loading && user && next && next.startsWith("/")) {
      router.replace(next);
    }
  }, [user, loading, next, router]);

  return (
    <div className="account-page">
      <div className="account-wrap">
        {loading ? (
          <div className="sk" style={{ height: "260px" }} aria-label="Cargando" />
        ) : user ? (
          <AccountPanel />
        ) : (
          <>
            <div className="account-hero">
              <div className="kicker">Tu casa de descubrimiento</div>
              <h1 className="account-title">Mi cuenta</h1>
            </div>
            <AuthForm />
          </>
        )}
      </div>
    </div>
  );
}

export default function CuentaPage() {
  return (
    <Suspense fallback={<div className="account-page"><div className="account-wrap"><div className="sk" style={{ height: "260px" }} /></div></div>}>
      <CuentaContent />
    </Suspense>
  );
}
