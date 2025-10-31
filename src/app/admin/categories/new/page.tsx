"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FolderPlus, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewCategoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#FF8C42",
    icon: "package",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la categoría");
      }

      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const predefinedColors = [
    "#FF8C42",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DFE6E9",
    "#A29BFE",
    "#FD79A8",
    "#FDCB6E",
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#B55424] to-[#E37836] rounded-3xl p-8 shadow-2xl border-4 border-amber-200">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Nueva Categoría
            </h1>
            <p className="text-white/90 text-lg">
              Crear una nueva categoría para organizar productos
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-amber-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Nombre de la Categoría
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              placeholder="Ej: Panes, Pasteles, Bebidas"
            />
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all resize-none"
              placeholder="Descripción opcional de la categoría"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Color de la Categoría
            </label>
            <div className="flex flex-wrap gap-3 mb-3">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  className={`w-12 h-12 rounded-xl transition-all ${
                    formData.color === color
                      ? "ring-4 ring-amber-500 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
            />
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#B55424] to-[#E37836] text-white font-semibold rounded-xl hover:from-[#8B5A3C] hover:to-[#B55424] transition-all shadow-lg hover:shadow-xl hover:scale-105 transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creando categoría...
                </>
              ) : (
                <>
                  <FolderPlus className="h-5 w-5" />
                  Crear Categoría
                </>
              )}
            </button>
            <Link
              href="/admin"
              className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
