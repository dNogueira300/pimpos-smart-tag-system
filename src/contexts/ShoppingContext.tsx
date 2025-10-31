// src/contexts/ShoppingContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, CartState, BudgetStatus } from "@/types/client";
import { Product } from "@/types/product";
import { v4 as uuidv4 } from "uuid";

interface ShoppingContextType {
  // Estado
  cartState: CartState;
  sessionId: string;
  budgetConfigured: boolean;

  // Acciones del carrito
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Acciones del presupuesto
  setBudget: (budget: number | null) => void;
  markBudgetAsConfigured: () => void;
  resetBudgetConfig: () => void;

  // Utilidades
  getBudgetStatus: () => BudgetStatus;
  getItemQuantity: (productId: string) => number;
  completeSession: () => Promise<void>;
  isSessionExpired: () => boolean;
  shouldShowBudgetModal: () => boolean;
}

const ShoppingContext = createContext<ShoppingContextType | undefined>(
  undefined
);

const STORAGE_KEY = "pimpos_shopping_session";
const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hora en milisegundos

export function ShoppingProvider({ children }: { children: React.ReactNode }) {
  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.sessionId || uuidv4();
        } catch {
          return uuidv4();
        }
      }
    }
    return uuidv4();
  });

  const [sessionStartTime] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.sessionStartTime || new Date().toISOString();
        } catch {
          return new Date().toISOString();
        }
      }
    }
    return new Date().toISOString();
  });

  const [budgetConfigured, setBudgetConfigured] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.budgetConfigured || false;
        } catch {
          return false;
        }
      }
    }
    return false;
  });

  const [cartState, setCartState] = useState<CartState>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return {
            items: parsed.items || [],
            budget: parsed.budget || null,
            totalSpent: parsed.totalSpent || 0,
            itemCount: parsed.itemCount || 0,
            budgetRemaining:
              parsed.budget !== null
                ? parsed.budget - parsed.totalSpent
                : null,
            budgetExceeded:
              parsed.budget !== null ? parsed.totalSpent > parsed.budget : false,
            budgetPercentageUsed:
              parsed.budget !== null && parsed.budget > 0
                ? (parsed.totalSpent / parsed.budget) * 100
                : null,
          };
        } catch {
          return getInitialState();
        }
      }
    }
    return getInitialState();
  });

  // Guardar en localStorage cuando cambie el estado
  useEffect(() => {
    if (typeof window !== "undefined") {
      const toStore = {
        sessionId,
        sessionStartTime,
        budgetConfigured,
        items: cartState.items,
        budget: cartState.budget,
        totalSpent: cartState.totalSpent,
        itemCount: cartState.itemCount,
        lastActivity: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    }
  }, [cartState, sessionId, sessionStartTime, budgetConfigured]);

  // Agregar producto al carrito
  const addToCart = (product: Product, quantity: number) => {
    setCartState((prev) => {
      const existingItemIndex = prev.items.findIndex(
        (item) => item.product.id === product.id
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Actualizar cantidad del producto existente
        newItems = [...prev.items];
        const newQuantity = newItems[existingItemIndex].quantity + quantity;
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newQuantity,
          totalPrice: newQuantity * newItems[existingItemIndex].unitPrice,
        };
      } else {
        // Agregar nuevo producto
        const unitPrice = product.hasPromotion && product.promotionPrice
          ? Number(product.promotionPrice)
          : Number(product.price);

        newItems = [
          ...prev.items,
          {
            product,
            quantity,
            unitPrice,
            totalPrice: unitPrice * quantity,
          },
        ];
      }

      const totalSpent = newItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        budget: prev.budget,
        totalSpent,
        itemCount,
        budgetRemaining:
          prev.budget !== null ? prev.budget - totalSpent : null,
        budgetExceeded: prev.budget !== null ? totalSpent > prev.budget : false,
        budgetPercentageUsed:
          prev.budget !== null && prev.budget > 0
            ? (totalSpent / prev.budget) * 100
            : null,
      };
    });
  };

  // Remover producto del carrito
  const removeFromCart = (productId: string) => {
    setCartState((prev) => {
      const newItems = prev.items.filter(
        (item) => item.product.id !== productId
      );

      const totalSpent = newItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        budget: prev.budget,
        totalSpent,
        itemCount,
        budgetRemaining:
          prev.budget !== null ? prev.budget - totalSpent : null,
        budgetExceeded: prev.budget !== null ? totalSpent > prev.budget : false,
        budgetPercentageUsed:
          prev.budget !== null && prev.budget > 0
            ? (totalSpent / prev.budget) * 100
            : null,
      };
    });
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartState((prev) => {
      const newItems = prev.items.map((item) => {
        if (item.product.id === productId) {
          return {
            ...item,
            quantity,
            totalPrice: item.unitPrice * quantity,
          };
        }
        return item;
      });

      const totalSpent = newItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        budget: prev.budget,
        totalSpent,
        itemCount,
        budgetRemaining:
          prev.budget !== null ? prev.budget - totalSpent : null,
        budgetExceeded: prev.budget !== null ? totalSpent > prev.budget : false,
        budgetPercentageUsed:
          prev.budget !== null && prev.budget > 0
            ? (totalSpent / prev.budget) * 100
            : null,
      };
    });
  };

  // Limpiar carrito
  const clearCart = () => {
    setCartState((prev) => ({
      ...getInitialState(),
      budget: prev.budget, // Mantener el presupuesto
    }));
  };

  // Establecer presupuesto
  const setBudget = (budget: number | null) => {
    setBudgetConfigured(true);
    setCartState((prev) => ({
      ...prev,
      budget,
      budgetRemaining: budget !== null ? budget - prev.totalSpent : null,
      budgetExceeded: budget !== null ? prev.totalSpent > budget : false,
      budgetPercentageUsed:
        budget !== null && budget > 0
          ? (prev.totalSpent / budget) * 100
          : null,
    }));
  };

  // Marcar que ya se configuró el presupuesto (o se decidió omitir)
  const markBudgetAsConfigured = () => {
    setBudgetConfigured(true);
  };

  // Resetear configuración de presupuesto (para cuando se escanea un QR)
  const resetBudgetConfig = () => {
    setBudgetConfigured(false);
  };

  // Obtener estado del presupuesto
  const getBudgetStatus = (): BudgetStatus => {
    if (cartState.budget === null) return "none";
    if (cartState.budgetExceeded) return "exceeded";

    const percentage = cartState.budgetPercentageUsed || 0;
    if (percentage >= 70) return "warning";
    return "healthy";
  };

  // Obtener cantidad de un producto en el carrito
  const getItemQuantity = (productId: string): number => {
    const item = cartState.items.find((item) => item.product.id === productId);
    return item?.quantity || 0;
  };

  // Completar sesión (guardar en DB)
  const completeSession = async () => {
    try {
      const response = await fetch("/api/client/session/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          budget: cartState.budget,
          totalSpent: cartState.totalSpent,
          itemCount: cartState.itemCount,
          items: cartState.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Error al completar la sesión");
      }

      // Limpiar localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }

      // Resetear estado completo incluyendo budgetConfigured
      setCartState(getInitialState());
      setBudgetConfigured(false);
    } catch (error) {
      console.error("Error al completar sesión:", error);
      throw error;
    }
  };

  // Verificar si la sesión ha expirado (más de 1 hora)
  const isSessionExpired = (): boolean => {
    if (!sessionStartTime) return true;

    const startTime = new Date(sessionStartTime).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - startTime;

    return timeDiff > SESSION_TIMEOUT_MS;
  };

  // Determinar si se debe mostrar el modal de presupuesto
  const shouldShowBudgetModal = (): boolean => {
    // Si ya está configurado y la sesión NO ha expirado, no mostrar
    if (budgetConfigured && !isSessionExpired()) {
      return false;
    }

    // Si es el primer escaneo (no hay items y no está configurado) o la sesión expiró
    return !budgetConfigured || isSessionExpired();
  };

  const value: ShoppingContextType = {
    cartState,
    sessionId,
    budgetConfigured,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setBudget,
    markBudgetAsConfigured,
    resetBudgetConfig,
    getBudgetStatus,
    getItemQuantity,
    completeSession,
    isSessionExpired,
    shouldShowBudgetModal,
  };

  return (
    <ShoppingContext.Provider value={value}>
      {children}
    </ShoppingContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useShopping() {
  const context = useContext(ShoppingContext);
  if (context === undefined) {
    throw new Error("useShopping debe usarse dentro de ShoppingProvider");
  }
  return context;
}

// Estado inicial
function getInitialState(): CartState {
  return {
    items: [],
    budget: null,
    totalSpent: 0,
    itemCount: 0,
    budgetRemaining: null,
    budgetExceeded: false,
    budgetPercentageUsed: null,
  };
}
