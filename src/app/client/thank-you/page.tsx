// src/app/client/thank-you/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle, Home } from "lucide-react";

export default function ThankYouPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Efecto para el countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Efecto separado para la navegación
  useEffect(() => {
    if (countdown === 0) {
      router.push("/client");
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-scale-in">
          <div className="relative w-32 h-32">
            <Image
              src="/logo-pimpos.png"
              alt="Pimpos Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Card principal */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-green-200 p-8 text-center animate-slide-up">
          {/* Header verde */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 -m-8 mb-6 rounded-t-3xl p-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              ¡GRACIAS POR
            </h1>
            <h2 className="text-2xl font-bold text-white">
              CONFIAR EN NOSOTROS!
            </h2>
          </div>

          {/* Contenido */}
          <div className="space-y-6">
            <p className="text-2xl font-bold text-gray-900">
              VUELVA PRONTO
            </p>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
              <p className="text-amber-900 text-sm mb-2">
                Tu compra ha sido registrada exitosamente
              </p>
              <p className="text-amber-700 text-xs">
                Gracias por usar SmartTag Pimpos 🍞
              </p>
            </div>

            {/* Countdown */}
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">
                Redirigiendo en {countdown} segundo{countdown !== 1 ? "s" : ""}...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#E37836] to-[#B55424] h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Botón para ir directamente */}
            <button
              onClick={() => router.push("/client")}
              className="w-full bg-gradient-to-r from-[#E37836] to-[#B55424] text-white font-bold py-4 rounded-xl hover:from-[#B55424] hover:to-[#8B5A3C] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Home className="h-5 w-5" />
              Iniciar nueva compra
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Panadería y Minimarket Pimpos
        </p>
        <p className="text-center text-gray-500 text-xs mt-1">
          Tu tienda de confianza 🍞❤️
        </p>
      </div>
    </div>
  );
}
