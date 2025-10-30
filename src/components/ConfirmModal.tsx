// src/components/ConfirmModal.tsx
"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
}: ConfirmModalProps) {
  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case "danger":
        return {
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          buttonBg:
            "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
          gradient: "bg-gradient-to-r from-red-500 to-red-600",
        };
      case "warning":
        return {
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
          buttonBg:
            "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
          gradient: "bg-gradient-to-r from-amber-500 to-amber-600",
        };
      case "info":
        return {
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          buttonBg:
            "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
          gradient: "bg-gradient-to-r from-blue-500 to-blue-600",
        };
      default:
        return {
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          buttonBg:
            "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
          gradient: "bg-gradient-to-r from-red-500 to-red-600",
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay con backdrop blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Contenedor del modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Contenido del modal */}
          <div className="p-8 pb-10">
            {/* Botón de cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors z-10"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Icono */}
            <div className="flex justify-center mb-6">
              <div
                className={`${colors.iconBg} rounded-full p-4 ring-8 ${
                  type === "danger"
                    ? "ring-red-50"
                    : type === "warning"
                    ? "ring-amber-50"
                    : "ring-blue-50"
                }`}
              >
                <AlertTriangle className={`h-12 w-12 ${colors.iconColor}`} />
              </div>
            </div>

            {/* Título */}
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
              {title}
            </h3>

            {/* Mensaje */}
            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              {message}
            </p>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-gray-200"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${colors.buttonBg}`}
              >
                {confirmText}
              </button>
            </div>
          </div>

          {/* Línea decorativa - CORREGIDA */}
          <div
            className={`h-2 ${colors.gradient} w-full`}
            style={{
              marginTop: "-2px", // Compensa cualquier desfase mínimo
            }}
          />
        </div>
      </div>
    </div>
  );
}
