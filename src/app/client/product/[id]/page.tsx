// src/app/client/product/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import { Product } from "@/types/product";
import { useShopping } from "@/contexts/ShoppingContext";
import BudgetBar from "@/components/client/BudgetBar";
import Modal, { ModalActions } from "@/components/client/Modal";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { addToCart, cartState, getItemQuantity } = useShopping();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Cargar producto
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/client/products/${params.id}`);
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

    fetchProduct();
  }, [params.id]);

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
    router.push("/client/scan");
  };

  const handleGoToCart = () => {
    setShowSuccessModal(false);
    router.push("/client/cart");
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
        textColor: "text-red-900",
      };
    if (days === 0)
      return {
        text: "Vence hoy",
        color: "bg-red-500",
        textColor: "text-red-900",
      };
    if (days <= 3)
      return {
        text: `Vence en ${days} días`,
        color: "bg-red-400",
        textColor: "text-red-900",
      };
    if (days <= 7)
      return {
        text: `Vence en ${days} días`,
        color: "bg-yellow-400",
        textColor: "text-yellow-900",
      };
    return {
      text: `Vence: ${new Date(product!.expiresAt!).toLocaleDateString()}`,
      color: "bg-green-400",
      textColor: "text-green-900",
    };
  };

  const currentPrice =
    product?.hasPromotion && product?.promotionPrice
      ? Number(product.promotionPrice)
      : Number(product?.price || 0);

  const alreadyInCart = product ? getItemQuantity(product.id) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#E37836]/20 border-t-[#E37836] rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
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
    product.highSodium && "ALTO EN SODIO",
    product.highSugar && "ALTO EN AZÚCARES",
    product.highSatFat && "ALTO EN GRASAS SATURADAS",
    product.highTransFat && "ALTO EN GRASAS TRANS",
  ].filter(Boolean);

  return (
    <>
      <div className="min-h-screen pb-32">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E37836] to-[#B55424] p-6 shadow-lg sticky top-0 z-30">
          <div className="max-w-md mx-auto flex items-center gap-4">
            <Link
              href="/client/scan"
              className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="h-6 w-6 text-white" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">SmartTag Pimpos</h1>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-md mx-auto p-6">
          <div className="space-y-6">
            {/* Imagen del producto */}
            <div className="relative aspect-square bg-white rounded-3xl shadow-lg overflow-hidden border-4 border-gray-100">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Sin imagen</p>
                  </div>
                </div>
              )}
            </div>

            {/* Información básica */}
            <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {product.name}
              </h2>

              {/* Precio */}
              <div className="flex items-center gap-3 mb-4">
                {product.hasPromotion && product.promotionPrice ? (
                  <>
                    <span className="text-3xl font-bold text-[#E37836]">
                      S/. {Number(product.promotionPrice).toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      S/. {Number(product.price).toFixed(2)}
                    </span>
                    {product.promotionText && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {product.promotionText}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-3xl font-bold text-[#E37836]">
                    S/. {Number(product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Estado de vencimiento */}
              {expiryStatus && (
                <div
                  className={`${expiryStatus.color} ${expiryStatus.textColor} px-4 py-2 rounded-xl mb-4 flex items-center gap-2`}
                >
                  <Calendar className="h-4 w-4" />
                  <span className="font-semibold text-sm">
                    {expiryStatus.text}
                  </span>
                </div>
              )}

              {/* Octágonos de advertencia */}
              {warnings.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {warnings.map((warning, index) => (
                      <div
                        key={index}
                        className="bg-black text-white text-xs font-bold px-3 py-2 rounded-lg border-2 border-black"
                        style={{
                          clipPath:
                            "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        }}
                      >
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Descripción */}
              {product.description && (
                <p className="text-gray-700 text-sm leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Secciones expandibles */}
            <div className="space-y-4">
              {/* Acordeón: Información nutricional */}
              {(product.calories !== null ||
                product.totalFat !== null ||
                product.totalCarbs !== null ||
                product.protein !== null ||
                product.sodium !== null) && (
                <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setShowNutrition(!showNutrition)}
                    className="w-full bg-gradient-to-r from-[#E37836] to-[#B55424] text-white font-semibold py-4 px-4 flex items-center justify-between hover:from-[#B55424] hover:to-[#8B5A3C] transition-all"
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
                            <span className="text-sm">
                              {product.calories} kcal
                            </span>
                          </div>
                        )}
                        {product.totalFat !== null && (
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-sm font-medium">
                              Grasas totales
                            </span>
                            <span className="text-sm">
                              {product.totalFat} g
                            </span>
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
                            <span className="text-sm">
                              {product.totalCarbs} g
                            </span>
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
                            <span className="text-sm font-medium">
                              Proteínas
                            </span>
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
                <div className="border-2 border-gray-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setShowIngredients(!showIngredients)}
                    className="w-full bg-gradient-to-r from-[#E37836] to-[#B55424] text-white font-semibold py-4 px-4 flex items-center justify-between hover:from-[#B55424] hover:to-[#8B5A3C] transition-all"
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

              {/* Selector de cantidad */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Cantidad
                </p>
                <div className="flex items-center justify-center gap-4 bg-gray-100 rounded-2xl p-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 bg-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-5 w-5 text-gray-600" />
                  </button>
                  <span className="text-3xl font-bold text-gray-900 w-16 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 bg-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                  >
                    <Plus className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  Subtotal: S/. {(currentPrice * quantity).toFixed(2)}
                </p>
              </div>

              {/* Ya en carrito */}
              {alreadyInCart > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 text-center">
                  <p className="text-blue-900 text-sm font-semibold">
                    Ya tienes {alreadyInCart} unidad(es) en el carrito
                  </p>
                </div>
              )}

              {/* Botón agregar */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-[#E37836] to-[#B55424] text-white font-bold py-4 rounded-xl hover:from-[#B55424] hover:to-[#8B5A3C] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
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
    </>
  );
}
