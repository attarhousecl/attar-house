"use client";

import { useState } from "react";

export default function FaqItem({ question, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item ${open ? "active" : ""}`}>
      <button
        type="button"
        className="faq-question"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{question}</span> <i className="ph ph-plus faq-icon" aria-hidden="true"></i>
      </button>
      <div className="faq-answer">{children}</div>
    </div>
  );
}
