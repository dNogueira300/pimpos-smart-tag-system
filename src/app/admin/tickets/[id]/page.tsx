// src/app/admin/tickets/[id]/page.tsx
"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Receipt,
  Calendar,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";

interface TicketItem {
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  sessionId: string | null;
  totalAmount: number;
  budget: number | null;
  itemCount: number;
  items: TicketItem[];
  budgetExceeded: boolean;
  createdAt: string;
}

interface TicketPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TicketDetailPage({ params }: TicketPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/admin/tickets/${id}`);
        if (!response.ok) {
          throw new Error("Ticket no encontrado");
        }
        const data = await response.json();
        setTicket(data.ticket);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar ticket"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-amber-400/20 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Cargando ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700 mb-6">{error || "Ticket no encontrado"}</p>
          <Link
            href="/admin/tickets"
            className="inline-block bg-gradient-to-r from-[#E37836] to-[#B55424] text-white font-bold px-6 py-3 rounded-xl hover:from-[#B55424] hover:to-[#8B5A3C] transition-all"
          >
            Volver a tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#B55424] to-[#E37836] rounded-3xl p-6 shadow-2xl border-4 border-amber-200">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/tickets"
            className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              Detalles del Ticket
            </h1>
            <p className="text-white/90">{ticket.ticketNumber}</p>
          </div>
        </div>
      </div>

      {/* Información del ticket */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-blue-600 text-sm font-medium">Fecha</p>
              <p className="text-lg font-bold text-blue-900">
                {new Date(ticket.createdAt).toLocaleDateString("es-PE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-blue-700">
                {new Date(ticket.createdAt).toLocaleTimeString("es-PE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-green-600 text-sm font-medium">
                Total de Items
              </p>
              <p className="text-lg font-bold text-green-900">
                {ticket.itemCount} producto{ticket.itemCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`${
            ticket.budgetExceeded
              ? "bg-red-50 border-red-200"
              : "bg-purple-50 border-purple-200"
          } border rounded-xl p-4`}
        >
          <div className="flex items-center space-x-3">
            <DollarSign
              className={`h-8 w-8 ${
                ticket.budgetExceeded ? "text-red-500" : "text-purple-500"
              }`}
            />
            <div>
              <p
                className={`text-sm font-medium ${
                  ticket.budgetExceeded ? "text-red-600" : "text-purple-600"
                }`}
              >
                {ticket.budgetExceeded
                  ? "Presupuesto Excedido"
                  : "Presupuesto"}
              </p>
              <p
                className={`text-lg font-bold ${
                  ticket.budgetExceeded ? "text-red-900" : "text-purple-900"
                }`}
              >
                {ticket.budget
                  ? `S/. ${ticket.budget.toFixed(2)}`
                  : "No establecido"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detalles de productos */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Receipt className="h-6 w-6 text-amber-500" />
          Productos Comprados
        </h2>

        <div className="space-y-3">
          {ticket.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {index + 1}. {item.productName || `Producto ${item.productId}`}
                </p>
                <p className="text-sm text-gray-600">
                  {item.quantity} x S/. {item.unitPrice.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  S/. {item.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen de compra */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Resumen de Compra
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Subtotal ({ticket.itemCount} items):
            </span>
            <span className="font-semibold text-gray-900">
              S/. {ticket.totalAmount.toFixed(2)}
            </span>
          </div>

          {ticket.budget !== null && (
            <>
              <div className="border-t border-gray-200 pt-3"></div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Presupuesto:</span>
                <span className="font-semibold text-gray-900">
                  S/. {ticket.budget.toFixed(2)}
                </span>
              </div>
              <div
                className={`flex justify-between text-sm font-bold ${
                  ticket.budgetExceeded ? "text-red-600" : "text-green-600"
                }`}
              >
                <span>
                  {ticket.budgetExceeded ? "Exceso:" : "Disponible:"}
                </span>
                <span>
                  S/.{" "}
                  {ticket.budgetExceeded
                    ? (ticket.totalAmount - ticket.budget).toFixed(2)
                    : (ticket.budget - ticket.totalAmount).toFixed(2)}
                </span>
              </div>
            </>
          )}

          <div className="border-t-2 border-gray-300 pt-3"></div>
          <div className="flex justify-between">
            <span className="text-lg font-bold text-gray-900">TOTAL</span>
            <span className="text-2xl font-bold text-[#B55424]">
              S/. {ticket.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Información Adicional
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">ID de Sesión:</span>
            <p className="font-mono text-gray-900 break-all">
              {ticket.sessionId || "No disponible"}
            </p>
          </div>
          <div>
            <span className="text-gray-600">ID del Ticket:</span>
            <p className="font-mono text-gray-900 break-all">{ticket.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
