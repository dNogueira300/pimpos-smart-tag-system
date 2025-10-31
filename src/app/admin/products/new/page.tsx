// src/app/admin/products/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Info, CheckCircle } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { ProductFormData } from "@/types/product";
import { useToast } from "@/components/ToastContainer";

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { showError } = useToast();

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Agregar todos los campos del producto
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (key === "imageFile" && value instanceof File) {
            formData.append(key, value);
          } else if (typeof value === "boolean") {
            formData.append(key, value.toString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al crear el producto");
      }

      setShowSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/admin/products/list");
      }, 2000);
    } catch (error) {
      console.error("Error al crear producto:", error);
      showError(
        "Error al crear producto",
        error instanceof Error ? error.message : "Ocurrió un error al crear el producto"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-green-200 text-center max-w-md">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            ¡Producto Creado!
          </h2>
          <p className="text-green-700 mb-4">
            El producto ha sido creado exitosamente.
          </p>
          <div className="w-8 h-8 border-4 border-green-400/20 border-t-green-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-green-600 text-sm mt-2">
            Redirigiendo a la lista...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#B55424] to-[#E37836] rounded-3xl p-6 shadow-2xl border-4 border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white font-medium rounded-xl hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Nuevo Producto</h1>
              <p className="text-white/90">
                Agrega un nuevo producto al catálogo de Pimpos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Información importante
            </h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Los campos marcados con (*) son obligatorios</li>
              <li>
                • La imagen del producto ayuda a los clientes a identificarlo
              </li>
              <li>
                • La información nutricional debe ser por 100g del producto
              </li>
              <li>
                • Los octágonos de advertencia se calculan automáticamente
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
