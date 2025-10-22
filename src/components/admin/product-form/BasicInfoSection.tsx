"use client";

import { useState, useEffect } from "react";
import { Calendar, DollarSign, Package, Tag } from "lucide-react";
import { ProductFormData, Category } from "@/types/product";

interface BasicInfoSectionProps {
  formData: ProductFormData;
  errors: Record<string, string>;
  updateFormData: (
    field: keyof ProductFormData,
    value: string | boolean
  ) => void;
}

export default function BasicInfoSection({
  formData,
  errors,
  updateFormData,
}: BasicInfoSectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        } else {
          console.error("Error al cargar categorías");
          setCategories([
            {
              id: "panaderia",
              name: "Panadería",
              color: "#E37836",
              isActive: true,
            },
            {
              id: "abarrotes",
              name: "Abarrotes",
              color: "#8B5A3C",
              isActive: true,
            },
            {
              id: "lacteos",
              name: "Lácteos",
              color: "#4F46E5",
              isActive: true,
            },
            {
              id: "bebidas",
              name: "Bebidas",
              color: "#059669",
              isActive: true,
            },
            {
              id: "dulces",
              name: "Dulces y Postres",
              color: "#DC2626",
              isActive: true,
            },
            {
              id: "especiales",
              name: "Productos Especiales",
              color: "#7C3AED",
              isActive: true,
            },
          ]);
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        setCategories([
          {
            id: "panaderia",
            name: "Panadería",
            color: "#E37836",
            isActive: true,
          },
          {
            id: "abarrotes",
            name: "Abarrotes",
            color: "#8B5A3C",
            isActive: true,
          },
          { id: "lacteos", name: "Lácteos", color: "#4F46E5", isActive: true },
          { id: "bebidas", name: "Bebidas", color: "#059669", isActive: true },
          {
            id: "dulces",
            name: "Dulces y Postres",
            color: "#DC2626",
            isActive: true,
          },
          {
            id: "especiales",
            name: "Productos Especiales",
            color: "#7C3AED",
            isActive: true,
          },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
          <Package className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Información Básica del Producto
          </h3>
          <p className="text-gray-600">
            Datos esenciales para identificar el producto
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Producto *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData("name", e.target.value)}
            placeholder="Ej: Pan francés chico, Bizcocho grande, etc."
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
              errors.name ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData("description", e.target.value)}
            placeholder="Descripción breve del producto..."
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código del Producto *
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                updateFormData("code", e.target.value.toUpperCase())
              }
              placeholder="Ej: PAN-FRANC-CH"
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                errors.code ? "border-red-300" : "border-gray-300"
              }`}
            />
          </div>
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Código único para identificar el producto internamente
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código de Barras
          </label>
          <input
            type="text"
            value={formData.barcode}
            onChange={(e) => updateFormData("barcode", e.target.value)}
            placeholder="Ej: 7501234567890"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
          />
          <p className="mt-1 text-xs text-gray-500">
            Opcional: si el producto tiene código de barras
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => updateFormData("price", e.target.value)}
              placeholder="0.00"
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                errors.price ? "border-red-300" : "border-gray-300"
              }`}
            />
          </div>
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Precio en soles (S/.)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => updateFormData("categoryId", e.target.value)}
            disabled={loadingCategories}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
              errors.categoryId ? "border-red-300" : "border-gray-300"
            } ${loadingCategories ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <option value="">
              {loadingCategories
                ? "Cargando categorías..."
                : "Seleccionar categoría"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Elaboración
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="datetime-local"
              value={formData.manufacturedAt}
              onChange={(e) => updateFormData("manufacturedAt", e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Fecha y hora de elaboración del producto
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Vencimiento
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => updateFormData("expiresAt", e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Fecha y hora de vencimiento del producto
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Estado del Producto
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPerishable}
              onChange={(e) => updateFormData("isPerishable", e.target.checked)}
              className="w-5 h-5 text-amber-600 border-2 border-gray-300 rounded focus:ring-amber-500"
            />
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Es perecedero</span>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => updateFormData("isFeatured", e.target.checked)}
              className="w-5 h-5 text-amber-600 border-2 border-gray-300 rounded focus:ring-amber-500"
            />
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700 font-medium">
                Producto destacado
              </span>
            </div>
          </label>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>
            • <strong>Perecedero:</strong> Productos con fecha de vencimiento
            que requieren control especial
          </p>
          <p>
            • <strong>Destacado:</strong> Productos que aparecerán resaltados en
            el catálogo
          </p>
        </div>
      </div>
    </div>
  );
}
