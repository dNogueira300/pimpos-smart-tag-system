// src/app/client/thank-you/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import html2canvas from "html2canvas";
import { CheckCircle, Home, Download, Ticket } from "lucide-react";

interface TicketData {
  ticketNumber: string;
  items: Array<{
    product: {
      id: string;
      name: string;
    };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  budget: number | null;
  totalSpent: number;
  itemCount: number;
  budgetExceeded: boolean;
  budgetRemaining: number | null;
  createdAt: string;
}

export default function ThankYouPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [isDownloadingTicket, setIsDownloadingTicket] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Cargar datos del ticket desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTicket = localStorage.getItem("pimpos_last_ticket");
      if (storedTicket) {
        try {
          const parsed = JSON.parse(storedTicket);
          setTicketData(parsed);
        } catch (error) {
          console.error("Error al cargar ticket:", error);
        }
      }
    }
  }, []);

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
      // Limpiar el ticket del localStorage antes de redirigir
      if (typeof window !== "undefined") {
        localStorage.removeItem("pimpos_last_ticket");
      }
      router.push("/client");
    }
  }, [countdown, router]);

  const handleDownloadTicket = async () => {
    if (!ticketRef.current || !ticketData) return;

    setIsDownloadingTicket(true);
    try {
      // Hacer visible temporalmente el ticket para capturarlo
      ticketRef.current.style.display = "block";

      // Capturar el elemento como imagen
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: "#FFFFFF",
        scale: 2, // Mayor calidad
        logging: false,
        useCORS: true,
      });

      // Ocultar nuevamente el ticket
      ticketRef.current.style.display = "none";

      // Convertir a blob y descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `ticket-${ticketData.ticketNumber}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error("Error al descargar ticket:", error);
      if (ticketRef.current) {
        ticketRef.current.style.display = "none";
      }
    } finally {
      setIsDownloadingTicket(false);
    }
  };

  const handleGoHome = () => {
    // Limpiar el ticket del localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("pimpos_last_ticket");
    }
    router.push("/client");
  };

  return (
    <>
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
              <p className="text-2xl font-bold text-gray-900">VUELVA PRONTO</p>

              {/* Información del ticket */}
              {ticketData && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Ticket className="h-5 w-5 text-amber-700" />
                    <p className="text-amber-900 font-bold text-lg">
                      Número de Ticket
                    </p>
                  </div>
                  <p className="text-2xl font-mono font-bold text-amber-900 mb-3">
                    {ticketData.ticketNumber}
                  </p>
                  <p className="text-amber-700 text-xs">
                    Tu compra ha sido registrada exitosamente
                  </p>
                </div>
              )}

              {/* Botón de descarga */}
              {ticketData && (
                <button
                  onClick={handleDownloadTicket}
                  disabled={isDownloadingTicket}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDownloadingTicket ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Generando ticket...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Descargar ticket
                    </>
                  )}
                </button>
              )}

              {/* Countdown */}
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">
                  Redirigiendo en {countdown} segundo{countdown !== 1 ? "s" : ""}
                  ...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#E37836] to-[#B55424] h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Botón para ir directamente */}
              <button
                onClick={handleGoHome}
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

      {/* Ticket para descarga (invisible hasta que se genera) */}
      {ticketData && (
        <div
          ref={ticketRef}
          style={{ display: "none", backgroundColor: "#FFFFFF" }}
        >
          <div
            style={{
              width: "400px",
              padding: "32px",
              backgroundColor: "#FFFFFF",
            }}
          >
            {/* Header del ticket */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "24px",
                paddingBottom: "16px",
                borderBottom: "2px solid #D1D5DB",
              }}
            >
              <h1
                style={{
                  fontSize: "30px",
                  fontWeight: "bold",
                  color: "#E37836",
                  marginBottom: "8px",
                }}
              >
                SmartTag Pimpos
              </h1>
              <p style={{ fontSize: "14px", color: "#4B5563" }}>
                Ticket de Compra
              </p>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#111827",
                  marginTop: "8px",
                  fontFamily: "monospace",
                }}
              >
                {ticketData.ticketNumber}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#6B7280",
                  marginTop: "4px",
                }}
              >
                {new Date(ticketData.createdAt).toLocaleDateString("es-PE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Lista de productos */}
            <div style={{ marginBottom: "24px" }}>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: "12px",
                }}
              >
                Productos ({ticketData.itemCount})
              </h2>
              <div>
                {ticketData.items.map((item, index) => (
                  <div
                    key={item.product.id}
                    style={{
                      paddingBottom: "12px",
                      borderBottom: "1px solid #E5E7EB",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#111827",
                          fontSize: "14px",
                          flex: 1,
                        }}
                      >
                        {index + 1}. {item.product.name}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        color: "#4B5563",
                      }}
                    >
                      <span>
                        {item.quantity} x S/. {item.unitPrice.toFixed(2)}
                      </span>
                      <span
                        style={{ fontWeight: "bold", color: "#111827" }}
                      >
                        S/. {item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen */}
            <div
              style={{
                borderTop: "2px solid #D1D5DB",
                paddingTop: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "#4B5563" }}>Subtotal:</span>
                <span style={{ fontWeight: "600", color: "#111827" }}>
                  S/. {ticketData.totalSpent.toFixed(2)}
                </span>
              </div>

              {ticketData.budget !== null && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "14px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "#4B5563" }}>Presupuesto:</span>
                    <span style={{ fontWeight: "600", color: "#111827" }}>
                      S/. {ticketData.budget.toFixed(2)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: ticketData.budgetExceeded
                        ? "#DC2626"
                        : "#059669",
                      marginBottom: "8px",
                    }}
                  >
                    <span>
                      {ticketData.budgetExceeded ? "Exceso:" : "Disponible:"}
                    </span>
                    <span>
                      S/.{" "}
                      {ticketData.budgetExceeded
                        ? (
                            ticketData.totalSpent - ticketData.budget
                          ).toFixed(2)
                        : ticketData.budgetRemaining?.toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              <div
                style={{
                  borderTop: "2px solid #D1D5DB",
                  paddingTop: "12px",
                  marginTop: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#111827",
                    }}
                  >
                    TOTAL
                  </span>
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#B55424",
                    }}
                  >
                    S/. {ticketData.totalSpent.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#6B7280",
                borderTop: "1px solid #E5E7EB",
                paddingTop: "16px",
                marginTop: "16px",
              }}
            >
              <p style={{ marginBottom: "4px" }}>¡Gracias por tu compra!</p>
              <p>SmartTag Pimpos - Tu compra inteligente</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
