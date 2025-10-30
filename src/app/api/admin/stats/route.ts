// src/app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Calcular la fecha límite para productos por vencer (próximos 7 días)
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 7);

    // Obtener todas las estadísticas en paralelo
    const [totalProducts, activeProducts, expiringProducts, totalCategories] =
      await Promise.all([
        // Total de productos
        prisma.product.count(),

        // Productos activos
        prisma.product.count({
          where: { isActive: true },
        }),

        // Productos por vencer (próximos 7 días)
        prisma.product.count({
          where: {
            isPerishable: true,
            expiresAt: {
              gte: new Date(), // Mayor o igual a hoy
              lte: expiringDate, // Menor o igual a 7 días desde hoy
            },
          },
        }),

        // Total de categorías activas
        prisma.category.count({
          where: { isActive: true },
        }),
      ]);

    return NextResponse.json({
      totalProducts,
      activeProducts,
      expiringProducts,
      totalCategories,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
