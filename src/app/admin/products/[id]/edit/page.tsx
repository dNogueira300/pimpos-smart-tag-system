// src/app/admin/products/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { ProductFormData, Product } from "@/types/product";

// ✅ CORREGIDO: Interface actualizada para Next.js 15
interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);

  // ✅ CORREGIDO: Resolver params asíncrono para Next.js 15
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setProductId(resolvedParams.id);
      } catch (err) {
        console.error("Error resolving params:", err);
        setError("Error al cargar la página");
        setIsLoading(false);
      }
    };

    resolveParams();
  }, [params]);

  // Cargar producto cuando tengamos el ID
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${productId}`);
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
  }, [productId]);

  // Convertir producto a datos del formulario
  const productToFormData = (product: Product): ProductFormData => {
    return {
      name: product.name,
      description: product.description || "",
      code: product.code,
      barcode: product.barcode || "",
      price: product.price.toString(),
      categoryId: product.categoryId,

      manufacturedAt: product.manufacturedAt
        ? new Date(product.manufacturedAt).toISOString().slice(0, 16)
        : "",
      expiresAt: product.expiresAt
        ? new Date(product.expiresAt).toISOString().slice(0, 16)
        : "",

      imageFile: null,
      imageUrl: product.imageUrl || "",

      servingSize: product.servingSize || "",
      calories: product.calories?.toString() || "",
      totalFat: product.totalFat?.toString() || "",
      saturatedFat: product.saturatedFat?.toString() || "",
      transFat: product.transFat?.toString() || "",
      cholesterol: product.cholesterol?.toString() || "",
      sodium: product.sodium?.toString() || "",
      totalCarbs: product.totalCarbs?.toString() || "",
      dietaryFiber: product.dietaryFiber?.toString() || "",
      sugars: product.sugars?.toString() || "",
      addedSugars: product.addedSugars?.toString() || "",
      protein: product.protein?.toString() || "",

      vitaminA: product.vitaminA?.toString() || "",
      vitaminC: product.vitaminC?.toString() || "",
      calcium: product.calcium?.toString() || "",
      iron: product.iron?.toString() || "",
      potassium: product.potassium?.toString() || "",
      magnesium: product.magnesium?.toString() || "",

      ingredients: product.ingredients || "",
      allergens: product.allergens || "",
      isPerishable: product.isPerishable,
      isFeatured: product.isFeatured,
      hasPromotion: product.hasPromotion,
      promotionText: product.promotionText || "",
      promotionPrice: product.promotionPrice?.toString() || "",
      promotionStartDate: product.promotionStartDate
        ? new Date(product.promotionStartDate).toISOString().slice(0, 16)
        : "",
      promotionEndDate: product.promotionEndDate
        ? new Date(product.promotionEndDate).toISOString().slice(0, 16)
        : "",
      promotionDescription: product.promotionDescription || "",
    };
  };

  const handleSubmit = async (data: ProductFormData) => {
    if (!productId) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // ✅ CORREGIDO: Agregar todos los campos del producto manteniendo nombres originales
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (key === "imageFile" && value instanceof File) {
            formData.append("imageFile", value); // ✅ USAR "imageFile" como originalmente
          } else if (typeof value === "boolean") {
            formData.append(key, value.toString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar el producto");
      }

      setShowSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/admin/products/list");
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al actualizar el producto"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-200">
          <div className="w-8 h-8 border-4 border-amber-400/20 border-t-amber-500 rounded-full animate-spin"></div>
          <span className="text-gray-700 font-medium">
            Cargando producto...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-red-200 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <Link
            href="/admin/products/list"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B55424] to-[#E37836] text-white font-semibold rounded-xl hover:from-[#8B5A3C] hover:to-[#B55424] transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-green-200 text-center max-w-md">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            ¡Producto Actualizado!
          </h2>
          <p className="text-green-700 mb-4">
            Los cambios han sido guardados exitosamente.
          </p>
          <div className="w-8 h-8 border-4 border-green-400/20 border-t-green-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-green-600 text-sm mt-2">
            Redirigiendo a la lista...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#B55424] to-[#E37836] rounded-3xl p-6 shadow-2xl border-4 border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/products/list"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white font-medium rounded-xl hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a la lista
            </Link>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Editar Producto</h1>
              <p className="text-white/90">
                Modifica la información de: {product.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información del producto actual */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Información del producto actual
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Código:</span>
                <span className="text-blue-700 ml-2">{product.code}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">
                  Precio actual:
                </span>
                <span className="text-blue-700 ml-2">
                  S/{" "}
                  {typeof product.price === "number"
                    ? product.price.toFixed(2)
                    : Number(product.price).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Categoría:</span>
                <span className="text-blue-700 ml-2">
                  {product.category?.name}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Creado:</span>
                <span className="text-blue-700 ml-2">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800">
                  Última actualización:
                </span>
                <span className="text-blue-700 ml-2">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800">
                  Visualizaciones:
                </span>
                <span className="text-blue-700 ml-2">{product.viewCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <ProductForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        initialData={productToFormData(product)}
      />
    </div>
  );
}
