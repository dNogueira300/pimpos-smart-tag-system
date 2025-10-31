// src/components/client/QRScanner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera } from "lucide-react";
import Modal from "./Modal";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScanner({
  isOpen,
  onClose,
  onScanSuccess,
}: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = "qr-reader";

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setError(null);

      // Crear instancia del escáner
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(qrCodeRegionId);
      }

      // Configuración del escáner
      const config = {
        fps: 10, // Frames por segundo
        qrbox: { width: 250, height: 250 }, // Área de escaneo
        aspectRatio: 1.0,
      };

      // Iniciar el escáner
      await scannerRef.current.start(
        { facingMode: "environment" }, // Usar cámara trasera en móviles
        config,
        (decodedText) => {
          // Cuando se escanea exitosamente
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Errores de escaneo (no críticos, ocurren cuando no detecta QR)
          // No hacemos nada aquí para evitar spam de errores
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Error al iniciar escáner:", err);
      setError(
        "No se pudo acceder a la cámara. Por favor, verifica los permisos."
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        setIsScanning(false);
      } catch (err) {
        console.error("Error al detener escáner:", err);
      }
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    // Detener el escáner antes de procesar
    await stopScanner();

    // Procesar el código QR escaneado
    onScanSuccess(decodedText);

    // Cerrar el modal
    onClose();
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" showCloseButton={false}>
      <div className="text-center">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Escanear QR</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Área de escaneo */}
        <div className="relative mb-4">
          {!error && (
            <div className="flex items-center justify-center mb-2">
              <Camera className="h-6 w-6 text-gray-600 mr-2" />
              <p className="text-sm text-gray-600">
                Apunta la cámara al código QR
              </p>
            </div>
          )}

          {/* Contenedor del lector QR */}
          <div
            id={qrCodeRegionId}
            className="mx-auto rounded-lg overflow-hidden"
            style={{ width: "100%", maxWidth: "500px" }}
          />

          {/* Mensaje de error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
              <button
                onClick={startScanner}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Intentar nuevamente
              </button>
            </div>
          )}
        </div>

        {/* Instrucciones */}
        {!error && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
            <p className="text-blue-900 text-sm">
              Mantén el código QR dentro del área de escaneo. El escaneo se
              realizará automáticamente.
            </p>
          </div>
        )}

        {/* Botón de cancelar */}
        <button
          onClick={handleClose}
          className="mt-4 w-full bg-gray-300 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-400 transition-all"
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
