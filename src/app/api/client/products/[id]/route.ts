// src/app/api/client/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: {
        id,
        isActive: true, // Solo productos activos
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Incrementar contador de vistas
    await prisma.product.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    // Convertir Decimals a números para serialización JSON
    const productResponse = {
      ...product,
      price: product.price.toNumber(),
      promotionPrice: product.promotionPrice
        ? product.promotionPrice.toNumber()
        : null,
    };

    return NextResponse.json({
      product: productResponse,
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
