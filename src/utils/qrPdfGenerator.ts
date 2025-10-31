// src/utils/qrPdfGenerator.ts
import { jsPDF } from "jspdf";
import * as QRCode from "qrcode";

export interface ProductQRData {
  id: string;
  name: string;
  code?: string;
}

const DOMAIN = "https://pimpos-system.vercel.app";
const QR_SIZE_CM = 5; // Tamaño del QR en cm
const QR_SIZE_MM = QR_SIZE_CM * 10; // Convertir a mm para jsPDF

/**
 * Genera un PDF con el código QR de un producto
 * Formato: QR arriba (5x5cm), nombre centrado debajo, icono NFC y enlace copiable
 */
export async function generateSingleProductQRPDF(
  product: ProductQRData
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Calcular posiciones centradas
  const qrX = (pageWidth - QR_SIZE_MM) / 2;
  const qrY = 30; // Margen superior

  // Generar código QR como imagen
  const productUrl = `${DOMAIN}/client/product/${product.id}`;
  const qrDataUrl = await QRCode.toDataURL(productUrl, {
    width: 500,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  // Agregar QR al PDF
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, QR_SIZE_MM, QR_SIZE_MM);

  // Agregar nombre del producto (centrado debajo del QR)
  const nameY = qrY + QR_SIZE_MM + 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const productName = product.name.length > 50
    ? product.name.substring(0, 47) + "..."
    : product.name;
  const nameWidth = doc.getTextWidth(productName);
  const nameX = (pageWidth - nameWidth) / 2;
  doc.text(productName, nameX, nameY);

  // Agregar texto "NFC" como indicador (centrado)
  const nfcY = nameY + 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const nfcText = "📱 NFC Compatible";
  const nfcWidth = doc.getTextWidth(nfcText);
  const nfcX = (pageWidth - nfcWidth) / 2;
  doc.text(nfcText, nfcX, nfcY);

  // Agregar enlace como texto copiable (centrado)
  const urlY = nfcY + 8;
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 255); // Azul para el enlace
  doc.setFont("helvetica", "normal");

  // Dividir URL si es muy larga
  const urlText = productUrl;
  const urlWidth = doc.getTextWidth(urlText);
  const urlX = (pageWidth - urlWidth) / 2;

  // Hacer el texto copiable como link
  doc.textWithLink(urlText, urlX, urlY, { url: productUrl });

  // Agregar código del producto si existe
  if (product.code) {
    const codeY = urlY + 8;
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(7);
    const codeText = `Código: ${product.code}`;
    const codeWidth = doc.getTextWidth(codeText);
    const codeX = (pageWidth - codeWidth) / 2;
    doc.text(codeText, codeX, codeY);
  }

  // Agregar footer con instrucciones
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont("helvetica", "italic");
  const instructionText = "Escanea el código QR o acerca un chip NFC para ver la información del producto";
  const instructionWidth = doc.getTextWidth(instructionText);
  const instructionX = (pageWidth - instructionWidth) / 2;
  doc.text(instructionText, instructionX, footerY);

  // Descargar el PDF
  const fileName = `QR_${product.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(fileName);
}

/**
 * Genera un PDF con múltiples códigos QR (uno por página)
 */
export async function generateMultipleProductsQRPDF(
  products: ProductQRData[]
): Promise<void> {
  if (products.length === 0) {
    throw new Error("No hay productos para generar QR");
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    // Si no es la primera página, agregar una nueva
    if (i > 0) {
      doc.addPage();
    }

    // Calcular posiciones centradas
    const qrX = (pageWidth - QR_SIZE_MM) / 2;
    const qrY = 30; // Margen superior

    // Generar código QR como imagen
    const productUrl = `${DOMAIN}/client/product/${product.id}`;
    const qrDataUrl = await QRCode.toDataURL(productUrl, {
      width: 500,
      margin: 1,
      errorCorrectionLevel: "M",
    });

    // Agregar QR al PDF
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, QR_SIZE_MM, QR_SIZE_MM);

    // Agregar nombre del producto (centrado debajo del QR)
    const nameY = qrY + QR_SIZE_MM + 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const productName = product.name.length > 50
      ? product.name.substring(0, 47) + "..."
      : product.name;
    const nameWidth = doc.getTextWidth(productName);
    const nameX = (pageWidth - nameWidth) / 2;
    doc.text(productName, nameX, nameY);

    // Agregar texto "NFC" como indicador (centrado)
    const nfcY = nameY + 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const nfcText = "📱 NFC Compatible";
    const nfcWidth = doc.getTextWidth(nfcText);
    const nfcX = (pageWidth - nfcWidth) / 2;
    doc.text(nfcText, nfcX, nfcY);

    // Agregar enlace como texto copiable (centrado)
    const urlY = nfcY + 8;
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 255); // Azul para el enlace
    doc.setFont("helvetica", "normal");

    const urlText = productUrl;
    const urlWidth = doc.getTextWidth(urlText);
    const urlX = (pageWidth - urlWidth) / 2;

    // Hacer el texto copiable como link
    doc.textWithLink(urlText, urlX, urlY, { url: productUrl });

    // Agregar código del producto si existe
    if (product.code) {
      const codeY = urlY + 8;
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(7);
      const codeText = `Código: ${product.code}`;
      const codeWidth = doc.getTextWidth(codeText);
      const codeX = (pageWidth - codeWidth) / 2;
      doc.text(codeText, codeX, codeY);
    }

    // Agregar footer con instrucciones y número de página
    const footerY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "italic");
    const instructionText = "Escanea el código QR o acerca un chip NFC para ver la información del producto";
    const instructionWidth = doc.getTextWidth(instructionText);
    const instructionX = (pageWidth - instructionWidth) / 2;
    doc.text(instructionText, instructionX, footerY);

    // Número de página
    const pageNumberText = `Página ${i + 1} de ${products.length}`;
    const pageNumberWidth = doc.getTextWidth(pageNumberText);
    const pageNumberX = (pageWidth - pageNumberWidth) / 2;
    doc.text(pageNumberText, pageNumberX, footerY + 5);
  }

  // Descargar el PDF
  const fileName = `QR_Multiple_Productos_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}

