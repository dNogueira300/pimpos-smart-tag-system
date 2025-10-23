// src/hooks/useProductOperations.ts
import { useState } from "react";
import { useToast } from "@/components/ToastContainer";

export function useProductOperations() {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const deleteProduct = async (productId: string, productName: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showSuccess(
          "Producto eliminado",
          `El producto "${productName}" se eliminó correctamente`
        );
        return { success: true };
      } else {
        const errorData = await response.json();
        showError(
          "Error al eliminar producto",
          errorData.error || "No se pudo eliminar el producto"
        );
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      showError(
        "Error de conexión",
        "No se pudo conectar con el servidor para eliminar el producto"
      );
      return { success: false, error: "Connection error" };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (productId: string, data: FormData) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        showSuccess(
          "Producto actualizado",
          "Los cambios se guardaron correctamente"
        );
        return { success: true, data: result };
      } else {
        const errorData = await response.json();
        showError(
          "Error al actualizar producto",
          errorData.error || "No se pudo actualizar el producto"
        );
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      showError("Error de conexión", "No se pudo conectar con el servidor");
      return { success: false, error: "Connection error" };
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (data: FormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        showSuccess(
          "Producto creado",
          "El nuevo producto se registró correctamente"
        );
        return { success: true, data: result };
      } else {
        const errorData = await response.json();
        showError(
          "Error al crear producto",
          errorData.error || "No se pudo crear el producto"
        );
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error("Error al crear producto:", error);
      showError("Error de conexión", "No se pudo conectar con el servidor");
      return { success: false, error: "Connection error" };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteProduct,
    updateProduct,
    createProduct,
    isLoading,
  };
}
