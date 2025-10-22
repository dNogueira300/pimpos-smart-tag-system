// src/contexts/ToastContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ToastNotification, NotificationType } from "@/types/client";
import { v4 as uuidv4 } from "uuid";
import ToastContainer from "@/components/client/ToastContainer";

interface ToastContextType {
  showToast: (
    message: string,
    type?: NotificationType,
    duration?: number
  ) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = useCallback(
    (
      message: string,
      type: NotificationType = "info",
      duration: number = 3000
    ) => {
      const id = uuidv4();
      const newToast: ToastNotification = {
        id,
        message,
        type,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove después del duration
      if (duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }
    },
    []
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return context;
}
