"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

function Stars({ rating }) {
  const rounded = Math.round(rating);
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          className={`ph ${i <= rounded ? "ph-star-fill" : "ph-star"} star ${i <= rounded ? "filled" : ""}`}
        ></i>
      ))}
    </div>
  );
}

// La cookie ah_reviews la setea /api/reviews (no httpOnly): un CSV con los
// perfume_id que este usuario ya reseñó. Ocultamos el form solo si este producto
// está en la lista (una reseña por producto).
function hasReviewedCookie(perfumeId) {
  if (typeof document === "undefined") return false;
  const raw = document.cookie.split("; ").find((c) => c.startsWith("ah_reviews="));
  if (!raw) return false;
  const list = decodeURIComponent(raw.slice("ah_reviews=".length)).split(",").filter(Boolean);
  return list.includes(perfumeId);
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("es-CL", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function ReviewSection({ perfumeId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const { user, loading: authLoading, displayName, getToken } = useAuth();
  const pathname = usePathname();

  // Solo se leen reseñas APROBADAS: la RLS de Supabase (approved = true) lo
  // garantiza aunque el filtro del cliente cambie.
  const loadReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("author_name, rating, comment, created_at")
      .eq("perfume_id", perfumeId)
      .eq("approved", true)
      .order("created_at", { ascending: false });
    if (!error && Array.isArray(data)) setReviews(data);
  }, [perfumeId]);

  useEffect(() => {
    setDone(hasReviewedCookie(perfumeId));
    loadReviews();
  }, [perfumeId, loadReviews]);

  const avg = reviews.length > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 0;

  const submit = async () => {
    if (!text.trim() || rating === 0) {
      showToast("⚠️ Escribe tu comentario y selecciona una puntuación.");
      return;
    }
    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) {
        showToast("⚠️ Inicia sesión para dejar tu reseña.");
        return;
      }
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ perfumeId, text: text.trim(), rating }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showToast(`⚠️ ${data.error || "No se pudo enviar tu reseña."}`);
        return;
      }

      // La reseña queda PENDIENTE de moderación: no se agrega a la lista visible.
      setDone(true);
      setRating(0);
      setText("");
      showToast(
        data.already
          ? "Ya dejaste tu reseña, ¡gracias!"
          : "✓ ¡Gracias! Tu reseña quedó pendiente de aprobación."
      );
    } catch {
      showToast("⚠️ No se pudo enviar tu reseña. Intenta más tarde.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reviews-section">
      <h4>Reseñas</h4>

      {reviews.length > 0 && (
        <div className="reviews-summary">
          <div className="reviews-avg">{avg.toFixed(1)}</div>
          <div>
            <Stars rating={avg} />
            <div className="reviews-count">
              {reviews.length} reseña{reviews.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      )}

      {reviews.length > 0 ? (
        reviews.map((rv, i) => (
          <div className="review-card" key={i}>
            <div className="review-card-header">
              <div>
                <div className="review-author">{rv.author_name}</div>
                <Stars rating={rv.rating} />
              </div>
              <div className="review-date">{formatDate(rv.created_at)}</div>
            </div>
            <div className="review-text">{rv.comment}</div>
          </div>
        ))
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "15px" }}>
          Sé el primero en dejar una reseña.
        </p>
      )}

      {done ? (
        <div
          className="review-form"
          style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center" }}
        >
          Ya dejaste tu reseña, ¡gracias! 🙌
        </div>
      ) : authLoading ? null : !user ? (
        <div className="review-form review-login-gate">
          <h5>Deja tu opinión</h5>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "14px" }}>
            Para dejar reseñas necesitas una cuenta: así todas las opiniones son de
            clientes reales.
          </p>
          <Link
            href={`/cuenta?next=${encodeURIComponent(pathname || "/")}`}
            className="btn-submit-review"
            style={{ display: "inline-block", textDecoration: "none" }}
          >
            Iniciar sesión o crear cuenta
          </Link>
        </div>
      ) : (
        <div className="review-form">
          <h5>Deja tu opinión</h5>
          <p style={{ color: "var(--text-soft)", fontSize: "0.78rem", marginBottom: "12px" }}>
            Publicarás como <strong style={{ color: "var(--text-main)" }}>{displayName}</strong>.
          </p>
          <div className="review-form-stars" role="radiogroup" aria-label="Puntuación">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                type="button"
                key={i}
                className="review-form-star"
                role="radio"
                aria-checked={rating === i}
                aria-label={`${i} estrella${i > 1 ? "s" : ""}`}
                style={{ color: i <= rating ? "var(--gold-light)" : "var(--text-soft)", background: "none", border: "none", padding: 0, fontSize: "1.4rem", lineHeight: 1, cursor: "pointer" }}
                onClick={() => setRating(i)}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            className="review-text-input"
            placeholder="¿Qué te pareció esta fragancia?"
            rows={3}
            maxLength={300}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn-submit-review" onClick={submit} disabled={submitting}>
            {submitting ? "Enviando..." : "Publicar Reseña"}
          </button>
        </div>
      )}
    </div>
  );
}
