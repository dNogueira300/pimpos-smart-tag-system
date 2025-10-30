// src/lib/upload.ts
import { put, del } from "@vercel/blob";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Detecta si estamos en producción (Vercel)
 */
export function isProduction(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

/**
 * Sube una imagen
 * - En producción: usa Vercel Blob
 * - En desarrollo: usa sistema de archivos local
 */
export async function uploadImage(
  imageFile: File,
  folder: string = "products"
): Promise<string> {
  const bytes = await imageFile.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (isProduction()) {
    // Producción: Vercel Blob
    const fileExtension = imageFile.name.split(".").pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const blob = await put(fileName, buffer, {
      access: "public",
      addRandomSuffix: false,
    });

    return blob.url;
  } else {
    // Desarrollo: Sistema de archivos local
    const uploadDir = join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    const fileExtension = imageFile.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    return `/uploads/${folder}/${fileName}`;
  }
}

/**
 * Elimina una imagen
 * - En producción: elimina de Vercel Blob
 * - En desarrollo: elimina del sistema de archivos
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  if (isProduction()) {
    // Producción: Vercel Blob
    if (imageUrl.includes("vercel-storage")) {
      try {
        await del(imageUrl);
      } catch (error) {
        console.log("No se pudo eliminar la imagen de Vercel Blob:", error);
      }
    }
  } else {
    // Desarrollo: Sistema de archivos local
    if (imageUrl.startsWith("/uploads/")) {
      try {
        const imagePath = join(process.cwd(), "public", imageUrl);
        await unlink(imagePath);
      } catch (error) {
        console.log("No se pudo eliminar la imagen local:", error);
      }
    }
  }
}

/**
 * Valida si un archivo es una imagen válida
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "La imagen no debe superar los 5MB",
    };
  }

  // Validar tipo de archivo
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Solo se permiten imágenes JPG, PNG o WebP",
    };
  }

  return { valid: true };
}
