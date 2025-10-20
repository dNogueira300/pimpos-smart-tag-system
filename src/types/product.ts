// src/types/product.ts
export interface ProductFormData {
  // Información básica
  name: string;
  description: string;
  code: string;
  barcode: string;
  price: string;
  categoryId: string;

  // Fechas
  manufacturedAt: string;
  expiresAt: string;

  // Imagen
  imageFile: File | null;
  imageUrl: string;

  // Información nutricional por 100g
  servingSize: string;
  calories: string;
  totalFat: string;
  saturatedFat: string;
  transFat: string;
  cholesterol: string;
  sodium: string;
  totalCarbs: string;
  dietaryFiber: string;
  sugars: string;
  addedSugars: string;
  protein: string;

  // Vitaminas y minerales
  vitaminA: string;
  vitaminC: string;
  calcium: string;
  iron: string;
  potassium: string;
  magnesium: string;

  // Información adicional
  ingredients: string;
  allergens: string;
  isPerishable: boolean;
  isFeatured: boolean;
  hasPromotion: boolean;
  promotionText: string;
  promotionPrice: string;
  promotionStartDate: string;
  promotionEndDate: string;
  promotionDescription: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  code: string;
  barcode?: string;
  price: number | string; // Puede venir como string desde la API
  categoryId: string;
  createdById: string;

  // Fechas
  createdAt: Date;
  updatedAt: Date;
  manufacturedAt?: Date;
  expiresAt?: Date;

  // Imagen
  imageUrl?: string;
  qrCodePath?: string;

  // Información nutricional
  servingSize?: string;
  calories?: number;
  totalFat?: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  totalCarbs?: number;
  dietaryFiber?: number;
  sugars?: number;
  addedSugars?: number;
  protein?: number;

  // Vitaminas y minerales
  vitaminA?: number;
  vitaminC?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
  magnesium?: number;

  // Octágonos de advertencia
  highSodium: boolean;
  highSugar: boolean;
  highSatFat: boolean;
  highTransFat: boolean;

  // Estados
  isActive: boolean;
  isPerishable: boolean;
  isFeatured: boolean;
  hasPromotion: boolean;

  // Información de promoción
  promotionText?: string;
  promotionPrice?: number | string; // Puede venir como string desde la API
  promotionStartDate?: Date;
  promotionEndDate?: Date;
  promotionDescription?: string;

  // Información adicional
  ingredients?: string;
  allergens?: string;

  // Metadatos
  lastQrGenerated?: Date;
  viewCount: number;
  scanCount: number;

  // Relaciones
  category?: Category;
}

export interface NutritionalWarning {
  type: "sodium" | "sugar" | "saturatedFat" | "transFat";
  label: string;
  value: number;
  threshold: number;
  exceeded: boolean;
}
