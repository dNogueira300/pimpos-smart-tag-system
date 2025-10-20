"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al login de admin después de 2 segundos
    const timer = setTimeout(() => {
      router.push("/admin/login");
    }, 2000);

    // Limpiar el timer si el componente se desmonta
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFFEF7] flex items-center justify-center">
      {/* Logo centrado */}
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <Image
              src="/logo-pimpos.png"
              alt="Pimpos Logo"
              width={400}
              height={400}
              className="rounded-full object-cover"
              priority
            />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4">
          Panadería y Minimarket Pimpos
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Sistema de Gestión Inteligente
        </p>
      </div>
    </div>
  );
}
