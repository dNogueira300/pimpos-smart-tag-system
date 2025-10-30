// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();

    // Extraer datos del formulario
    const productData = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      code: formData.get("code") as string,
      barcode: (formData.get("barcode") as string) || null,
      price: parseFloat(formData.get("price") as string),
      categoryId: formData.get("categoryId") as string,

      // Fechas
      manufacturedAt: formData.get("manufacturedAt")
        ? new Date(formData.get("manufacturedAt") as string)
        : null,
      expiresAt: formData.get("expiresAt")
        ? new Date(formData.get("expiresAt") as string)
        : null,

      // Información nutricional
      servingSize: (formData.get("servingSize") as string) || null,
      calories: formData.get("calories")
        ? parseFloat(formData.get("calories") as string)
        : null,
      totalFat: formData.get("totalFat")
        ? parseFloat(formData.get("totalFat") as string)
        : null,
      saturatedFat: formData.get("saturatedFat")
        ? parseFloat(formData.get("saturatedFat") as string)
        : null,
      transFat: formData.get("transFat")
        ? parseFloat(formData.get("transFat") as string)
        : null,
      cholesterol: formData.get("cholesterol")
        ? parseFloat(formData.get("cholesterol") as string)
        : null,
      sodium: formData.get("sodium")
        ? parseFloat(formData.get("sodium") as string)
        : null,
      totalCarbs: formData.get("totalCarbs")
        ? parseFloat(formData.get("totalCarbs") as string)
        : null,
      dietaryFiber: formData.get("dietaryFiber")
        ? parseFloat(formData.get("dietaryFiber") as string)
        : null,
      sugars: formData.get("sugars")
        ? parseFloat(formData.get("sugars") as string)
        : null,
      addedSugars: formData.get("addedSugars")
        ? parseFloat(formData.get("addedSugars") as string)
        : null,
      protein: formData.get("protein")
        ? parseFloat(formData.get("protein") as string)
        : null,

      // Vitaminas y minerales
      vitaminA: formData.get("vitaminA")
        ? parseFloat(formData.get("vitaminA") as string)
        : null,
      vitaminC: formData.get("vitaminC")
        ? parseFloat(formData.get("vitaminC") as string)
        : null,
      calcium: formData.get("calcium")
        ? parseFloat(formData.get("calcium") as string)
        : null,
      iron: formData.get("iron")
        ? parseFloat(formData.get("iron") as string)
        : null,
      potassium: formData.get("potassium")
        ? parseFloat(formData.get("potassium") as string)
        : null,
      magnesium: formData.get("magnesium")
        ? parseFloat(formData.get("magnesium") as string)
        : null,

      // Información adicional
      ingredients: (formData.get("ingredients") as string) || null,
      allergens: (formData.get("allergens") as string) || null,
      isPerishable: formData.get("isPerishable") === "true",
      isFeatured: formData.get("isFeatured") === "true",
      hasPromotion: formData.get("hasPromotion") === "true",
      promotionText: (formData.get("promotionText") as string) || null,
      promotionPrice: formData.get("promotionPrice")
        ? parseFloat(formData.get("promotionPrice") as string)
        : null,
      promotionStartDate: formData.get("promotionStartDate")
        ? new Date(formData.get("promotionStartDate") as string)
        : null,
      promotionEndDate: formData.get("promotionEndDate")
        ? new Date(formData.get("promotionEndDate") as string)
        : null,
      promotionDescription:
        (formData.get("promotionDescription") as string) || null,
    };

    // Validaciones básicas
    if (
      !productData.name ||
      !productData.code ||
      !productData.price ||
      !productData.categoryId
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un producto con el mismo código
    const existingProduct = await prisma.product.findUnique({
      where: { code: productData.code },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Ya existe un producto con este código" },
        { status: 400 }
      );
    }

    // Procesar imagen si existe
    let imageUrl = (formData.get("imageUrl") as string) || null;
    const imageFile = formData.get("imageFile") as File;

    // Detectar si estamos en producción (Vercel)
    const isProduction = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

    if (imageFile && imageFile.size > 0) {
      if (isProduction) {
        // En producción, no intentamos guardar archivos localmente
        return NextResponse.json(
          {
            error: "En producción, use una URL externa para la imagen. El sistema de archivos es de solo lectura.",
            suggestion: "Sube la imagen a un servicio como Cloudinary, Imgur o similares, y usa la URL en el campo 'URL de Imagen'"
          },
          { status: 400 }
        );
      }

      // Solo en desarrollo: guardar archivo localmente
      try {
        // Crear directorio si no existe
        const uploadDir = join(process.cwd(), "public", "uploads", "products");
        await mkdir(uploadDir, { recursive: true });

        // Generar nombre único para el archivo
        const fileExtension = imageFile.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = join(uploadDir, fileName);

        // Guardar archivo
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Establecer URL relativa
        imageUrl = `/uploads/products/${fileName}`;
      } catch (error) {
        console.error("Error al guardar imagen:", error);
        return NextResponse.json(
          { error: "Error al procesar la imagen" },
          { status: 500 }
        );
      }
    }

    // Calcular octágonos de advertencia
    const calculateWarnings = () => {
      const sodium = productData.sodium || 0;
      const sugars = productData.sugars || 0;
      const saturatedFat = productData.saturatedFat || 0;
      const transFat = productData.transFat || 0;

      return {
        highSodium: sodium >= 600,
        highSugar: sugars >= 22.5,
        highSatFat: saturatedFat >= 6,
        highTransFat: transFat >= 0.1,
      };
    };

    const warnings = calculateWarnings();

    // Buscar el usuario actual
    const user = await prisma.user.findUnique({
      where: { username: session.user.username },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Crear el producto en la base de datos
    const product = await prisma.product.create({
      data: {
        ...productData,
        imageUrl,
        createdById: user.id,
        ...warnings,
        viewCount: 0,
        scanCount: 0,
        isActive: true,
      },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    // Registrar en el log de auditoría
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        productId: product.id,
        action: "CREATE",
        entity: "PRODUCT",
        newData: product,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json(
      {
        message: "Producto creado exitosamente",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear producto:", error);

    if (error instanceof Error) {
      // Error de validación de Prisma
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Ya existe un producto con este código o código de barras" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: {
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        code?: { contains: string; mode: "insensitive" };
        description?: { contains: string; mode: "insensitive" };
      }>;
      categoryId?: string;
    } = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    // Obtener productos con paginación
    const [productsRaw, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          createdBy: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Convertir Decimals a números para serialización JSON
    const products = productsRaw.map((product) => ({
      ...product,
      price: product.price.toNumber(),
      promotionPrice: product.promotionPrice
        ? product.promotionPrice.toNumber()
        : null,
    }));

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
