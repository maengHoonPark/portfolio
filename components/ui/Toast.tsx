"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type ToastContextValue = { show: (message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [id, setId] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((next: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(next);
    setId((n) => n + 1);
    timer.current = setTimeout(() => setMessage(null), 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-6"
      >
        <AnimatePresence>
          {message && (
            <motion.div
              key={id}
              className="rounded-button bg-strong px-5 py-3.5 text-sm font-semibold text-bg shadow-lg"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
