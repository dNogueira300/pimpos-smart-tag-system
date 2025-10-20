// src/components/admin/product-form/AdditionalInfoSection.tsx
"use client";

import { FileText, Tag, Calendar, DollarSign, Percent } from "lucide-react";
import { ProductFormData } from "@/types/product";

interface AdditionalInfoSectionProps {
  formData: ProductFormData;
  errors: Record<string, string>;
  updateFormData: (
    field: keyof ProductFormData,
    value: string | boolean
  ) => void;
}

export default function AdditionalInfoSection({
  formData,
  errors,
  updateFormData,
}: AdditionalInfoSectionProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Información Adicional
          </h3>
          <p className="text-gray-600">
            Promociones y configuraciones especiales del producto
          </p>
        </div>
      </div>

      {/* Configuración de Promociones */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Percent className="h-6 w-6 text-orange-600" />
          <h4 className="text-lg font-semibold text-gray-900">Promociones</h4>
        </div>

        {/* Toggle de promoción */}
        <div className="mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasPromotion}
              onChange={(e) => updateFormData("hasPromotion", e.target.checked)}
              className="w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-orange-500"
            />
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700 font-medium">
                Este producto tiene promoción activa
              </span>
            </div>
          </label>
        </div>

        {/* Campos de promoción */}
        {formData.hasPromotion && (
          <div className="space-y-6 bg-orange-50 rounded-xl p-6 border border-orange-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Texto de promoción */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto de Promoción *
                </label>
                <input
                  type="text"
                  value={formData.promotionText}
                  onChange={(e) =>
                    updateFormData("promotionText", e.target.value)
                  }
                  placeholder="Ej: ¡Oferta especial!, 2x1, 50% de descuento"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                    errors.promotionText ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.promotionText && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.promotionText}
                  </p>
                )}
              </div>

              {/* Precio promocional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Promocional *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.promotionPrice}
                    onChange={(e) =>
                      updateFormData("promotionPrice", e.target.value)
                    }
                    placeholder="0.00"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                      errors.promotionPrice
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.promotionPrice && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.promotionPrice}
                  </p>
                )}
                {formData.price && formData.promotionPrice && (
                  <p className="mt-1 text-xs text-gray-600">
                    Descuento:{" "}
                    {(
                      ((parseFloat(formData.price) -
                        parseFloat(formData.promotionPrice)) /
                        parseFloat(formData.price)) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                )}
              </div>

              {/* Descripción de promoción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción de la Promoción
                </label>
                <textarea
                  value={formData.promotionDescription}
                  onChange={(e) =>
                    updateFormData("promotionDescription", e.target.value)
                  }
                  placeholder="Describe los detalles de la promoción..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                />
              </div>

              {/* Fecha inicio promoción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={formData.promotionStartDate}
                    onChange={(e) =>
                      updateFormData("promotionStartDate", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              {/* Fecha fin promoción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={formData.promotionEndDate}
                    onChange={(e) =>
                      updateFormData("promotionEndDate", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Configuraciones avanzadas */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">
          Configuraciones Avanzadas
        </h4>

        <div className="space-y-6">
          {/* Información sobre el estado perecedero */}
          {formData.isPerishable && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-semibold text-yellow-900 mb-1">
                    Producto Perecedero
                  </h5>
                  <p className="text-yellow-800 text-sm">
                    Este producto requiere control de fechas de vencimiento.
                    Asegúrate de configurar correctamente la fecha de
                    elaboración y vencimiento en la información básica.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información sobre producto destacado */}
          {formData.isFeatured && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Tag className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-semibold text-blue-900 mb-1">
                    Producto Destacado
                  </h5>
                  <p className="text-blue-800 text-sm">
                    Este producto aparecerá resaltado en el catálogo y tendrá
                    mayor visibilidad para los clientes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resumen del producto */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h5 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen del Producto
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium text-gray-900">
                    {formData.name || "Sin nombre"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Precio:</span>
                  <span className="font-medium text-gray-900">
                    S/ {formData.price || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Código:</span>
                  <span className="font-medium text-gray-900">
                    {formData.code || "Sin código"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Perecedero:</span>
                  <span
                    className={`font-medium ${
                      formData.isPerishable
                        ? "text-yellow-600"
                        : "text-gray-900"
                    }`}
                  >
                    {formData.isPerishable ? "Sí" : "No"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Destacado:</span>
                  <span
                    className={`font-medium ${
                      formData.isFeatured ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {formData.isFeatured ? "Sí" : "No"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Con promoción:</span>
                  <span
                    className={`font-medium ${
                      formData.hasPromotion
                        ? "text-orange-600"
                        : "text-gray-900"
                    }`}
                  >
                    {formData.hasPromotion ? "Sí" : "No"}
                  </span>
                </div>
              </div>
            </div>

            {formData.hasPromotion && formData.promotionPrice && (
              <div className="mt-4 p-4 bg-orange-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-orange-800 font-medium">
                    Precio promocional:
                  </span>
                  <span className="text-orange-900 font-bold text-lg">
                    S/ {formData.promotionPrice}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información de ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h5 className="text-lg font-semibold text-blue-900 mb-3">
          ¿Necesitas ayuda?
        </h5>
        <div className="text-blue-800 text-sm space-y-2">
          <p>
            • <strong>Promociones:</strong> Solo activa promociones si tienes un
            descuento real
          </p>
          <p>
            • <strong>Fechas:</strong> Las fechas de promoción son opcionales,
            pero recomendadas para control
          </p>
          <p>
            • <strong>Productos destacados:</strong> Úsalo solo para productos
            especiales o nuevos
          </p>
          <p>
            • <strong>Productos perecederos:</strong> Importante para el control
            de inventario y alertas
          </p>
        </div>
      </div>
    </div>
  );
}
