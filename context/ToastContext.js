"use client";

import { createContext, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ message: "", show: false });
  const timeoutRef = useRef(null);

  const showToast = (message) => {
    setToast({ message, show: true });
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        id="global-toast"
        className={`toast ${toast.show ? "show" : ""}`}
        dangerouslySetInnerHTML={{ __html: toast.message }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
