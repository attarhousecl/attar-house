"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/accesorios", label: "Accesorios" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav>
      <div className="container nav-content">
        <Link href="/" className="nav-brand">
          Attar House
        </Link>
        <i
          className="ph ph-list mobile-menu-btn"
          onClick={() => setOpen((o) => !o)}
        ></i>
        <div className={`nav-links ${open ? "show" : ""}`}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-btn ${pathname === link.href ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
