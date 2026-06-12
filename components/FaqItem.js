"use client";

import { useState } from "react";

export default function FaqItem({ question, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item ${open ? "active" : ""}`} onClick={() => setOpen((o) => !o)}>
      <div className="faq-question">
        {question} <i className="ph ph-plus faq-icon"></i>
      </div>
      <div className="faq-answer">{children}</div>
    </div>
  );
}
