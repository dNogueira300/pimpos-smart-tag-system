// src/app/admin/products/list/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  Calendar,
  Grid,
  List,
  Download,
  Upload,
  MoreVertical,
} from "lucide-react";
import { Product, Category } from "@/types/product";
import ConfirmModal from "@/components/ConfirmModal";

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Cargar productos
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        category: selectedCategory,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/admin/products?${params}`);
      if (response.ok) {
        const data: ProductsResponse = await response.json();
        setProducts(data.products);
        setPagination(data.pagination);
      } else {
        console.error("Error al cargar productos");
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pagination.limit,
    searchTerm,
    selectedCategory,
    sortBy,
    sortOrder,
  ]);

  // Cargar categorías
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Abrir modal de confirmación para eliminar
  const handleDeleteProduct = (productId: string, productName: string) => {
    setProductToDelete({ id: productId, name: productName });
    setShowDeleteModal(true);
  };

  // Confirmar eliminación del producto
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchProducts(); // Recargar la lista
        // Mostrar mensaje de éxito (opcional: puedes agregar un toast aquí)
      } else {
        const error = await response.json();
        alert(`Error al eliminar producto: ${error.error}`);
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar producto");
    } finally {
      setProductToDelete(null);
    }
  };

  // Función para formatear precio
  const formatPrice = (price: number | string | { toNumber: () => number }) => {
    let numericPrice: number;

    if (typeof price === "number") {
      numericPrice = price;
    } else if (typeof price === "string") {
      numericPrice = parseFloat(price);
    } else if (price && typeof price === "object" && "toNumber" in price) {
      // Manejo de Decimal de Prisma
      numericPrice = price.toNumber();
    } else {
      numericPrice = 0;
    }

    return `S/ ${numericPrice.toFixed(2)}`;
  };

  // Función para calcular días hasta vencimiento
  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Renderizar octágonos de advertencia
  const renderWarnings = (product: Product) => {
    const warnings = [];
    if (product.highSodium) warnings.push("ALTO EN SODIO");
    if (product.highSugar) warnings.push("ALTO EN AZÚCARES");
    if (product.highSatFat) warnings.push("ALTO EN GRASAS SATURADAS");
    if (product.highTransFat) warnings.push("ALTO EN GRASAS TRANS");

    if (warnings.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {warnings.map((warning, index) => (
          <span
            key={index}
            className="inline-block bg-black text-white text-xs px-2 py-1 rounded font-bold"
          >
            {warning}
          </span>
        ))}
      </div>
    );
  };

  // Vista en grilla
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const daysUntilExpiry = getDaysUntilExpiry(
          product.expiresAt?.toString() || null
        );
        const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 3;
        const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;

        return (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            {/* Imagen del producto */}
            <div className="relative h-48 bg-gray-100">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized={true}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.isFeatured && (
                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    Destacado
                  </span>
                )}
                {product.hasPromotion && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    Promoción
                  </span>
                )}
                {isExpired && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                    Vencido
                  </span>
                )}
                {isExpiringSoon && !isExpired && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    Por vencer
                  </span>
                )}
              </div>

              {/* Menú de acciones */}
              <div className="absolute top-3 right-3">
                <div className="bg-white rounded-full shadow-lg p-1">
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Información del producto */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                  {product.name}
                </h3>
              </div>

              <p className="text-xs text-gray-500 mb-2">
                Código: {product.code}
              </p>

              {/* Precio */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.hasPromotion && product.promotionPrice && (
                    <span className="text-sm text-red-600 font-semibold">
                      {formatPrice(product.promotionPrice)}
                    </span>
                  )}
                </div>

                {product.category && (
                  <span
                    className="text-xs px-2 py-1 rounded-full text-white font-medium"
                    style={{ backgroundColor: product.category.color }}
                  >
                    {product.category.name}
                  </span>
                )}
              </div>

              {/* Fecha de vencimiento */}
              {product.expiresAt && (
                <div className="flex items-center gap-1 mb-2">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span
                    className={`text-xs ${
                      isExpired
                        ? "text-red-600 font-semibold"
                        : isExpiringSoon
                        ? "text-orange-600 font-semibold"
                        : "text-gray-500"
                    }`}
                  >
                    Vence: {new Date(product.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Octágonos de advertencia */}
              {renderWarnings(product)}

              {/* Acciones */}
              <div className="flex gap-2 mt-4">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Editar
                </Link>
                <Link
                  href={`/client/product/${product.id}`}
                  target="_blank"
                  className="bg-green-500 hover:bg-green-600 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Eye className="h-3 w-3" />
                </Link>
                <button
                  onClick={() => handleDeleteProduct(product.id, product.name)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Vista en lista
  const renderListView = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimiento
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => {
              const daysUntilExpiry = getDaysUntilExpiry(
                product.expiresAt?.toString() || null
              );
              const isExpiringSoon =
                daysUntilExpiry !== null && daysUntilExpiry <= 3;
              const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;

              return (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            unoptimized={true}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {product.code}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.hasPromotion && product.promotionPrice && (
                        <span className="text-sm text-red-600 font-semibold">
                          {formatPrice(product.promotionPrice)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.category && (
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: product.category.color }}
                      >
                        {product.category.name}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {product.isFeatured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Destacado
                        </span>
                      )}
                      {product.hasPromotion && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Promoción
                        </span>
                      )}
                      {isExpired && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Vencido
                        </span>
                      )}
                      {isExpiringSoon && !isExpired && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Por vencer
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.expiresAt ? (
                      <span
                        className={
                          isExpired
                            ? "text-red-600 font-semibold"
                            : isExpiringSoon
                            ? "text-orange-600 font-semibold"
                            : "text-gray-500"
                        }
                      >
                        {new Date(product.expiresAt).toLocaleDateString()}
                      </span>
                    ) : (
                      "No aplica"
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                        title="Editar producto"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/client/product/${product.id}`}
                        target="_blank"
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                        title="Ver como cliente"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() =>
                          handleDeleteProduct(product.id, product.name)
                        }
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#B55424] to-[#E37836] rounded-3xl p-6 shadow-2xl border-4 border-amber-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Lista de Productos
                </h1>
                <p className="text-white/90">
                  Gestiona todos los productos del catálogo
                </p>
              </div>
            </div>

            <div className="mt-4 lg:mt-0 flex flex-wrap gap-3">
              <Link
                href="/admin/products/import"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white font-medium rounded-xl hover:bg-white/30 transition-all"
              >
                <Upload className="h-4 w-4" />
                Importar
              </Link>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white font-medium rounded-xl hover:bg-white/30 transition-all">
                <Download className="h-4 w-4" />
                Exportar
              </button>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Nuevo Producto
              </Link>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-200">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {/* Filtro por categoría */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenar por */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              >
                <option value="createdAt">Fecha de creación</option>
                <option value="name">Nombre</option>
                <option value="price">Precio</option>
                <option value="updatedAt">Última actualización</option>
              </select>
            </div>

            {/* Orden */}
            <div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>

            {/* Modo de vista */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex-1 p-3 rounded-xl transition-all ${
                  viewMode === "grid"
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Grid className="h-5 w-5 mx-auto" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 p-3 rounded-xl transition-all ${
                  viewMode === "list"
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <List className="h-5 w-5 mx-auto" />
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {pagination.total}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Activos</p>
                <p className="text-2xl font-bold text-green-900">
                  {products.filter((p) => p.isActive).length}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">
                  Por vencer
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {
                    products.filter((p) => {
                      const days = getDaysUntilExpiry(
                        p.expiresAt?.toString() || null
                      );
                      return days !== null && days <= 3 && days >= 0;
                    }).length
                  }
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">
                  Destacados
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {products.filter((p) => p.isFeatured).length}
                </p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 border-4 border-amber-400/20 border-t-amber-500 rounded-full animate-spin"></div>
              <span className="text-gray-600">Cargando productos...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay productos
            </h3>
            <p className="text-gray-600 mb-6">
              No se encontraron productos con los filtros aplicados.
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B55424] to-[#E37836] text-white font-semibold rounded-xl hover:from-[#8B5A3C] hover:to-[#B55424] transition-all"
            >
              <Plus className="h-5 w-5" />
              Agregar primer producto
            </Link>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? renderGridView() : renderListView()}

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                <div className="flex space-x-1">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? "bg-amber-500 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(pagination.totalPages, currentPage + 1)
                    )
                  }
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProductToDelete(null);
        }}
        onConfirm={confirmDeleteProduct}
        title="Eliminar producto"
        message={
          productToDelete
            ? `¿Estás seguro de que deseas eliminar el producto "${productToDelete.name}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      <FloatingNewProductButton />
    </>
  );
}

// Botón flotante 'Nuevo Producto' (aparece en la página de lista de productos)
export function FloatingNewProductButton() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-10 right-16 z-60">
      <Link
        href="/admin/products/new"
        className="inline-flex items-center bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 overflow-hidden"
        aria-label="Nuevo Producto"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onClick={() => setIsExpanded(true)}
      >
        {/* Parte del icono - siempre visible */}
        <div className="p-4">
          <Plus className="h-5 w-5" />
        </div>

        {/* Parte del texto - se expande/contrae */}
        <div
          className={`transition-all duration-300 ${
            isExpanded ? "max-w-32 opacity-100 pr-6" : "max-w-0 opacity-0 pr-0"
          }`}
        >
          Nuevo Producto
        </div>
      </Link>
    </div>
  );
}
