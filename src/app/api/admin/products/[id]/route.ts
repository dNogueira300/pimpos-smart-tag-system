// src/app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        priceHistory: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: {
                username: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Convertir Decimals a números para serialización JSON
    const productWithNumbers = {
      ...product,
      price: product.price.toNumber(),
      promotionPrice: product.promotionPrice
        ? product.promotionPrice.toNumber()
        : null,
      priceHistory: product.priceHistory.map((history) => ({
        ...history,
        oldPrice: history.oldPrice.toNumber(),
        newPrice: history.newPrice.toNumber(),
      })),
    };

    return NextResponse.json({ product: productWithNumbers });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
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

    // Verificar si hay cambio de precio para el historial
    const priceChanged = existingProduct.price.toNumber() !== productData.price;

    // Procesar imagen si existe
    let imageUrl = existingProduct.imageUrl;
    const newImageUrl = formData.get("imageUrl") as string;
    const imageFile = formData.get("imageFile") as File;

    if (imageFile && imageFile.size > 0) {
      try {
        // Eliminar imagen anterior si existe
        if (
          existingProduct.imageUrl &&
          existingProduct.imageUrl.startsWith("/uploads/")
        ) {
          const oldImagePath = join(
            process.cwd(),
            "public",
            existingProduct.imageUrl
          );
          try {
            await unlink(oldImagePath);
          } catch (error) {
            console.log("No se pudo eliminar la imagen anterior:", error);
          }
        }

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
    } else if (newImageUrl !== existingProduct.imageUrl) {
      // Si se cambió la URL de imagen
      imageUrl = newImageUrl || null;
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

    // Actualizar el producto en la base de datos
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        imageUrl,
        ...warnings,
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

    // Registrar cambio de precio si es necesario
    if (priceChanged) {
      await prisma.priceHistory.create({
        data: {
          productId: id,
          oldPrice: existingProduct.price,
          newPrice: productData.price,
          changedBy: user.id,
          reason: "Actualización manual desde panel administrativo",
        },
      });
    }

    // Registrar en el log de auditoría
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        productId: id,
        action: "UPDATE",
        entity: "PRODUCT",
        oldData: existingProduct,
        newData: updatedProduct,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      message: "Producto actualizado exitosamente",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

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

    // Eliminar imagen del servidor si existe
    if (
      existingProduct.imageUrl &&
      existingProduct.imageUrl.startsWith("/uploads/")
    ) {
      const imagePath = join(process.cwd(), "public", existingProduct.imageUrl);
      try {
        await unlink(imagePath);
      } catch (error) {
        console.log("No se pudo eliminar la imagen:", error);
      }
    }

    // Eliminar el producto (esto también eliminará historial de precios y logs de auditoría por cascada)
    await prisma.product.delete({
      where: { id },
    });

    // Registrar en el log de auditoría
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DELETE",
        entity: "PRODUCT",
        oldData: existingProduct,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      message: "Producto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
