# Manejo de Imágenes en Producción (Vercel)

## Problema
Vercel usa un sistema de archivos de solo lectura (`read-only file system`), por lo que **no es posible guardar archivos directamente en el servidor**.

## Solución Implementada

El sistema ahora funciona de la siguiente manera:

### En Desarrollo (localhost)
- ✅ Puedes subir archivos directamente desde tu computadora
- ✅ Las imágenes se guardan en `/public/uploads/products/`
- ✅ Funciona normalmente como antes

### En Producción (Vercel)
- ❌ NO puedes subir archivos desde tu computadora
- ✅ DEBES usar URLs externas de imágenes

## Cómo usar imágenes en producción

Tienes 3 opciones:

### Opción 1: Cloudinary (Recomendado) ⭐

1. Crea una cuenta gratuita en [Cloudinary](https://cloudinary.com/)
2. Sube tus imágenes a Cloudinary
3. Copia la URL de la imagen
4. En el formulario de productos, **deja vacío el campo de archivo** y pega la URL en "URL de Imagen"

**Ejemplo de URL:**
```
https://res.cloudinary.com/tu-cuenta/image/upload/v123456/productos/pan.jpg
```

### Opción 2: Imgur (Simple y Rápido)

1. Ve a [Imgur](https://imgur.com/)
2. Sube tu imagen (no necesitas cuenta)
3. Haz clic derecho en la imagen → "Copiar dirección de imagen"
4. Pega la URL en "URL de Imagen"

**Ejemplo de URL:**
```
https://i.imgur.com/ABCD123.jpg
```

### Opción 3: Vercel Blob Storage (Avanzado)

Si quieres subir archivos directamente en producción, necesitas configurar Vercel Blob:

1. En tu proyecto de Vercel, ve a Storage
2. Crea un Blob Store
3. Instala el paquete:
```bash
npm install @vercel/blob
```

4. Modifica el código para usar Vercel Blob en lugar de sistema de archivos local

## Instrucciones para el formulario

### ✅ CORRECTO en Producción:
1. **No selecciones ningún archivo** en "Subir Imagen"
2. Sube tu imagen a Cloudinary o Imgur
3. Copia la URL de la imagen
4. Pega la URL en el campo "URL de Imagen"
5. Guarda el producto

### ❌ INCORRECTO en Producción:
1. ~~Seleccionar un archivo local~~
2. ~~Intentar subir desde tu computadora~~

## Mensajes de Error

Si intentas subir un archivo en producción, verás este error:

```
Error: En producción, use una URL externa para la imagen.
El sistema de archivos es de solo lectura.

Sugerencia: Sube la imagen a un servicio como Cloudinary,
Imgur o similares, y usa la URL en el campo 'URL de Imagen'
```

## Servicios recomendados para alojar imágenes

| Servicio | Gratuito | Fácil | Límites |
|----------|----------|-------|---------|
| **Cloudinary** | ✅ Sí | ⭐⭐⭐ | 25 GB/mes |
| **Imgur** | ✅ Sí | ⭐⭐⭐⭐⭐ | Ilimitado (con límites de velocidad) |
| **ImageKit** | ✅ Sí | ⭐⭐⭐ | 20 GB/mes |
| **ImgBB** | ✅ Sí | ⭐⭐⭐⭐ | Ilimitado |

## Notas Importantes

- ⚠️ Las URLs deben ser públicas (accesibles sin autenticación)
- ⚠️ Asegúrate de que las URLs terminen en `.jpg`, `.png`, `.webp`, etc.
- ⚠️ Las URLs deben usar HTTPS (no HTTP)
- ✅ Puedes usar la misma URL para múltiples productos si la imagen es la misma

## Ejemplo Completo

```
1. Ir a https://imgur.com/upload
2. Seleccionar imagen del producto (ej: pan.jpg)
3. Subir imagen
4. Clic derecho → "Copy image address"
5. URL copiada: https://i.imgur.com/xyz123.jpg
6. En el formulario de producto:
   - Subir Imagen: [dejar vacío]
   - URL de Imagen: https://i.imgur.com/xyz123.jpg
7. Guardar producto
```

## Desarrollo vs Producción

| Característica | Desarrollo | Producción |
|----------------|------------|------------|
| Subir archivo local | ✅ Sí | ❌ No |
| Usar URL externa | ✅ Sí | ✅ Sí |
| Almacenamiento | Sistema de archivos | Solo URLs |
| Directorio uploads | ✅ Funciona | ❌ Read-only |
