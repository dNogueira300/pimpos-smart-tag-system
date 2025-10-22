// src/components/client/BudgetBar.tsx
"use client";

import { useShopping } from "@/contexts/ShoppingContext";
import { BudgetStatus } from "@/types/client";

export default function BudgetBar() {
  const { cartState, getBudgetStatus } = useShopping();

  if (cartState.budget === null) {
    return null; // No mostrar barra si no hay presupuesto
  }

  const status = getBudgetStatus();
  const percentage = Math.min(cartState.budgetPercentageUsed || 0, 100);

  const getStatusConfig = (status: BudgetStatus) => {
    switch (status) {
      case "healthy":
        return {
          bg: "bg-green-500",
          text: "text-green-900",
          barBg: "bg-green-100",
          message: "Te quedan presupuesto",
        };
      case "warning":
        return {
          bg: "bg-yellow-500",
          text: "text-yellow-900",
          barBg: "bg-yellow-100",
          message: "Atención a tu presupuesto",
        };
      case "exceeded":
        return {
          bg: "bg-red-500",
          text: "text-red-900",
          barBg: "bg-red-100",
          message: "Presupuesto excedido",
        };
      default:
        return {
          bg: "bg-gray-500",
          text: "text-gray-900",
          barBg: "bg-gray-100",
          message: "",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-gray-200 shadow-2xl z-40">
      <div className="max-w-md mx-auto p-4">
        {/* Barra de progreso */}
        <div className={`${config.barBg} h-3 rounded-full overflow-hidden mb-2`}>
          <div
            className={`${config.bg} h-full transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        {/* Información */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold text-gray-700">
              S/. {cartState.totalSpent.toFixed(2)} de S/.{" "}
              {cartState.budget.toFixed(2)}
            </p>
            <p className={`text-xs font-medium ${config.text}`}>
              {config.message}
            </p>
          </div>
          {cartState.budgetRemaining !== null && (
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">
                {cartState.budgetExceeded ? "Exceso:" : "Disponible:"}
              </p>
              <p
                className={`text-lg font-bold ${
                  cartState.budgetExceeded ? "text-red-600" : "text-green-600"
                }`}
              >
                S/.{" "}
                {cartState.budgetExceeded
                  ? (cartState.totalSpent - cartState.budget).toFixed(2)
                  : cartState.budgetRemaining.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
