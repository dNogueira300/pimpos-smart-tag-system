// src/app/api/client/session/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface SessionItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CompleteSessionRequest {
  sessionId: string;
  budget: number | null;
  totalSpent: number;
  itemCount: number;
  items: SessionItem[];
}

export async function POST(request: NextRequest) {
  try {
    const body: CompleteSessionRequest = await request.json();

    const { sessionId, budget, totalSpent, itemCount, items } = body;

    // Validaciones básicas
    if (!sessionId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Crear la sesión de compra
    const shoppingSession = await prisma.shoppingSession.create({
      data: {
        sessionId,
        budget: budget !== null ? budget : null,
        totalSpent,
        itemCount,
        isCompleted: true,
        lastActivity: new Date(),
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Incrementar el contador de escaneos para cada producto
    await Promise.all(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: {
            scanCount: {
              increment: item.quantity,
            },
          },
        })
      )
    );

    return NextResponse.json(
      {
        message: "Sesión completada exitosamente",
        session: {
          ...shoppingSession,
          budget: shoppingSession.budget
            ? shoppingSession.budget.toNumber()
            : null,
          totalSpent: shoppingSession.totalSpent.toNumber(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al completar sesión:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
