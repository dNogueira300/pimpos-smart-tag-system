// src/app/client/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Scan, DollarSign } from "lucide-react";
import { useShopping } from "@/contexts/ShoppingContext";
import { useToast } from "@/contexts/ToastContext";

export default function ClientWelcomePage() {
  const router = useRouter();
  const { setBudget, cartState } = useShopping();
  const { showToast } = useToast();

  const [budgetInput, setBudgetInput] = useState("");
  const [skipBudget, setSkipBudget] = useState(false);

  const handleSetBudget = () => {
    if (skipBudget) {
      setBudget(null);
      showToast("Continuando sin presupuesto", "info");
      router.push("/client/scan");
      return;
    }

    const amount = parseFloat(budgetInput);

    if (isNaN(amount) || amount <= 0) {
      showToast("Por favor ingresa un monto válido", "error");
      return;
    }

    setBudget(amount);
    showToast(`Presupuesto establecido: S/. ${amount.toFixed(2)}`, "success");
    router.push("/client/scan");
  };

  const handleContinueShopping = () => {
    router.push("/client/scan");
  };

  // Si ya hay items en el carrito, mostrar opción de continuar
  const hasItems = cartState.itemCount > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
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
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-amber-200 p-8">
          {/* Header naranja */}
          <div className="bg-gradient-to-r from-[#E37836] to-[#B55424] -m-8 mb-6 rounded-t-3xl p-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              SmartTag Pimpos
            </h1>
            <p className="text-white/90 text-sm">
              Tu compra inteligente
            </p>
          </div>

          <div className="space-y-6">
            {/* Título de bienvenida */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                ¡Bienvenido!
              </h2>
              <p className="text-gray-600 text-sm">
                Escanea productos y controla tu presupuesto de forma fácil
              </p>
            </div>

            {/* Si ya tiene items, mostrar resumen */}
            {hasItems && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                <p className="text-blue-900 font-semibold text-center">
                  Tienes {cartState.itemCount} producto(s) en tu carrito
                </p>
                <p className="text-blue-700 text-sm text-center mt-1">
                  Total: S/. {cartState.totalSpent.toFixed(2)}
                </p>
              </div>
            )}

            {/* Configuración de presupuesto */}
            {!hasItems && (
              <>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    ¿Cuánto piensas gastar hoy?
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      placeholder="0.00"
                      disabled={skipBudget}
                      className="w-full pl-12 pr-4 py-4 text-2xl font-bold text-center border-2 border-gray-300 rounded-xl focus:border-[#E37836] focus:ring-2 focus:ring-[#E37836]/20 transition-all disabled:bg-gray-100 disabled:text-gray-400"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Checkbox para seguir sin presupuesto */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="skipBudget"
                    checked={skipBudget}
                    onChange={(e) => setSkipBudget(e.target.checked)}
                    className="w-5 h-5 text-[#E37836] border-gray-300 rounded focus:ring-[#E37836]"
                  />
                  <label
                    htmlFor="skipBudget"
                    className="text-gray-700 font-medium cursor-pointer"
                  >
                    Seguir sin presupuesto
                  </label>
                </div>

                {/* Botón establecer presupuesto */}
                <button
                  onClick={handleSetBudget}
                  className="w-full bg-gradient-to-r from-[#8B5A3C] to-[#6B4423] text-white font-bold py-4 rounded-xl hover:from-[#6B4423] hover:to-[#4A2F18] transition-all shadow-lg hover:shadow-xl"
                >
                  {skipBudget ? "Continuar sin presupuesto" : "Establecer Presupuesto"}
                </button>
              </>
            )}

            {/* Botón para continuar comprando (si ya tiene items) */}
            {hasItems && (
              <button
                onClick={handleContinueShopping}
                className="w-full bg-gradient-to-r from-[#E37836] to-[#B55424] text-white font-bold py-4 rounded-xl hover:from-[#B55424] hover:to-[#8B5A3C] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Scan className="h-5 w-5" />
                Escanear otro producto
              </button>
            )}

            {/* Información de ayuda */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-amber-900 text-xs text-center">
                💡 Te ayudaremos a mantener tu presupuesto. Los avisos aparecerán al escanear productos.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Desarrollado con amor por Pimpos 🍞
        </p>
      </div>
    </div>
  );
}
