// src/app/client/product/[id]/page.tsx
"use client";

import { use, useState, useEffect } from "react";
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
  Info,
} from "lucide-react";
import { Product } from "@/types/product";
import { useShopping } from "@/contexts/ShoppingContext";
import BudgetBar from "@/components/client/BudgetBar";
import Modal, { ModalActions } from "@/components/client/Modal";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart, cartState, getItemQuantity, budgetConfigured } = useShopping();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Redirigir a configuración de presupuesto si es la primera vez
  useEffect(() => {
    if (!budgetConfigured) {
      router.replace(`/client/budget/${id}`);
    }
  }, [budgetConfigured, id, router]);

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

  const getDaysUntilExpiry = () => {
    if (!product?.expiresAt) return null;
    const today = new Date();
    const expiryDate = new Date(product.expiresAt);
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
        text: `Vence en ${days} día${days > 1 ? "s" : ""}`,
        color: "bg-orange-500",
        textColor: "text-white",
      };
    if (days <= 7)
      return {
        text: `Vence en ${days} días`,
        color: "bg-yellow-500",
        textColor: "text-gray-900",
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#E37836]/20 border-t-[#E37836] rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
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
      <div className="min-h-screen bg-gray-50 pb-32">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E37836] to-[#B55424] p-4 shadow-lg sticky top-0 z-30">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <Link
              href="/client/scan"
              className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">Información del Producto</h1>
            </div>
            {cartState.itemCount > 0 && (
              <Link
                href="/client/cart"
                className="relative p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all"
              >
                <ShoppingCart className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartState.itemCount}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Barra de presupuesto */}
        {cartState.budget !== null && <BudgetBar />}

        {/* Contenido principal */}
        <div className="max-w-3xl mx-auto p-4 space-y-4">
          {/* Card principal del producto */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Imagen del producto */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart className="h-10 w-10 text-gray-500" />
                    </div>
                    <p className="text-gray-500 font-medium">Sin imagen disponible</p>
                  </div>
                </div>
              )}
            </div>

            {/* Información del producto */}
            <div className="p-6 space-y-4">
              {/* Nombre y categoría */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {product.name}
                </h2>
                {product.category && (
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: product.category.color }}
                    >
                      {product.category.name}
                    </span>
                    {product.isFeatured && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                        ⭐ Destacado
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Precio */}
              <div className="flex items-baseline gap-3">
                {product.hasPromotion && product.promotionPrice ? (
                  <>
                    <span className="text-4xl font-bold text-[#E37836]">
                      S/ {Number(product.promotionPrice).toFixed(2)}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      S/ {Number(product.price).toFixed(2)}
                    </span>
                    {product.promotionText && (
                      <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full ml-auto">
                        {product.promotionText}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-4xl font-bold text-[#E37836]">
                    S/ {Number(product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Fecha de vencimiento */}
              {expiryStatus && (
                <div
                  className={`${expiryStatus.color} ${expiryStatus.textColor} px-4 py-3 rounded-xl flex items-center gap-3 font-semibold`}
                >
                  <Calendar className="h-5 w-5 flex-shrink-0" />
                  <span>{expiryStatus.text}</span>
                </div>
              )}

              {/* Octágonos de advertencia */}
              {warnings.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-gray-700" />
                    <h3 className="font-bold text-gray-900">Advertencias Nutricionales</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {warnings.map((warning, index) => (
                      <div
                        key={index}
                        className="bg-black text-white text-center text-xs font-bold px-3 py-3 rounded-lg"
                      >
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Descripción */}
              {product.description && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Acordeones de información adicional */}
          <div className="space-y-3">
            {/* Información Nutricional */}
            {product.calories !== null && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => setShowNutrition(!showNutrition)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">
                    Información Nutricional
                  </span>
                  {showNutrition ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </button>

                {showNutrition && (
                  <div className="px-4 pb-4 space-y-2 border-t border-gray-100">
                    {product.servingSize && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                        <p className="text-sm font-semibold text-amber-900">
                          Tamaño de porción: {product.servingSize}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 mt-3">
                      {product.calories !== null && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-700">Calorías</span>
                          <span className="font-semibold text-gray-900">
                            {product.calories} kcal
                          </span>
                        </div>
                      )}
                      {product.totalFat !== null && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-700">Grasas totales</span>
                          <span className="text-gray-900">{product.totalFat} g</span>
                        </div>
                      )}
                      {product.saturatedFat !== null && (
                        <div className="flex justify-between py-2 border-b border-gray-100 pl-4">
                          <span className="text-gray-600 text-sm">Grasas saturadas</span>
                          <span className="text-gray-800 text-sm">{product.saturatedFat} g</span>
                        </div>
                      )}
                      {product.transFat !== null && (
                        <div className="flex justify-between py-2 border-b border-gray-100 pl-4">
                          <span className="text-gray-600 text-sm">Grasas trans</span>
                          <span className="text-gray-800 text-sm">{product.transFat} g</span>
                        </div>
                      )}
                      {product.sodium !== null && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-700">Sodio</span>
                          <span className="text-gray-900">{product.sodium} mg</span>
                        </div>
                      )}
                      {product.totalCarbs !== null && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-700">Carbohidratos totales</span>
                          <span className="text-gray-900">{product.totalCarbs} g</span>
                        </div>
                      )}
                      {product.sugars !== null && (
                        <div className="flex justify-between py-2 border-b border-gray-100 pl-4">
                          <span className="text-gray-600 text-sm">Azúcares</span>
                          <span className="text-gray-800 text-sm">{product.sugars} g</span>
                        </div>
                      )}
                      {product.protein !== null && (
                        <div className="flex justify-between py-2">
                          <span className="font-medium text-gray-700">Proteínas</span>
                          <span className="font-semibold text-gray-900">{product.protein} g</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ingredientes y Alérgenos */}
            {(product.ingredients || product.allergens) && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => setShowIngredients(!showIngredients)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">
                    Ingredientes y Alérgenos
                  </span>
                  {showIngredients ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </button>

                {showIngredients && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                    {product.ingredients && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Ingredientes:</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {product.ingredients}
                        </p>
                      </div>
                    )}
                    {product.allergens && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Alérgenos:
                        </h4>
                        <p className="text-sm text-red-800 leading-relaxed">
                          {product.allergens}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón flotante de agregar al carrito */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          {/* Control de cantidad */}
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="h-5 w-5 text-gray-700" />
            </button>
            <span className="w-12 text-center font-bold text-gray-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* Botón agregar */}
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-gradient-to-r from-[#E37836] to-[#B55424] text-white font-bold py-4 rounded-xl hover:from-[#B55424] hover:to-[#8B5A3C] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>
              Agregar S/ {(currentPrice * quantity).toFixed(2)}
            </span>
          </button>
        </div>

        {/* Mensaje si ya está en el carrito */}
        {alreadyInCart > 0 && (
          <div className="max-w-3xl mx-auto mt-2">
            <p className="text-center text-sm text-gray-600">
              Ya tienes <span className="font-bold">{alreadyInCart}</span> en tu
              carrito
            </p>
          </div>
        )}
      </div>

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
            ¡Producto agregado!
          </h3>
          <p className="text-green-700 font-semibold mb-1">{product.name}</p>
          <p className="text-green-600 text-sm mb-6">
            S/ {(currentPrice * quantity).toFixed(2)}
          </p>

          <ModalActions className="flex-col gap-3">
            <button
              onClick={handleContinueShopping}
              className="w-full bg-gradient-to-r from-[#E37836] to-[#B55424] text-white font-bold py-4 rounded-xl hover:from-[#B55424] hover:to-[#8B5A3C] transition-all"
            >
              Escanear otro producto
            </button>
            <button
              onClick={handleGoToCart}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-all"
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
          <h3 className="text-2xl font-bold text-yellow-900 mb-2">
            ⚠️ Excederás tu presupuesto
          </h3>
          <p className="text-yellow-800 mb-4">
            Agregar este producto superará el límite que estableciste
          </p>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-yellow-900">Presupuesto:</span>
              <span className="font-bold text-yellow-900">
                S/ {cartState.budget?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-yellow-900">Ya gastaste:</span>
              <span className="font-bold text-yellow-900">
                S/ {cartState.totalSpent.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-yellow-900">Este producto:</span>
              <span className="font-bold text-yellow-900">
                S/ {(currentPrice * quantity).toFixed(2)}
              </span>
            </div>
            <div className="border-t-2 border-yellow-300 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-bold text-yellow-900">Exceso:</span>
                <span className="font-bold text-red-600">
                  S/
                  {(
                    cartState.totalSpent +
                    currentPrice * quantity -
                    (cartState.budget || 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <ModalActions className="flex-col gap-3">
            <button
              onClick={handleAddDespiteWarning}
              className="w-full bg-yellow-500 text-yellow-900 font-bold py-4 rounded-xl hover:bg-yellow-600 transition-all"
            >
              Agregar de todas formas
            </button>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
          </ModalActions>
        </div>
      </Modal>
    </>
  );
}
