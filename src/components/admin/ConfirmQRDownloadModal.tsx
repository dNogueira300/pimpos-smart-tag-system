// src/components/admin/ConfirmQRDownloadModal.tsx
"use client";

import { QrCode, X, Download } from "lucide-react";

interface ConfirmQRDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productCount: number;
  isLoading: boolean;
}

export default function ConfirmQRDownloadModal({
  isOpen,
  onClose,
  onConfirm,
  productCount,
  isLoading,
}: ConfirmQRDownloadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl border-4 border-purple-200 max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Icono */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full p-4">
            <QrCode className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
          Generar Códigos QR
        </h2>

        {/* Descripción */}
        <p className="text-gray-600 text-center mb-6">
          Estás a punto de generar códigos QR para{" "}
          <strong className="text-purple-600">{productCount} productos</strong>
        </p>

        {/* Info card */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-sm text-purple-900">
                - Formato grid (6 QR por página)
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm text-purple-900">
                - Incluye enlaces NFC copiables
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm text-purple-900">
                - Tamaño optimizado para impresión
              </span>
            </div>
          </div>
        </div>

        {/* Advertencia si son muchos productos */}
        {productCount > 50 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6">
            <p className="text-yellow-900 text-xs text-center">
              Advertencia: La generación puede tardar unos momentos debido a la cantidad
              de productos
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-4 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Generando...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Generar PDF
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-all border-2 border-gray-200 disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
