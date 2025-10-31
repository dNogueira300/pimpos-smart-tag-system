// src/app/client/product/[id]/page.tsx
"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import { Product } from "@/types/product";
import { useShopping } from "@/contexts/ShoppingContext";
import BudgetBar from "@/components/client/BudgetBar";
import Modal, { ModalActions } from "@/components/client/Modal";
import QRScanner from "@/components/client/QRScanner";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const {
    addToCart,
    cartState,
    getItemQuantity,
    budgetConfigured,
    resetBudgetConfig,
    shouldShowBudgetModal,
    isSessionExpired
  } = useShopping();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Detectar si viene de un QR y verificar si debe mostrar presupuesto
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const fromQR = urlParams.get("from") === "qr";

      if (fromQR) {
        // Solo resetear si debe mostrar el modal (primera vez o sesión expirada)
        if (shouldShowBudgetModal()) {
          resetBudgetConfig();
        }
      }
    }
  }, [resetBudgetConfig, shouldShowBudgetModal]);

  // Redirigir a configuración de presupuesto si debe mostrarse
  useEffect(() => {
    // Solo redirigir si realmente debe mostrar el modal de presupuesto
    if (shouldShowBudgetModal() && !budgetConfigured) {
      router.replace(`/client/budget/${id}`);
    }
  }, [budgetConfigured, id, router, shouldShowBudgetModal]);

  // Cargar producto
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/client/products/${id}`);
        if (!response.ok) {
          throw new Error("Producto no encontrado");
        }
        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar producto"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (budgetConfigured) {
      fetchProduct();
    }
  }, [id, budgetConfigured]);

  const handleAddToCart = () => {
    if (!product) return;

    const currentPrice =
      product.hasPromotion && product.promotionPrice
        ? Number(product.promotionPrice)
        : Number(product.price);

    const totalPrice = currentPrice * quantity;

    // Verificar si excederá el presupuesto
    if (
      cartState.budget !== null &&
      cartState.totalSpent + totalPrice > cartState.budget
    ) {
      setShowWarningModal(true);
      return;
    }

    addToCart(product, quantity);
    setShowSuccessModal(true);
  };

  const handleContinueShopping = () => {
    setShowSuccessModal(false);
    setShowScanner(true);
  };

  const handleGoToCart = () => {
    setShowSuccessModal(false);
    router.push("/client/cart");
  };

  const handleQRScanSuccess = (decodedText: string) => {
    try {
      // El QR puede contener:
      // 1. Una URL completa: https://pimpos-system.vercel.app/client/product/123?from=qr
      // 2. Solo el ID del producto: 123

      let productId: string;

      // Verificar si es una URL
      if (decodedText.includes("http") || decodedText.includes("/")) {
        const url = new URL(decodedText);
        const pathParts = url.pathname.split("/");
        // El ID está en la última parte del path
        productId = pathParts[pathParts.length - 1];
      } else {
        // Asumir que es solo el ID del producto
        productId = decodedText;
      }

      // Redirigir al producto con el parámetro from=qr
      router.push(`/client/product/${productId}?from=qr`);
    } catch (error) {
      console.error("Error al procesar QR:", error);
      // Si hay error, intentar usar el texto tal cual
      router.push(`/client/product/${decodedText}?from=qr`);
    }
  };

  const handleAddDespiteWarning = () => {
    if (!product) return;
    addToCart(product, quantity);
    setShowWarningModal(false);
    setShowSuccessModal(true);
  };

  // Calcular días hasta vencimiento
  const getDaysUntilExpiry = () => {
    if (!product?.expiresAt) return null;
    const expiryDate = new Date(product.expiresAt);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = () => {
    const days = getDaysUntilExpiry();
    if (days === null) return null;

    if (days < 0)
      return {
        text: "Vencido",
        color: "bg-red-500",
        textColor: "text-white",
      };
    if (days === 0)
      return {
        text: "Vence hoy",
        color: "bg-red-500",
        textColor: "text-white",
      };
    if (days <= 3)
      return {
        text: `Vence en ${days} días`,
        color: "bg-red-400",
        textColor: "text-white",
      };
    if (days <= 7)
      return {
        text: `Vence en ${days} días`,
        color: "bg-yellow-400",
        textColor: "text-black",
      };
    return {
      text: `Vence: ${new Date(product!.expiresAt!).toLocaleDateString()}`,
      color: "bg-green-500",
      textColor: "text-white",
    };
  };

  const currentPrice =
    product?.hasPromotion && product?.promotionPrice
      ? Number(product.promotionPrice)
      : Number(product?.price || 0);

  const alreadyInCart = product ? getItemQuantity(product.id) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFEF7]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#E37836]/20 border-t-[#E37836] rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FFFEF7]">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700 mb-6">
            {error || "Producto no encontrado"}
          </p>
          <Link
            href="/client/scan"
            className="inline-block bg-gradient-to-r from-[#E37836] to-[#B55424] text-white font-bold px-6 py-3 rounded-xl hover:from-[#B55424] hover:to-[#8B5A3C] transition-all"
          >
            Volver a escanear
          </Link>
        </div>
      </div>
    );
  }

  const expiryStatus = getExpiryStatus();
  const warnings = [
    product.highSugar && "ALTO EN AZÚCAR",
    product.highSatFat && "ALTO EN GRASAS SATURADAS",
    product.highSodium && "ALTO EN SODIO",
    product.highTransFat && "ALTO EN GRASAS TRANS",
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FFFEF7] pb-36">
      {/* Header - coincide con el prototipo */}
      <div className="bg-gradient-to-r from-[#E37836] to-[#B55424] p-4 shadow-lg">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-xl font-bold text-white">SmartTag Pimpos</h1>
        </div>
      </div>

      {/* Sección de imagen con fondo #FFF6DA en todo el ancho */}
      <div className="bg-[#FFF6DA] py-4">
        <div className="flex justify-center">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={160}
              height={160}
              className="object-cover"
            />
          ) : (
            <div className="w-40 h-40 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">Sin imagen</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Información del producto - alineado a la izquierda */}
        <div className="space-y-3">
          {/* Nombre del producto - alineado a la izquierda */}
          <h2 className="text-2xl font-bold text-black text-left">
            {product.name}
          </h2>

          {/* Categoría - alineado a la izquierda */}
          <p className="text-gray-600 text-sm text-left">
            {product.category?.name || "Panadería"}
          </p>

          {/* Precio - caja con borde naranja y fondo #FFF6DA */}
          <div className="border-2 border-[#E37836] rounded-2xl p-4 bg-[#FFF6DA]">
            {product.hasPromotion && product.promotionPrice ? (
              <div className="space-y-1 text-center">
                <span className="text-3xl font-bold text-[#E37836]">
                  S/. {Number(product.promotionPrice).toFixed(2)}
                </span>
                <div className="text-sm">
                  <span className="text-gray-500 line-through">
                    S/. {Number(product.price).toFixed(2)}
                  </span>
                  {product.promotionText && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {product.promotionText}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-3xl font-bold text-[#E37836]">
                  S/. {Number(product.price).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Estado de vencimiento - igual al prototipo */}
          {expiryStatus && (
            <div
              className={`${expiryStatus.color} ${expiryStatus.textColor} px-4 py-2 rounded-xl inline-block`}
            >
              <span className="font-semibold text-sm">{expiryStatus.text}</span>
            </div>
          )}

          {/* Etiqueta de producto fresco (si aplica) */}
          {expiryStatus &&
            getDaysUntilExpiry() &&
            getDaysUntilExpiry()! > 7 && (
              <div className="bg-green-500 text-white px-4 py-2 rounded-xl inline-block">
                <span className="font-semibold text-sm">Producto fresco</span>
              </div>
            )}
        </div>

        {/* Advertencias nutricionales - octágonos como en el prototipo */}
        {warnings.length > 0 && (
          <div>
            <p className="text-black font-semibold text-sm mb-3">
              Advertencias Nutricionales
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {warnings.map((warning, index) => (
                <div
                  key={index}
                  className="relative bg-black text-white text-[10px] font-bold flex items-center justify-center w-20 h-20"
                  style={{
                    clipPath:
                      "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                  }}
                >
                  <span className="text-center leading-tight px-1 break-words">
                    {warning}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones desplegables - igual al prototipo */}
        <div className="space-y-2">
          {/* Acordeón: Información nutricional */}
          {(product.calories !== null ||
            product.totalFat !== null ||
            product.totalCarbs !== null ||
            product.protein !== null ||
            product.sodium !== null) && (
            <div className="border border-gray-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowNutrition(!showNutrition)}
                className="w-full bg-gray-200 text-black font-medium py-3 px-4 flex items-center justify-between hover:bg-gray-300 transition-all"
              >
                <span>Ver información nutricional</span>
                {showNutrition ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {showNutrition && (
                <div className="p-4 bg-white space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-3">
                      INFORMACIÓN NUTRICIONAL (por 100g)
                    </p>
                    {product.calories !== null && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium">Energía</span>
                        <span className="text-sm">{product.calories} kcal</span>
                      </div>
                    )}
                    {product.totalFat !== null && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium">
                          Grasas totales
                        </span>
                        <span className="text-sm">{product.totalFat} g</span>
                      </div>
                    )}
                    {product.saturatedFat !== null && (
                      <div className="flex justify-between py-2 border-b border-gray-200 pl-4">
                        <span className="text-xs">Grasas saturadas</span>
                        <span className="text-xs">
                          {product.saturatedFat} g
                        </span>
                      </div>
                    )}
                    {product.totalCarbs !== null && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium">
                          Carbohidratos
                        </span>
                        <span className="text-sm">{product.totalCarbs} g</span>
                      </div>
                    )}
                    {product.sugars !== null && (
                      <div className="flex justify-between py-2 border-b border-gray-200 pl-4">
                        <span className="text-xs">Azúcares</span>
                        <span className="text-xs">{product.sugars} g</span>
                      </div>
                    )}
                    {product.protein !== null && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-sm font-medium">Proteínas</span>
                        <span className="text-sm">{product.protein} g</span>
                      </div>
                    )}
                    {product.sodium !== null && (
                      <div className="flex justify-between py-2">
                        <span className="text-sm font-medium">Sal</span>
                        <span className="text-sm">{product.sodium} mg</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Acordeón: Ingredientes */}
          {product.ingredients && (
            <div className="border border-gray-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowIngredients(!showIngredients)}
                className="w-full bg-gray-200 text-black font-medium py-3 px-4 flex items-center justify-between hover:bg-gray-300 transition-all"
              >
                <span>Ver lista de ingredientes</span>
                {showIngredients ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {showIngredients && (
                <div className="p-4 bg-white space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-2">
                      INGREDIENTES
                    </p>
                    <p className="text-sm text-gray-700">
                      {product.ingredients}
                    </p>
                  </div>
                  {product.allergens && (
                    <div>
                      <p className="text-xs text-red-600 font-semibold mb-2">
                        ALÉRGENOS
                      </p>
                      <p className="text-sm text-red-700 font-bold">
                        {product.allergens}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selector de cantidad - igual al prototipo */}
        <div>
          <p className="text-sm font-semibold text-black mb-2">Cantidad:</p>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 bg-gray-300 rounded-full hover:bg-gray-400 transition-all flex items-center justify-center text-black font-bold text-xl"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="text-2xl font-bold text-black w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 bg-[#E37836] rounded-full hover:bg-[#B55424] transition-all flex items-center justify-center text-white font-bold text-xl"
            >
              +
            </button>
          </div>
        </div>

        {/* Ya en carrito */}
        {alreadyInCart > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 text-center">
            <p className="text-blue-900 text-sm font-semibold">
              Ya tienes {alreadyInCart} unidad(es) en el carrito
            </p>
          </div>
        )}

        {/* Botón agregar - igual al prototipo */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-[#E37836] to-[#B55424] text-white font-bold py-4 rounded-xl hover:from-[#B55424] hover:to-[#8B5A3C] transition-all shadow-lg hover:shadow-xl"
        >
          Agregar al carrito
        </button>
      </div>

      {/* Barra de presupuesto */}
      <BudgetBar />

      {/* Modal de éxito */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        showCloseButton={false}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">
            Producto agregado
          </h3>
          <p className="text-green-700 mb-1">
            <strong>{product.name}</strong>
          </p>
          <p className="text-green-600 text-sm mb-6">
            S/. {(currentPrice * quantity).toFixed(2)}
          </p>

          <ModalActions className="flex-col">
            <button
              onClick={handleContinueShopping}
              className="w-full bg-yellow-400 text-yellow-900 font-bold py-3 rounded-xl hover:bg-yellow-500 transition-all"
            >
              Escanear otro producto
            </button>
            <button
              onClick={handleGoToCart}
              className="w-full bg-gradient-to-r from-[#8B5A3C] to-[#6B4423] text-white font-bold py-3 rounded-xl hover:from-[#6B4423] hover:to-[#4A2F18] transition-all"
            >
              Ver mi carrito
            </button>
          </ModalActions>
        </div>
      </Modal>

      {/* Modal de advertencia de presupuesto */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        showCloseButton={false}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-yellow-900 mb-2">AVISO</h3>
          <p className="text-yellow-800 mb-4">
            Agregar este producto excederá tu presupuesto
          </p>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-900">
              <strong>Presupuesto:</strong> S/. {cartState.budget?.toFixed(2)}
            </p>
            <p className="text-sm text-yellow-900">
              <strong>Ya gastaste:</strong> S/.{" "}
              {cartState.totalSpent.toFixed(2)}
            </p>
            <p className="text-sm text-yellow-900">
              <strong>Este producto:</strong> S/.{" "}
              {(currentPrice * quantity).toFixed(2)}
            </p>
            <p className="text-sm font-bold text-yellow-900 mt-2">
              <strong>Exceso:</strong> S/.{" "}
              {(
                cartState.totalSpent +
                currentPrice * quantity -
                (cartState.budget || 0)
              ).toFixed(2)}
            </p>
          </div>

          <ModalActions className="flex-col">
            <button
              onClick={handleAddDespiteWarning}
              className="w-full bg-yellow-400 text-yellow-900 font-bold py-3 rounded-xl hover:bg-yellow-500 transition-all"
            >
              Agregar de todas formas
            </button>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full bg-gradient-to-r from-[#8B5A3C] to-[#6B4423] text-white font-bold py-3 rounded-xl hover:from-[#6B4423] hover:to-[#4A2F18] transition-all"
            >
              Cancelar
            </button>
          </ModalActions>
        </div>
      </Modal>

      {/* QR Scanner */}
      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleQRScanSuccess}
      />
    </div>
  );
}
