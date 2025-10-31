// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Package,
  Upload,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  BarChart3,
  Settings,
  QrCode,
  Users,
  FolderPlus,
} from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  expiringProducts: number;
  totalCategories: number;
}

export default function ProductsDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    expiringProducts: 0,
    totalCategories: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar estadísticas reales desde la API
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");

        if (!response.ok) {
          throw new Error("Error al cargar estadísticas");
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        // En caso de error, mantener los valores en 0
        setStats({
          totalProducts: 0,
          activeProducts: 0,
          expiringProducts: 0,
          totalCategories: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-200">
          <div className="w-8 h-8 border-4 border-amber-400/20 border-t-amber-500 rounded-full animate-spin"></div>
          <span className="text-gray-700 font-medium">
            Cargando dashboard de productos...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#B55424] to-[#E37836] rounded-3xl p-8 shadow-2xl border-4 border-amber-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src="/logo-pimpos.png"
                alt="Pimpos Logo"
                width={80}
                height={80}
                className="rounded-full object-cover shadow-2xl border-1 border-white"
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Dashboard de Productos
              </h1>
              <p className="text-white/90 text-lg">
                Gestiona el catálogo completo de Panadería Pimpos
              </p>
            </div>
          </div>

          <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row gap-4">
            <Link
              href="/admin/categories/new"
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-white/30 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform duration-200 border border-white/30"
            >
              <FolderPlus className="h-5 w-5" />
              Nueva Categoria
            </Link>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform duration-200"
            >
              <Plus className="h-5 w-5" />
              Nuevo Producto
            </Link>
          </div>
        </div>
      </div>

      {/* Estadísticas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Productos */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Total Productos
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalProducts}
              </p>
              <p className="text-sm text-emerald-600 font-medium mt-1">
                En catálogo
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Productos Activos */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Productos Activos
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.activeProducts}
              </p>
              <p className="text-sm text-emerald-600 font-medium mt-1">
                Disponibles
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Por Vencer */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Por Vencer
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.expiringProducts}
              </p>
              <p className="text-sm text-amber-600 font-medium mt-1">
                Requieren atención
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                Total Categorías
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalCategories}
              </p>
              <p className="text-sm text-purple-600 font-medium mt-1">
                Organizadas
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de Bienvenida - Solo se muestra si no hay productos */}
      {stats.totalProducts === 0 && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-amber-200">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Bienvenido al Panel Administrativo de Pimpos!
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              El sistema está funcionando correctamente. Todas las funcionalidades
              están listas para usar. Comienza gestionando tu catálogo de
              productos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#B55424] to-[#E37836] text-white font-semibold rounded-xl hover:from-[#8B5A3C] hover:to-[#B55424] transition-all shadow-lg hover:shadow-xl hover:scale-105 transform duration-200"
              >
                <Plus className="h-5 w-5" />
                Agregar tu primer producto
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Resumen y Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resumen de Inventario */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-amber-200">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Resumen de Inventario
              </h3>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Productos totales</div>
                  <div className="text-sm text-gray-600">En catálogo completo</div>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {stats.totalProducts}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Disponibles</div>
                  <div className="text-sm text-gray-600">Productos activos</div>
                </div>
              </div>
              <span className="text-2xl font-bold text-emerald-600">
                {stats.activeProducts}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-100 border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Por vencer</div>
                  <div className="text-sm text-gray-600">Próximos 7 días</div>
                </div>
              </div>
              <span className="text-2xl font-bold text-amber-600">
                {stats.expiringProducts}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Categorías</div>
                  <div className="text-sm text-gray-600">Activas en sistema</div>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {stats.totalCategories}
              </span>
            </div>
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-amber-200">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Accesos Rápidos
              </h3>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <Link
              href="/admin/products/new"
              className="flex items-center p-4 rounded-2xl border-2 border-blue-200 hover:bg-blue-50 transition-all duration-200 hover:shadow-md cursor-pointer group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-lg">
                  Agregar Producto
                </div>
                <div className="text-gray-600">
                  Añadir nuevo producto al catálogo
                </div>
              </div>
            </Link>

            <Link
              href="/admin/categories/new"
              className="flex items-center p-4 rounded-2xl border-2 border-purple-200 hover:bg-purple-50 transition-all duration-200 hover:shadow-md cursor-pointer group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                <FolderPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-lg">
                  Nueva Categoría
                </div>
                <div className="text-gray-600">
                  Crear categoría para organizar productos
                </div>
              </div>
            </Link>

            <Link
              href="/admin/products/list"
              className="flex items-center p-4 rounded-2xl border-2 border-amber-200 hover:bg-amber-50 transition-all duration-200 hover:shadow-md cursor-pointer group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-lg">
                  Ver Productos
                </div>
                <div className="text-gray-600">
                  Gestionar catálogo completo
                </div>
              </div>
            </Link>

            <Link
              href="/admin/tickets"
              className="flex items-center p-4 rounded-2xl border-2 border-emerald-200 hover:bg-emerald-50 transition-all duration-200 hover:shadow-md cursor-pointer group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-lg">
                  Tickets de Compra
                </div>
                <div className="text-gray-600">
                  Ver historial de tickets
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer del Dashboard */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-6 border border-gray-200">
        <div className="text-center">
          <p className="text-gray-600 text-sm font-medium">
            Sistema Web de Información Productiva - Panadería Pimpos
          </p>
          <p className="text-gray-500 text-xs mt-1">
            © 2025 Todos los derechos reservados
          </p>
        </div>
      </div>

      {/* Floating button removed from dashboard; moved to products list page */}
    </div>
  );
}
