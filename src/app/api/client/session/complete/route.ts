// src/app/api/client/session/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client"; // <-- 1. AÑADIR ESTA IMPORTACIÓN DE TIPO

interface SessionItem {
  productId: string;
  productName?: string;
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

// Función para generar número de ticket único
async function generateTicketNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  // Buscar el último ticket del día
  const lastTicket = await prisma.ticket.findFirst({
    where: {
      ticketNumber: {
        startsWith: `TKT-${dateStr}-`,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let counter = 1;
  if (lastTicket) {
    const lastNumber = lastTicket.ticketNumber.split("-")[2];
    counter = parseInt(lastNumber, 10) + 1;
  }

  return `TKT-${dateStr}-${counter.toString().padStart(3, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: CompleteSessionRequest = await request.json();

    const { sessionId, budget, totalSpent, itemCount, items } = body;

    // Validaciones básicas
    if (!sessionId || !items || items.length === 0) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Verificar si la sesión ya existe
    const existingSession = await prisma.shoppingSession.findUnique({
      where: { sessionId },
    });

    if (existingSession) {
      // Si la sesión ya existe, retornarla
      return NextResponse.json(
        {
          message: "Sesión ya completada",
          session: {
            ...existingSession,
            budget: existingSession.budget
              ? existingSession.budget.toNumber()
              : null,
            totalSpent: existingSession.totalSpent.toNumber(),
          },
        },
        { status: 200 }
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

    // Generar número de ticket único
    const ticketNumber = await generateTicketNumber();

    // Crear el ticket con los detalles de la compra
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        sessionId,
        totalAmount: totalSpent,
        budget: budget !== null ? budget : null,
        itemCount,
        // --- 2. CORRECCIÓN AQUÍ ---
        // Usamos el tipo 'InputJsonValue' de Prisma en lugar de 'any'
        items: items as unknown as Prisma.InputJsonValue,
        budgetExceeded: budget !== null ? totalSpent > budget : false,
      },
    });

    return NextResponse.json(
      {
        message: "Sesión completada exitosamente",
        ticketNumber: ticket.ticketNumber,
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
