// src/components/client/ToastContainer.tsx
"use client";

import { ToastNotification } from "@/types/client";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

interface ToastContainerProps {
  toasts: ToastNotification[];
  onClose: (id: string) => void;
}

export default function ToastContainer({
  toasts,
  onClose,
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

interface ToastProps {
  toast: ToastNotification;
  onClose: (id: string) => void;
}

function Toast({ toast, onClose }: ToastProps) {
  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          bg: "bg-green-500",
          icon: CheckCircle,
          iconColor: "text-white",
        };
      case "error":
        return {
          bg: "bg-red-500",
          icon: AlertCircle,
          iconColor: "text-white",
        };
      case "warning":
        return {
          bg: "bg-yellow-500",
          icon: AlertTriangle,
          iconColor: "text-white",
        };
      case "info":
      default:
        return {
          bg: "bg-blue-500",
          icon: Info,
          iconColor: "text-white",
        };
    }
  };

  const { bg, icon: Icon, iconColor } = getToastStyles();

  return (
    <div
      className={`${bg} text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 animate-slide-in-right backdrop-blur-md`}
    >
      <Icon className={`h-6 w-6 flex-shrink-0 ${iconColor}`} />
      <p className="flex-1 font-medium text-sm">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-all"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
