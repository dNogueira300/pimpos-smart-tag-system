import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed de la base de datos...");

  // Crear usuario administrador por defecto
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      name: "Administrador Pimpos",
      email: "admin@pimpos.com",
      role: "admin",
    },
  });

  console.log("Usuario administrador creado:", admin.username);

  // Crear categorías por defecto
  const categories = [
    {
      name: "Panadería",
      description: "Productos de panadería fresca",
      color: "#FF8C42",
      icon: "bread-slice",
    },
    {
      name: "Abarrotes",
      description: "Productos de despensa y abarrotes",
      color: "#8B5A3C",
      icon: "package",
    },
    {
      name: "Lácteos",
      description: "Leche, quesos, yogures y derivados",
      color: "#27AE60",
      icon: "milk",
    },
    {
      name: "Bebidas",
      description: "Jugos, gaseosas, agua y bebidas",
      color: "#3498DB",
      icon: "cup",
    },
    {
      name: "Snacks",
      description: "Galletas, dulces y snacks",
      color: "#E67E22",
      icon: "cookie",
    },
    {
      name: "Frutas y Verduras",
      description: "Productos frescos",
      color: "#2ECC71",
      icon: "apple",
    },
  ];

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData,
    });
  }

  console.log("Categorías creadas:", categories.length);

  // Crear configuraciones del sistema
  const systemConfigs = [
    {
      key: "site_name",
      value: "Sistema Pimpos",
      description: "Nombre del sitio web",
      category: "general",
    },
    {
      key: "qr_logo_enabled",
      value: "true",
      description: "Incluir logo en códigos QR",
      category: "qr",
      dataType: "boolean",
    },
    {
      key: "alert_days_before_expiry",
      value: "3",
      description: "Días antes del vencimiento para mostrar alerta",
      category: "alerts",
      dataType: "number",
    },
    {
      key: "nutrition_threshold_sodium",
      value: "600",
      description: "Umbral de sodio para octágono (mg por 100g)",
      category: "nutrition",
      dataType: "number",
    },
    {
      key: "nutrition_threshold_sugar",
      value: "22.5",
      description: "Umbral de azúcar para octágono (g por 100g)",
      category: "nutrition",
      dataType: "number",
    },
    {
      key: "nutrition_threshold_sat_fat",
      value: "6",
      description: "Umbral de grasas saturadas para octágono (g por 100g)",
      category: "nutrition",
      dataType: "number",
    },
    {
      key: "nutrition_threshold_trans_fat",
      value: "0.1",
      description: "Umbral de grasas trans para octágono (g por 100g)",
      category: "nutrition",
      dataType: "number",
    },
    {
      key: "session_timeout_minutes",
      value: "30",
      description: "Tiempo de expiración de sesión admin (minutos)",
      category: "general",
      dataType: "number",
    },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  console.log("Configuraciones del sistema creadas:", systemConfigs.length);

  // --- SECCIÓN DE PRODUCTOS DE EJEMPLO ELIMINADA ---

  console.log("Seed completado exitosamente!");
  console.log("\nCredenciales de acceso:");
  console.log("Usuario: admin");
  console.log("Contraseña: admin123");
  console.log("URL: http://localhost:3000/admin/login");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error en el seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