/**
 * Genera un PDF con múltiples códigos QR en formato de cuadrícula (varios por página)
 * Útil para imprimir muchos QR en una sola hoja
 */
export async function generateGridQRPDF(
  products: ProductQRData[],
  columns: number = 2,
  rows: number = 3
): Promise<void> {
  if (products.length === 0) {
    throw new Error("No hay productos para generar QR");
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  const availableWidth = pageWidth - (2 * margin);
  const availableHeight = pageHeight - (2 * margin);

  const cellWidth = availableWidth / columns;
  const cellHeight = availableHeight / rows;

  const qrSize = Math.min(QR_SIZE_MM, cellWidth - 10, cellHeight - 30);

  const itemsPerPage = columns * rows;
  let currentPage = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const positionInPage = i % itemsPerPage;

    // Si es el inicio de una nueva página (excepto la primera)
    if (positionInPage === 0 && i > 0) {
      doc.addPage();
      currentPage++;
    }

    const row = Math.floor(positionInPage / columns);
    const col = positionInPage % columns;

    const cellX = margin + (col * cellWidth);
    const cellY = margin + (row * cellHeight);

    // Generar código QR como imagen
    const productUrl = `${DOMAIN}/client/product/${product.id}`;
    const qrDataUrl = await QRCode.toDataURL(productUrl, {
      width: 400,
      margin: 1,
      errorCorrectionLevel: "M",
    });

    // Centrar QR en la celda
    const qrX = cellX + (cellWidth - qrSize) / 2;
    const qrY = cellY + 5;

    // Agregar QR
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    // Agregar nombre (truncado si es necesario)
    const nameY = qrY + qrSize + 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);

    const maxNameLength = 30;
    const productName = product.name.length > maxNameLength
      ? product.name.substring(0, maxNameLength - 3) + "..."
      : product.name;

    const nameWidth = doc.getTextWidth(productName);
    const nameX = cellX + (cellWidth - nameWidth) / 2;
    doc.text(productName, nameX, nameY);

    // Agregar icono NFC y código
    const nfcY = nameY + 4;
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const nfcText = "📱 NFC";
    const nfcWidth = doc.getTextWidth(nfcText);
    const nfcX = cellX + (cellWidth - nfcWidth) / 2;
    doc.text(nfcText, nfcX, nfcY);
  }

  // Descargar el PDF
  const fileName = `QR_Grid_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}
