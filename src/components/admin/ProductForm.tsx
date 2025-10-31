// src/components/admin/ProductForm.tsx
"use client";

import { useState } from "react";
import {
  Save,
  Package,
  Utensils,
  AlertTriangle,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { ProductFormData } from "@/types/product";
import BasicInfoSection from "./product-form/BasicInfoSection";
import NutritionalInfoSection from "./product-form/NutritionalInfoSection";
import ImageUploadSection from "./product-form/ImageUploadSection";
import AdditionalInfoSection from "./product-form/AdditionalInfoSection";

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Partial<ProductFormData>;
}

export default function ProductForm({
  onSubmit,
  isSubmitting,
  initialData,
}: ProductFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<ProductFormData>({
    // Información básica
    name: "",
    description: "",
    code: "",
    barcode: "",
    price: "",
    categoryId: "",

    // Fechas
    manufacturedAt: "",
    expiresAt: "",

    // Imagen
    imageFile: null,
    imageUrl: "",

    // Información nutricional por 100g
    servingSize: "",
    calories: "",
    totalFat: "",
    saturatedFat: "",
    transFat: "",
    cholesterol: "",
    sodium: "",
    totalCarbs: "",
    dietaryFiber: "",
    sugars: "",
    addedSugars: "",
    protein: "",

    // Vitaminas y minerales
    vitaminA: "",
    vitaminC: "",
    calcium: "",
    iron: "",
    potassium: "",
    magnesium: "",

    // Información adicional
    ingredients: "",
    allergens: "",
    isPerishable: false,
    isFeatured: false,
    hasPromotion: false,
    promotionText: "",
    promotionPrice: "",
    promotionStartDate: "",
    promotionEndDate: "",
    promotionDescription: "",

    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const tabs = [
    {
      id: "basic",
      label: "Información Básica",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      id: "image",
      label: "Imagen",
      icon: ImageIcon,
      color: "bg-purple-500",
    },
    {
      id: "nutrition",
      label: "Información Nutricional",
      icon: Utensils,
      color: "bg-green-500",
    },
    {
      id: "additional",
      label: "Información Adicional",
      icon: FileText,
      color: "bg-orange-500",
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones básicas
    if (!formData.name.trim()) {
      newErrors.name = "El nombre del producto es obligatorio";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "El precio debe ser mayor a 0";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Debe seleccionar una categoría";
    }
    // El código NO es obligatorio, se genera automáticamente si está vacío

    // Validaciones nutricionales (si se proporciona algún valor)
    const nutritionalFields = [
      "calories",
      "totalFat",
      "saturatedFat",
      "transFat",
      "cholesterol",
      "sodium",
      "totalCarbs",
      "dietaryFiber",
      "sugars",
      "addedSugars",
      "protein",
      "vitaminA",
      "vitaminC",
      "calcium",
      "iron",
      "potassium",
      "magnesium",
    ];

    nutritionalFields.forEach((field) => {
      const value = formData[field as keyof ProductFormData] as string;
      if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) {
        newErrors[field] = "Debe ser un número positivo";
      }
    });

    // Validar fechas de promoción
    if (formData.hasPromotion) {
      if (
        !formData.promotionPrice ||
        parseFloat(formData.promotionPrice) <= 0
      ) {
        newErrors.promotionPrice = "El precio promocional es obligatorio";
      }
      if (
        formData.promotionPrice &&
        formData.price &&
        parseFloat(formData.promotionPrice) >= parseFloat(formData.price)
      ) {
        newErrors.promotionPrice =
          "El precio promocional debe ser menor al precio normal";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Encontrar la primera pestaña con errores y cambiar a ella
      const errorFields = Object.keys(errors);
      if (
        errorFields.some((field) =>
          ["name", "price", "categoryId", "code"].includes(field)
        )
      ) {
        setActiveTab("basic");
      } else if (errorFields.some((field) => field.startsWith("promotion"))) {
        setActiveTab("additional");
      } else if (
        errorFields.some((field) => ["calories", "totalFat"].includes(field))
      ) {
        setActiveTab("nutrition");
      }
      return;
    }

    await onSubmit(formData);
  };

  const updateFormData = (
    field: keyof ProductFormData,
    value: string | boolean | File | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo cuando se actualiza
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Calcular octágonos de advertencia automáticamente
  const calculateWarnings = () => {
    const warnings = [];
    const sodium = parseFloat(formData.sodium) || 0;
    const sugars = parseFloat(formData.sugars) || 0;
    const saturatedFat = parseFloat(formData.saturatedFat) || 0;
    const transFat = parseFloat(formData.transFat) || 0;

    // Según estándares peruanos (por 100g)
    if (sodium >= 600) warnings.push("ALTO EN SODIO");
    if (sugars >= 22.5) warnings.push("ALTO EN AZÚCARES");
    if (saturatedFat >= 6) warnings.push("ALTO EN GRASAS SATURADAS");
    if (transFat >= 0.1) warnings.push("ALTO EN GRASAS TRANS");

    return warnings;
  };

  const warnings = calculateWarnings();

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-amber-200">
      {/* Navegación por pestañas */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? `${tab.color} text-white shadow-lg`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <IconComponent className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido del formulario */}
      <form onSubmit={handleSubmit} className="p-6">
        {activeTab === "basic" && (
          <BasicInfoSection
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        )}

        {activeTab === "image" && (
          <ImageUploadSection
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        )}

        {activeTab === "nutrition" && (
          <NutritionalInfoSection
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            warnings={warnings}
          />
        )}

        {activeTab === "additional" && (
          <AdditionalInfoSection
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        )}

        {/* Botones de acción */}
        <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {warnings.length > 0 && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {warnings.length} octágono(s) de advertencia
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#B55424] to-[#E37836] text-white font-semibold rounded-xl hover:from-[#8B5A3C] hover:to-[#B55424] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Guardar Producto
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
