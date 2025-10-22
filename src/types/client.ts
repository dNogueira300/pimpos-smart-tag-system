// src/types/client.ts

import { Product } from "./product";

// Item en el carrito
export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Sesión de compra del cliente
export interface ShoppingSession {
  id: string;
  sessionId: string;
  budget: number | null;
  totalSpent: number;
  itemCount: number;
  items: CartItem[];
  lastActivity: Date;
  isCompleted: boolean;
  createdAt: Date;
}

// Estado del carrito
export interface CartState {
  items: CartItem[];
  budget: number | null;
  totalSpent: number;
  itemCount: number;
  budgetRemaining: number | null;
  budgetExceeded: boolean;
  budgetPercentageUsed: number | null;
}

// Tipos de notificaciones
export type NotificationType = "success" | "error" | "warning" | "info";

// Notificación Toast
export interface ToastNotification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

// Estado del presupuesto (para visualización)
export type BudgetStatus = "healthy" | "warning" | "exceeded" | "none";
