// src/app/client/layout.tsx
import { ShoppingProvider } from "@/contexts/ShoppingContext";
import { ToastProvider } from "@/contexts/ToastContext";

export const metadata = {
  title: "SmartTag Pimpos - Cliente",
  description: "Sistema de compras inteligente para Panadería Pimpos",
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShoppingProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
          {children}
        </div>
      </ToastProvider>
    </ShoppingProvider>
  );
}
