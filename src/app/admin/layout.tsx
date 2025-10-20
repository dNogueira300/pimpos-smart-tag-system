// src/app/admin/layout.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Upload,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
  QrCode,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Image from "next/image";

// Definir el tipo para la sesión
interface UserSession {
  user?: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
  };
}

interface SidebarContentProps {
  onItemClick?: () => void;
  currentPath: string;
  onSignOut?: () => void;
  session?: UserSession | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
    description: "Resumen de actividades",
  },
  {
    title: "Productos",
    icon: Package,
    href: "/admin/products/list",
    description: "Gestionar productos",
  },
  {
    title: "Nuevo Producto",
    icon: Plus,
    href: "/admin/products/new",
    description: "Agregar producto",
  },
  {
    title: "Importar Productos",
    icon: Upload,
    href: "/admin/products/import",
    description: "Carga masiva",
  },
  {
    title: "Generar QRs",
    icon: QrCode,
    href: "/admin/qr-codes",
    description: "Descargar códigos QR",
  },
  {
    title: "Productos por Vencer",
    icon: AlertTriangle,
    href: "/admin/expiring",
    description: "Alertas de vencimiento",
  },
  {
    title: "Configuración",
    icon: Settings,
    href: "/admin/settings",
    description: "Configurar sistema",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session && pathname !== "/admin/login") {
      router.push("/admin/login");
      return;
    }

    if (session && pathname === "/admin/login") {
      router.push("/admin");
      return;
    }
  }, [session, status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-200">
          <div className="w-8 h-8 border-4 border-amber-400/20 border-t-amber-500 rounded-full animate-spin"></div>
          <span className="text-gray-700 font-medium">
            Cargando panel administrativo...
          </span>
        </div>
      </div>
    );
  }

  if (!session && pathname !== "/admin/login") {
    return null;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Sidebar para móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-[#B55424] border-r-4 border-[#E37836] shadow-2xl">
            <SidebarContent
              onItemClick={() => setSidebarOpen(false)}
              currentPath={pathname}
              onSignOut={handleSignOut}
              session={session}
              collapsed={false}
              onToggleCollapse={toggleSidebarCollapse}
            />
          </div>
        </div>
      )}

      {/* Sidebar para desktop */}
      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${
          sidebarCollapsed ? "lg:w-20" : "lg:w-80"
        }`}
      >
        <div className="bg-[#B55424] border-r-4 border-[#E37836] h-full shadow-2xl relative">
          <SidebarContent
            currentPath={pathname}
            onSignOut={handleSignOut}
            session={session}
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-80"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-40 flex h-20 items-center gap-x-4 bg-[#B55424] px-4 shadow-lg border-b-4 border-[#E37836] sm:gap-x-6 lg:px-6">
          <button
            type="button"
            className="p-3 text-white hover:bg-[#E37836]/20 rounded-xl transition-all lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Espacio flexible para empujar el contenido a la derecha */}
          <div className="flex-1"></div>

          <div className="flex items-center gap-x-6">
            <div className="text-right">
              <div className="text-sm font-semibold text-white">
                {session?.user?.name || session?.user?.username}
              </div>
              <div className="text-xs text-white/80">Administrador</div>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform duration-200"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="py-8">
          <div className="mx-auto max-w-[95%] px-4 lg:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  onItemClick,
  currentPath,
  collapsed = false,
  onToggleCollapse,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col gap-y-6 overflow-y-auto px-6 py-8">
      {/* Logo y título */}
      <div
        className={`flex flex-col items-center gap-4 pb-6 border-b-2 border-[#E37836]/30 ${
          collapsed ? "px-0" : ""
        }`}
      >
        <div className={`relative ${collapsed ? "w-16 h-16" : "w-34 h-34"}`}>
          <Image
            src="/logo-pimpos.png"
            alt="Pimpos Logo"
            width={collapsed ? 64 : 120}
            height={collapsed ? 64 : 120}
            className="rounded-full object-cover shadow-2xl"
            priority
          />
        </div>
        {!collapsed && (
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              Panadería Pimpos
            </div>
            <div className="text-white/90 font-medium text-sm mt-1">
              Panel Administrativo
            </div>
          </div>
        )}

        {/* Botón de colapsar mejorado */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 mt-2"
          aria-label="Toggle sidebar"
          title={collapsed ? "Expandir sidebar" : "Contraer sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-white" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-white" />
          )}
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex flex-1 flex-col">
        <ul className="flex flex-1 flex-col gap-y-2">
          {sidebarItems.map((item) => {
            const isActive = currentPath === item.href;

            return (
              <li key={item.title}>
                <Link
                  href={item.href}
                  onClick={onItemClick}
                  className={
                    collapsed
                      ? "group flex justify-center p-3 text-sm font-medium transition duration-200 w-full border-transparent shadow-none rounded-xl hover:bg-white/10"
                      : `group flex gap-x-3 p-3 rounded-xl text-sm font-medium transition duration-200 shadow-md border-2 ${
                          isActive
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 shadow-lg"
                            : "bg-white/80 text-gray-700 border-amber-200 hover:border-amber-400 hover:shadow-lg hover:scale-102"
                        }`
                  }
                  title={
                    collapsed
                      ? `${item.title} - ${item.description}`
                      : undefined
                  }
                >
                  {/* Icon container: circular, centered in collapsed mode */}
                  <div
                    className={`flex-shrink-0 flex items-center justify-center ${
                      collapsed
                        ? "w-10 h-10 rounded-full mx-auto border-2 border-white/50"
                        : "w-8 h-8 rounded-lg"
                    } ${
                      isActive ? "bg-amber-600" : "bg-transparent"
                    } transition duration-200`}
                  >
                    <item.icon
                      className={`${collapsed ? "h-5 w-5" : "h-5 w-5"} ${
                        isActive ? "text-white" : "text-amber-500"
                      }`}
                    />
                  </div>

                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm leading-tight">
                        {item.title}
                      </div>
                      <div
                        className={`text-xs leading-tight mt-0.5 ${
                          isActive ? "text-white/90" : "text-gray-500"
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer del sidebar */}
      {!collapsed && (
        <div className="pt-4 border-t-2 border-[#E37836]/30">
          <div className="text-xs text-white/80 text-center font-medium leading-tight">
            Sistema Web de Información Productiva
          </div>
          <div className="text-xs text-white/60 text-center mt-1 leading-tight">
            © 2025 Panadería Pimpos
          </div>
        </div>
      )}
    </div>
  );
}
