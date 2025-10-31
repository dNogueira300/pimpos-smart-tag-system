// src/components/admin/product-form/NutritionalInfoSection.tsx
"use client";

import { Utensils, AlertTriangle, Info, Calculator } from "lucide-react";
import { ProductFormData } from "@/types/product";

interface NutritionalInfoSectionProps {
  formData: ProductFormData;
  errors: Record<string, string>;
  updateFormData: (field: keyof ProductFormData, value: string) => void;
  warnings: string[];
}

export default function NutritionalInfoSection({
  formData,
  errors,
  updateFormData,
  warnings,
}: NutritionalInfoSectionProps) {
  const nutritionalFields = [
    {
      category: "Información General",
      fields: [
        {
          key: "servingSize" as keyof ProductFormData,
          label: "Tamaño de Porción",
          placeholder: "Ej: 1 rebanada, 100g, 1 unidad",
          unit: "",
          type: "text",
        },
        {
          key: "calories" as keyof ProductFormData,
          label: "Calorías",
          placeholder: "0",
          unit: "kcal",
          type: "number",
        },
      ],
    },
    {
      category: "Macronutrientes",
      fields: [
        {
          key: "totalFat" as keyof ProductFormData,
          label: "Grasas Totales",
          placeholder: "0",
          unit: "g",
          type: "number",
        },
        {
          key: "saturatedFat" as keyof ProductFormData,
          label: "Grasas Saturadas",
          placeholder: "0",
          unit: "g",
          type: "number",
          warning: true,
        },
        {
          key: "transFat" as keyof ProductFormData,
          label: "Grasas Trans",
          placeholder: "0",
          unit: "g",
          type: "number",
          warning: true,
        },
        {
          key: "cholesterol" as keyof ProductFormData,
          label: "Colesterol",
          placeholder: "0",
          unit: "mg",
          type: "number",
        },
        {
          key: "totalCarbs" as keyof ProductFormData,
          label: "Carbohidratos Totales",
          placeholder: "0",
          unit: "g",
          type: "number",
        },
        {
          key: "dietaryFiber" as keyof ProductFormData,
          label: "Fibra Dietética",
          placeholder: "0",
          unit: "g",
          type: "number",
        },
        {
          key: "sugars" as keyof ProductFormData,
          label: "Azúcares",
          placeholder: "0",
          unit: "g",
          type: "number",
          warning: true,
        },
        {
          key: "addedSugars" as keyof ProductFormData,
          label: "Azúcares Añadidos",
          placeholder: "0",
          unit: "g",
          type: "number",
        },
        {
          key: "protein" as keyof ProductFormData,
          label: "Proteínas",
          placeholder: "0",
          unit: "g",
          type: "number",
        },
        {
          key: "sodium" as keyof ProductFormData,
          label: "Sodio",
          placeholder: "0",
          unit: "mg",
          type: "number",
          warning: true,
        },
      ],
    },
    {
      category: "Vitaminas y Minerales",
      fields: [
        {
          key: "vitaminA" as keyof ProductFormData,
          label: "Vitamina A",
          placeholder: "0",
          unit: "μg",
          type: "number",
        },
        {
          key: "vitaminC" as keyof ProductFormData,
          label: "Vitamina C",
          placeholder: "0",
          unit: "mg",
          type: "number",
        },
        {
          key: "calcium" as keyof ProductFormData,
          label: "Calcio",
          placeholder: "0",
          unit: "mg",
          type: "number",
        },
        {
          key: "iron" as keyof ProductFormData,
          label: "Hierro",
          placeholder: "0",
          unit: "mg",
          type: "number",
        },
        {
          key: "potassium" as keyof ProductFormData,
          label: "Potasio",
          placeholder: "0",
          unit: "mg",
          type: "number",
        },
        {
          key: "magnesium" as keyof ProductFormData,
          label: "Magnesio",
          placeholder: "0",
          unit: "mg",
          type: "number",
        },
      ],
    },
  ];

  const renderOctagonWarning = (warning: string) => {
    return (
      <div className="inline-flex items-center bg-black text-white px-3 py-1 rounded-lg text-xs font-bold">
        {warning}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
          <Utensils className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Información Nutricional
          </h3>
          <p className="text-gray-600">
            Valores nutricionales por 100g del producto
          </p>
        </div>
      </div>

      {/* Información importante */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-lg font-semibold text-amber-900 mb-2">
              Información importante sobre valores nutricionales
            </h4>
            <ul className="text-amber-800 space-y-2 text-sm">
              <li>
                •{" "}
                <strong>
                  Todos los valores deben ser por 100g del producto
                </strong>
              </li>
              <li>
                • Los campos marcados con [!] se usan para calcular octágonos de
                advertencia
              </li>
              <li>
                • Los octágonos se calculan automáticamente según normativa
                peruana:
              </li>
              <li className="ml-4">- Sodio ≥ 600mg = ALTO EN SODIO</li>
              <li className="ml-4">- Azúcares ≥ 22.5g = ALTO EN AZÚCARES</li>
              <li className="ml-4">
                - Grasas saturadas ≥ 6g = ALTO EN GRASAS SATURADAS
              </li>
              <li className="ml-4">
                - Grasas trans ≥ 0.1g = ALTO EN GRASAS TRANS
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Octágonos de advertencia */}
      {warnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h4 className="text-lg font-semibold text-red-900">
              Octágonos de Advertencia Detectados
            </h4>
          </div>
          <p className="text-red-800 text-sm mb-4">
            Este producto mostrará los siguientes octágonos según los valores
            nutricionales ingresados:
          </p>
          <div className="flex flex-wrap gap-2">
            {warnings.map((warning, index) => (
              <div key={index}>{renderOctagonWarning(warning)}</div>
            ))}
          </div>
        </div>
      )}

      {/* Campos nutricionales organizados por categorías */}
      <div className="space-y-8">
        {nutritionalFields.map((category) => (
          <div
            key={category.category}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-600" />
              {category.category}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.warning && (
                      <span
                        className="ml-1 text-red-500"
                        title="Campo usado para octágonos"
                      >
                        [!]
                      </span>
                    )}
                    {field.unit && (
                      <span className="text-gray-500 text-xs ml-1">
                        ({field.unit})
                      </span>
                    )}
                  </label>

                  <div className="relative">
                    <input
                      type={field.type}
                      step={field.type === "number" ? "0.01" : undefined}
                      min={field.type === "number" ? "0" : undefined}
                      value={formData[field.key] as string}
                      onChange={(e) =>
                        updateFormData(field.key, e.target.value)
                      }
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                        field.unit && field.type === "number" ? "pr-12" : ""
                      } ${
                        errors[field.key] ? "border-red-300" : "border-gray-300"
                      }`}
                    />

                    {field.unit && field.type === "number" && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        {field.unit}
                      </span>
                    )}
                  </div>

                  {errors[field.key] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[field.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Ingredientes y alérgenos */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">
          Ingredientes y Alérgenos
        </h4>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lista de Ingredientes
            </label>
            <textarea
              value={formData.ingredients}
              onChange={(e) => updateFormData("ingredients", e.target.value)}
              placeholder="Ej: Harina de trigo, agua, azúcar, manteca vegetal, levadura, sal..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Lista en orden descendente de cantidad (el primer ingrediente es
              el más abundante)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alérgenos
            </label>
            <input
              type="text"
              value={formData.allergens}
              onChange={(e) => updateFormData("allergens", e.target.value)}
              placeholder="Ej: Contiene gluten, puede contener trazas de huevo y leche"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">
              Información sobre alérgenos presentes o posibles trazas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
