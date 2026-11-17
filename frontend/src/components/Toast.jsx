import React, { createContext, useContext, useState, useMemo } from "react";
import { clsx } from "clsx";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = ({ title, description, tone = "info" }) => {
    const id = Date.now().toString() + Math.random().toString();
    const item = { id, title, description, tone };
    setToasts((prev) => [...prev, item]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const value = useMemo(() => ({ push }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              "pointer-events-auto bg-white border rounded p-3 shadow-sm text-neutral-900 transition-all",
              t.tone === "success" && "border-l-4 border-l-black border-neutral-200",
              t.tone === "error" && "border-l-4 border-l-red-600 border-neutral-200",
              t.tone === "info" && "border-neutral-200"
            )}
          >
            <div className="text-sm font-semibold">{t.title}</div>
            {t.description && (
              <div className="text-xs text-neutral-600 mt-0.5">{t.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
