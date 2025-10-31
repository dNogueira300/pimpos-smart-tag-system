// src/components/admin/product-form/ImageUploadSection.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Camera,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { ProductFormData } from "@/types/product";
import { useToast } from "@/components/ToastContainer";

interface ImageUploadSectionProps {
  formData: ProductFormData;
  errors: Record<string, string>;
  updateFormData: (
    field: keyof ProductFormData,
    value: string | File | null
  ) => void;
}

export default function ImageUploadSection({
  formData,
  updateFormData,
}: ImageUploadSectionProps) {
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    formData.imageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError } = useToast();

  const handleFileSelect = (file: File) => {
    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      showError("Archivo inválido", "Por favor selecciona un archivo de imagen válido");
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("Archivo muy grande", "La imagen no puede ser mayor a 5MB");
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Actualizar el form data
    updateFormData("imageFile", file);
    updateFormData("imageUrl", ""); // Limpiar URL si existía
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    updateFormData("imageFile", null);
    updateFormData("imageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlInput = (url: string) => {
    updateFormData("imageUrl", url);
    updateFormData("imageFile", null); // Limpiar archivo si existía
    setImagePreview(url);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
          <ImageIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Imagen del Producto
          </h3>
          <p className="text-gray-600">
            Sube una imagen que ayude a los clientes a identificar el producto
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Área de carga */}
        <div className="space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragOver
                ? "border-purple-400 bg-purple-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-purple-600" />
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Arrastra y suelta tu imagen aquí
                </h4>
                <p className="text-gray-600 mb-4">
                  O haz clic para seleccionar desde tu equipo
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-all"
                >
                  <Camera className="h-5 w-5" />
                  Seleccionar Imagen
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Información de la imagen */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  Recomendaciones para la imagen:
                </p>
                <ul className="space-y-1">
                  <li>• Tamaño máximo: 5MB</li>
                  <li>• Formatos: JPG, PNG, WEBP</li>
                  <li>• Resolución recomendada: 800x600px o superior</li>
                  <li>• Fondo claro y producto centrado</li>
                  <li>• Buena iluminación y nitidez</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Opción de URL */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h5 className="font-medium text-gray-900 mb-3">
              O ingresa una URL de imagen
            </h5>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleUrlInput(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">
              Asegúrate de que la URL sea accesible públicamente
            </p>
          </div>
        </div>

        {/* Vista previa */}
        <div className="space-y-4">
          <h5 className="font-medium text-gray-900">Vista Previa</h5>

          {imagePreview ? (
            <div className="relative">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                <Image
                  src={imagePreview}
                  alt="Vista previa del producto"
                  width={400}
                  height={256}
                  className="w-full h-64 object-cover rounded-xl"
                  onError={() => {
                    setImagePreview(null);
                    updateFormData("imageUrl", "");
                  }}
                />
              </div>

              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No hay imagen seleccionada</p>
            </div>
          )}

          {/* Información del archivo */}
          {formData.imageFile && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h6 className="font-medium text-gray-900">
                Información del archivo
              </h6>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Nombre:</span>{" "}
                  {formData.imageFile.name}
                </p>
                <p>
                  <span className="font-medium">Tamaño:</span>{" "}
                  {(formData.imageFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p>
                  <span className="font-medium">Tipo:</span>{" "}
                  {formData.imageFile.type}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
