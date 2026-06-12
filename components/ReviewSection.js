"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";

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

export default function ReviewSection({ perfumeId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    let all = {};
    try {
      all = JSON.parse(localStorage.getItem("attar_reviews")) || {};
    } catch {
      // ignore malformed localStorage data
    }
    setReviews(all[perfumeId] || []);
  }, [perfumeId]);

  const avg = reviews.length > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 0;

  const submit = () => {
    if (!name.trim() || !text.trim() || rating === 0) {
      showToast("⚠️ Completa todos los campos y selecciona una puntuación.");
      return;
    }

    let all = {};
    try {
      all = JSON.parse(localStorage.getItem("attar_reviews")) || {};
    } catch {
      // ignore malformed localStorage data
    }
    const newReview = {
      author: name.trim(),
      rating,
      text: text.trim(),
      date: new Date().toLocaleDateString("es-CL", { year: "numeric", month: "short", day: "numeric" }),
    };
    const updated = [newReview, ...(all[perfumeId] || [])];
    all[perfumeId] = updated;
    localStorage.setItem("attar_reviews", JSON.stringify(all));

    setReviews(updated);
    setRating(0);
    setName("");
    setText("");
    showToast("✓ ¡Gracias por tu reseña!");
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
                <div className="review-author">{rv.author}</div>
                <Stars rating={rv.rating} />
              </div>
              <div className="review-date">{rv.date}</div>
            </div>
            <div className="review-text">{rv.text}</div>
          </div>
        ))
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "15px" }}>
          Sé el primero en dejar una reseña.
        </p>
      )}

      <div className="review-form">
        <h5>Deja tu opinión</h5>
        <div className="review-form-stars">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="review-form-star"
              style={{ color: i <= rating ? "var(--gold-primary)" : "var(--gold-dark)" }}
              onClick={() => setRating(i)}
            >
              ★
            </span>
          ))}
        </div>
        <input
          type="text"
          className="review-name-input"
          placeholder="Tu nombre"
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="review-text-input"
          placeholder="¿Qué te pareció esta fragancia?"
          rows={3}
          maxLength={300}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn-submit-review" onClick={submit}>
          Publicar Reseña
        </button>
      </div>
    </div>
  );
}
