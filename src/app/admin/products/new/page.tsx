// src/app/admin/products/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Info } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { ProductFormData } from "@/types/product";

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // Aquí iría la lógica para enviar los datos al API
      console.log("Datos del producto:", data);

      // Simular envío
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirigir al dashboard o mostrar mensaje de éxito
      router.push("/admin/products");
    } catch (error) {
      console.error("Error al crear producto:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
