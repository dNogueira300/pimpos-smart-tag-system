// src/app/api/admin/tickets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";

    console.log("GET /api/admin/tickets - Parámetros:", { page, limit, search });

    // Calcular offset para la paginación
    const offset = (page - 1) * limit;

    // Construir condiciones de búsqueda
    const where = search
      ? {
          ticketNumber: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {};

    // Obtener tickets con paginación
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ]);

    console.log("Tickets encontrados en BD:", {
      total,
      ticketsEnPagina: tickets.length,
      primerosTickets: tickets.slice(0, 3).map(t => ({
        ticketNumber: t.ticketNumber,
        createdAt: t.createdAt,
      })),
    });

    return NextResponse.json({
      tickets: tickets.map((ticket) => ({
        ...ticket,
        totalAmount: ticket.totalAmount.toNumber(),
        budget: ticket.budget ? ticket.budget.toNumber() : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener tickets:", error);
    return NextResponse.json(
      { error: "Error al obtener tickets" },
      { status: 500 }
    );
  }
}
