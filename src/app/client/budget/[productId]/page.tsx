// src/app/client/budget/[productId]/page.tsx
"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DollarSign, ArrowRight } from "lucide-react";
import { useShopping } from "@/contexts/ShoppingContext";

export default function BudgetPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const router = useRouter();
  const { setBudget, markBudgetAsConfigured } = useShopping();
  const [budgetValue, setBudgetValue] = useState("");

  const handleSetBudget = () => {
    const budget = parseFloat(budgetValue);
    if (budget > 0) {
      setBudget(budget);
      router.push(`/client/product/${productId}`);
    }
  };

  const handleSkip = () => {
    markBudgetAsConfigured();
    router.push(`/client/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E37836] to-[#B55424] p-6 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-4">
            <div className="relative w-16 h-16">
              <Image
                src="/logo-pimpos.png"
                alt="Pimpos Logo"
                width={64}
                height={64}
                className="rounded-full object-cover shadow-lg border-2 border-white"
                priority
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">SmartTag Pimpos</h1>
              <p className="text-white/90 text-sm">Tu compra inteligente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Card de configuración de presupuesto */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-amber-200 p-8">
            <div className="space-y-6">
              {/* Icono y título */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-br from-[#E37836] to-[#B55424] rounded-full p-4">
                    <DollarSign className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¿Tienes un presupuesto?
                </h2>
                <p className="text-gray-600 text-sm">
                  Te ayudaremos a mantener tus gastos bajo control
                </p>
              </div>

              {/* Beneficios */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-blue-900 text-center mb-2 font-semibold">
                  Ventajas de establecer un presupuesto:
                </p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Recibirás alertas cuando te acerques al límite</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Verás claramente cuánto te queda disponible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Te ayudará a comprar de forma consciente</span>
                  </li>
                </ul>
              </div>

              {/* Input de presupuesto */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  Presupuesto disponible
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                    S/
                  </span>
                  <input
                    type="number"
                    value={budgetValue}
                    onChange={(e) => setBudgetValue(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-12 pr-4 py-4 text-xl font-bold text-center border-2 border-gray-300 rounded-xl focus:border-[#E37836] focus:ring-2 focus:ring-[#E37836]/20 transition-all"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && budgetValue) {
                        handleSetBudget();
                      }
                    }}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="space-y-3">
                <button
                  onClick={handleSetBudget}
                  disabled={!budgetValue || parseFloat(budgetValue) <= 0}
                  className="w-full bg-gradient-to-r from-[#E37836] to-[#B55424] text-white font-bold py-4 rounded-xl hover:from-[#B55424] hover:to-[#8B5A3C] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Establecer presupuesto
                  <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  onClick={handleSkip}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-all border-2 border-gray-200 flex items-center justify-center gap-2"
                >
                  Omitir
                </button>
              </div>

              {/* Nota */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                <p className="text-amber-900 text-xs text-center">
                  💡 <strong>Tip:</strong> Puedes cambiar tu presupuesto en
                  cualquier momento desde el carrito
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer decorativo */}
      <div className="bg-white/80 backdrop-blur-md border-t-2 border-gray-200 p-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-gray-500 text-xs">
            Sistema Web de Información Productiva - Panadería Pimpos
          </p>
        </div>
      </div>
    </div>
  );
}
