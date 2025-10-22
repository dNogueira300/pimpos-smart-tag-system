// src/app/client/cart/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Scan,
  CheckCircle,
} from "lucide-react";
import { useShopping } from "@/contexts/ShoppingContext";
import { useToast } from "@/contexts/ToastContext";
import BudgetBar from "@/components/client/BudgetBar";
import Modal, { ModalActions } from "@/components/client/Modal";

export default function CartPage() {
  const router = useRouter();
  const { cartState, updateQuantity, removeFromCart, clearCart, completeSession } = useShopping();
  const { showToast } = useToast();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isCompletingSession, setIsCompletingSession] = useState(false);

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      removeFromCart(productToDelete);
      showToast("Producto eliminado del carrito", "info");
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleClearCart = () => {
    setShowClearModal(true);
  };

  const confirmClearCart = () => {
    clearCart();
    showToast("Carrito vaciado", "info");
    setShowClearModal(false);
    router.push("/client");
  };

  const handleFinish = async () => {
    setIsCompletingSession(true);
    try {
      await completeSession();
      showToast("Compra registrada exitosamente!", "success");
      router.push("/client/thank-you");
    } catch (error) {
      console.error("Error al completar sesion:", error);
      showToast("Error al finalizar la compra", "error");
    } finally {
      setIsCompletingSession(false);
    }
  };

  const hasItems = cartState.itemCount > 0;

  return (
    <>
      <div className="min-h-screen pb-32">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E37836] to-[#B55424] p-6 shadow-lg sticky top-0 z-30">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/client/scan"
                className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all"
              >
                <ArrowLeft className="h-6 w-6 text-white" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">Mi carrito</h1>
                <p className="text-white/90 text-sm">
                  {hasItems ? `${cartState.itemCount} producto(s)` : "Carrito vacio"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="max-w-md mx-auto p-6">
          {!hasItems ? (
            /* Carrito vacío */
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border-4 border-amber-200">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scan className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Tu carrito esta vacio
              </h2>
              <p className="text-gray-600 mb-8">
                Escanea productos para comenzar tu compra
              </p>
              <Link
                href="/client/scan"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E37836] to-[#B55424] text-white font-bold px-8 py-4 rounded-xl hover:from-[#B55424] hover:to-[#8B5A3C] transition-all shadow-lg"
              >
                <Scan className="h-5 w-5" />
                Escanear producto
              </Link>
            </div>
          ) : (
            /* Carrito con productos */
            <div className="space-y-6">
              {/* Título y botón para vaciar */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Carrito ({cartState.itemCount})
                </h2>
                <button
                  onClick={handleClearCart}
                  className="text-red-600 text-sm font-medium hover:text-red-700 transition-all"
                >
                  Vaciar carrito
                </button>
              </div>

              {/* Lista de productos */}
              <div className="space-y-4">
                {cartState.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 flex gap-4"
                  >
                    {/* Imagen */}
                    <div className="relative w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex-shrink-0">
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Scan className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Información */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        S/. {item.unitPrice.toFixed(2)} c/u
                      </p>

                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                          className="w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center"
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                          className="w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Precio total y eliminar */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => handleDeleteProduct(item.product.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                      <p className="font-bold text-[#B55424]">
                        S/. {item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón para escanear otro producto */}
              <Link
                href="/client/scan"
                className="w-full bg-yellow-400 text-yellow-900 font-bold py-4 rounded-xl hover:bg-yellow-500 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Scan className="h-5 w-5" />
                Escanear otro producto
              </Link>

              {/* Resumen de compra */}
              <div className="bg-white rounded-3xl shadow-2xl border-4 border-amber-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  RESUMEN DE COMPRA
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({cartState.itemCount} items):
                    </span>
                    <span className="font-semibold text-gray-900">
                      S/. {cartState.totalSpent.toFixed(2)}
                    </span>
                  </div>

                  {cartState.budget !== null && (
                    <>
                      <div className="border-t border-gray-200 pt-3"></div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Presupuesto:</span>
                        <span className="font-semibold text-gray-900">
                          S/. {cartState.budget.toFixed(2)}
                        </span>
                      </div>
                      <div
                        className={`flex justify-between text-sm font-bold ${
                          cartState.budgetExceeded
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        <span>
                          {cartState.budgetExceeded
                            ? "Exceso:"
                            : "Disponible:"}
                        </span>
                        <span>
                          S/.{" "}
                          {cartState.budgetExceeded
                            ? (
                                cartState.totalSpent - cartState.budget
                              ).toFixed(2)
                            : cartState.budgetRemaining?.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="border-t-2 border-gray-300 pt-3"></div>
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      TOTAL
                    </span>
                    <span className="text-2xl font-bold text-[#B55424]">
                      S/. {cartState.totalSpent.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón finalizar */}
              <button
                onClick={handleFinish}
                disabled={isCompletingSession}
                className="w-full bg-black text-white font-bold py-5 rounded-xl hover:bg-gray-800 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCompletingSession ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Finalizar
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Barra de presupuesto */}
      {hasItems && <BudgetBar />}

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar producto?"
        showCloseButton={false}
      >
        <p className="text-gray-700 mb-6 text-center">
          Estas seguro de eliminar este producto del carrito?
        </p>
        <ModalActions>
          <button
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={confirmDelete}
            className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-all"
          >
            Si, eliminar
          </button>
        </ModalActions>
      </Modal>

      {/* Modal de confirmación de vaciar carrito */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Vaciar carrito?"
        showCloseButton={false}
      >
        <p className="text-gray-700 mb-6 text-center">
          Estas seguro de vaciar todo el carrito? Esta accion no se puede deshacer.
        </p>
        <ModalActions>
          <button
            onClick={() => setShowClearModal(false)}
            className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={confirmClearCart}
            className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-all"
          >
            Si, vaciar
          </button>
        </ModalActions>
      </Modal>
    </>
  );
}
