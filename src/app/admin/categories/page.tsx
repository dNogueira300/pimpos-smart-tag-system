// src/app/admin/categories/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FolderPlus,
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  X,
  Check,
} from "lucide-react";
import { Category } from "@/types/product";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastContainer";

interface CategoryWithCount extends Category {
  _count?: {
    products: number;
  };
}

interface CategoryModalData {
  id?: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

const PREDEFINED_COLORS = [
  "#FF8C42", // Naranja
  "#E37836", // Naranja oscuro
  "#8B5A3C", // Marrón
  "#27AE60", // Verde
  "#3498DB", // Azul
  "#9B59B6", // Púrpura
  "#E74C3C", // Rojo
  "#F39C12", // Amarillo
  "#1ABC9C", // Turquesa
  "#34495E", // Gris oscuro
];

export default function CategoriesManagementPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const { showSuccess, showError } = useToast();

  // Estado para modal de crear/editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [modalData, setModalData] = useState<CategoryModalData>({
    name: "",
    description: "",
    color: "#FF8C42",
    icon: "package",
  });
  const [modalLoading, setModalLoading] = useState(false);

  // Estado para modal de confirmación de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<CategoryWithCount | null>(null);

  // Cargar categorías
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/admin/categories${
        showInactive ? "?includeInactive=true" : ""
      }`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      showError("Error", "No se pudieron cargar las categorías");
    } finally {
      setLoading(false);
    }
  }, [showInactive, showError]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filtrar categorías por búsqueda
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir modal para crear
  const handleCreateClick = () => {
    setModalMode("create");
    setModalData({
      name: "",
      description: "",
      color: "#FF8C42",
      icon: "package",
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEditClick = (category: CategoryWithCount) => {
    setModalMode("edit");
    setModalData({
      id: category.id,
      name: category.name,
      description: category.description || "",
      color: category.color || "#FF8C42",
      icon: category.icon || "package",
    });
    setIsModalOpen(true);
  };

  // Guardar categoría (crear o editar)
  const handleSaveCategory = async () => {
    if (!modalData.name.trim()) {
      showError("Error", "El nombre de la categoría es obligatorio");
      return;
    }

    setModalLoading(true);
    try {
      let response;
      if (modalMode === "create") {
        response = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modalData),
        });
      } else {
        response = await fetch(`/api/admin/categories/${modalData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modalData),
        });
      }

      const data = await response.json();

      if (response.ok) {
        showSuccess(
          modalMode === "create" ? "Categoría creada" : "Categoría actualizada",
          data.message
        );
        setIsModalOpen(false);
        fetchCategories();
      } else {
        showError("Error", data.error || "No se pudo guardar la categoría");
      }
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      showError("Error", "Ocurrió un error al guardar la categoría");
    } finally {
      setModalLoading(false);
    }
  };

  // Abrir modal de confirmación para desactivar
  const handleDeleteClick = (category: CategoryWithCount) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  // Desactivar categoría
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(
        `/api/admin/categories/${categoryToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        showSuccess("Categoría desactivada", data.message);
        fetchCategories();
      } else {
        showError("Error", data.error || "No se pudo desactivar la categoría");
      }
    } catch (error) {
      console.error("Error al desactivar categoría:", error);
      showError("Error", "Ocurrió un error al desactivar la categoría");
    }
  };

  // Reactivar categoría
  const handleReactivateCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("Categoría reactivada", data.message);
        fetchCategories();
      } else {
        showError("Error", data.error || "No se pudo reactivar la categoría");
      }
    } catch (error) {
      console.error("Error al reactivar categoría:", error);
      showError("Error", "Ocurrió un error al reactivar la categoría");
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#B55424] to-[#E37836] rounded-3xl p-6 shadow-2xl border-4 border-amber-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <FolderPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Gestión de Categorías
                </h1>
                <p className="text-white/90">
                  Administra las categorías de tus productos
                </p>
              </div>
            </div>

            <div className="mt-4 lg:mt-0">
              <button
                onClick={handleCreateClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Nueva Categoría
              </button>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>

            {/* Mostrar inactivas */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                />
                <span className="text-gray-700 font-medium">
                  Mostrar categorías inactivas
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {categories.length}
                </p>
              </div>
              <FolderPlus className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Activas</p>
                <p className="text-2xl font-bold text-green-900">
                  {categories.filter((c) => c.isActive).length}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Inactivas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories.filter((c) => !c.isActive).length}
                </p>
              </div>
              <X className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Lista de categorías */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 border-4 border-amber-400/20 border-t-amber-500 rounded-full animate-spin"></div>
              <span className="text-gray-600">Cargando categorías...</span>
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <FolderPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay categorías
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "No se encontraron categorías con ese nombre."
                : "Comienza creando tu primera categoría."}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateClick}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B55424] to-[#E37836] text-white font-semibold rounded-xl hover:from-[#8B5A3C] hover:to-[#B55424] transition-all"
              >
                <Plus className="h-5 w-5" />
                Agregar primera categoría
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className={`bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 ${
                  category.isActive
                    ? "border-gray-200"
                    : "border-gray-300 opacity-60"
                }`}
              >
                {/* Barra de color superior */}
                <div
                  className="h-3"
                  style={{ backgroundColor: category.color }}
                />

                <div className="p-6">
                  {/* Encabezado */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <Package
                        className="h-6 w-6"
                        style={{ color: category.color }}
                      />
                    </div>
                    {!category.isActive && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                        Inactiva
                      </span>
                    )}
                  </div>

                  {/* Información */}
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  {/* Estadísticas */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Productos:</span>
                      <span className="font-bold text-gray-900">
                        {category._count?.products || 0}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </button>
                    {category.isActive ? (
                      <button
                        onClick={() => handleDeleteClick(category)}
                        disabled={(category._count?.products ?? 0) > 0}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          (category._count?.products ?? 0) > 0
                            ? "No se puede desactivar: tiene productos asociados"
                            : "Desactivar categoría"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivateCategory(category.id)}
                        className="bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center"
                        title="Reactivar categoría"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de crear/editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !modalLoading && setIsModalOpen(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                {/* Botón de cerrar */}
                <button
                  onClick={() => !modalLoading && setIsModalOpen(false)}
                  disabled={modalLoading}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>

                {/* Título */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                    <FolderPlus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {modalMode === "create"
                        ? "Nueva Categoría"
                        : "Editar Categoría"}
                    </h2>
                    <p className="text-gray-600">
                      {modalMode === "create"
                        ? "Completa los datos de la nueva categoría"
                        : "Modifica los datos de la categoría"}
                    </p>
                  </div>
                </div>

                {/* Formulario */}
                <div className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={modalData.name}
                      onChange={(e) =>
                        setModalData({ ...modalData, name: e.target.value })
                      }
                      placeholder="Ej: Panadería"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                      disabled={modalLoading}
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={modalData.description}
                      onChange={(e) =>
                        setModalData({
                          ...modalData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Descripción de la categoría..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                      disabled={modalLoading}
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="grid grid-cols-5 gap-3 mb-3">
                      {PREDEFINED_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setModalData({ ...modalData, color })}
                          disabled={modalLoading}
                          className={`w-full h-12 rounded-xl transition-all ${
                            modalData.color === color
                              ? "ring-4 ring-amber-400 scale-110"
                              : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={modalData.color}
                      onChange={(e) =>
                        setModalData({ ...modalData, color: e.target.value })
                      }
                      disabled={modalLoading}
                      className="w-full h-12 rounded-xl border-2 border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    disabled={modalLoading}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all border-2 border-gray-200 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveCategory}
                    disabled={modalLoading || !modalData.name.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {modalLoading
                      ? "Guardando..."
                      : modalMode === "create"
                      ? "Crear Categoría"
                      : "Guardar Cambios"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para desactivar */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="¿Desactivar categoría?"
        message={`¿Estás seguro de que deseas desactivar la categoría "${categoryToDelete?.name}"? Podrás reactivarla más tarde si lo necesitas.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        type="warning"
      />
    </>
  );
}
