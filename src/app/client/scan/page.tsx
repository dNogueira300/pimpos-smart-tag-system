// src/app/client/scan/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Camera, QrCode } from "lucide-react";
import { useShopping } from "@/contexts/ShoppingContext";
import { useToast } from "@/contexts/ToastContext";
import QRScanner from "@/components/client/QRScanner";
import Link from "next/link";

export default function ScanPage() {
  const router = useRouter();
  const { cartState } = useShopping();
  const { showToast } = useToast();
  const [productId, setProductId] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  // Manejar input manual de código
  const handleManualInput = () => {
    if (!productId.trim()) {
      showToast("Por favor ingresa un código de producto", "error");
      return;
    }

    // Redirigir a la página del producto con parámetro from=qr
    router.push(`/client/product/${productId}?from=qr`);
  };

  // Manejar escaneo exitoso de QR
  const handleQRScanSuccess = (decodedText: string) => {
    try {
      // El QR puede contener:
      // 1. Una URL completa: https://pimpos-system.vercel.app/client/product/123?from=qr
      // 2. Solo el ID del producto: 123

      let productId: string;

      // Verificar si es una URL
      if (decodedText.includes("http") || decodedText.includes("/")) {
        const url = new URL(decodedText);
        const pathParts = url.pathname.split("/");
        // El ID está en la última parte del path
        productId = pathParts[pathParts.length - 1];
      } else {
        // Asumir que es solo el ID del producto
        productId = decodedText;
      }

      // Cerrar el scanner
      setShowScanner(false);

      // Redirigir al producto con el parámetro from=qr
      router.push(`/client/product/${productId}?from=qr`);
    } catch (error) {
      console.error("Error al procesar QR:", error);
      setShowScanner(false);
      // Si hay error, intentar usar el texto tal cual
      router.push(`/client/product/${decodedText}?from=qr`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E37836] to-[#B55424] p-6 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/client"
              className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-white" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">SmartTag Pimpos</h1>
              <p className="text-white/90 text-sm">Tu compra inteligente</p>
            </div>
            {cartState.itemCount > 0 && (
              <Link
                href="/client/cart"
                className="relative bg-white/20 backdrop-blur-md rounded-xl p-3 hover:bg-white/30 transition-all"
              >
                <QrCode className="h-6 w-6 text-white" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {cartState.itemCount}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Logo pequeño */}
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              <Image
                src="/logo-pimpos.png"
                alt="Pimpos Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Card de escaneo */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-amber-200 p-8">
            <div className="space-y-6">
              {/* Instrucciones */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-br from-[#E37836] to-[#B55424] rounded-full p-4">
                    <Camera className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Escanea el QR
                </h2>
                <p className="text-gray-600 text-sm">
                  Acerca tu cámara al código QR del producto
                </p>
              </div>

              {/* Botón para abrir cámara */}
              <button
                onClick={() => setShowScanner(true)}
                className="w-full bg-gray-900 rounded-2xl p-8 relative overflow-hidden hover:bg-gray-800 transition-all"
              >
                {/* Esquinas del marco */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#E37836] rounded-tl-lg"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#E37836] rounded-tr-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#E37836] rounded-bl-lg"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#E37836] rounded-br-lg"></div>

                {/* Línea de escaneo animada */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#E37836] animate-pulse"></div>

                <div className="text-center">
                  <Camera className="h-32 w-32 mx-auto text-white/30" />
                  <p className="text-white/60 text-sm mt-4">
                    Toca para abrir la cámara
                  </p>
                </div>
              </button>

              {/* Separador */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500 font-medium">
                    o ingresa manualmente
                  </span>
                </div>
              </div>

              {/* Input manual de código */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  Código del producto
                </label>
                <input
                  type="text"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="Ej: PROD-001"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#E37836] focus:ring-2 focus:ring-[#E37836]/20 transition-all"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleManualInput();
                    }
                  }}
                />
              </div>

              {/* Botón */}
              <button
                onClick={handleManualInput}
                className="w-full bg-gradient-to-r from-[#E37836] to-[#B55424] text-white font-bold py-4 rounded-xl hover:from-[#B55424] hover:to-[#8B5A3C] transition-all shadow-lg hover:shadow-xl"
              >
                Buscar Producto
              </button>

              {/* Ayuda */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-blue-900 text-xs text-center">
                  💡 <strong>Tip:</strong> Puedes usar códigos de prueba como
                  &quot;PROD-001&quot; para ver un producto de ejemplo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleQRScanSuccess}
      />

      {/* Información del carrito en footer */}
      {cartState.itemCount > 0 && (
        <div className="bg-white border-t-2 border-gray-200 p-4 shadow-lg">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Productos en carrito</p>
              <p className="text-lg font-bold text-gray-900">
                {cartState.itemCount} item(s)
              </p>
            </div>
            <Link
              href="/client/cart"
              className="bg-gradient-to-r from-[#E37836] to-[#B55424] text-white font-bold px-6 py-3 rounded-xl hover:from-[#B55424] hover:to-[#8B5A3C] transition-all shadow-lg"
            >
              Ver Carrito
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
