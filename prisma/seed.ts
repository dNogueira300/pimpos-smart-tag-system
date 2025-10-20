import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

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

  console.log("👤 Usuario administrador creado:", admin.username);

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

  console.log("📦 Categorías creadas:", categories.length);

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

  console.log("⚙️ Configuraciones del sistema creadas:", systemConfigs.length);

  // Crear algunos productos de ejemplo
  const panaderiaCategory = await prisma.category.findUnique({
    where: { name: "Panadería" },
  });

  const abarrotesCategory = await prisma.category.findUnique({
    where: { name: "Abarrotes" },
  });

  if (panaderiaCategory && abarrotesCategory) {
    const exampleProducts = [
      {
        name: "Pan Integral de Molde",
        description:
          "Pan integral fresco del día, ideal para desayunos saludables",
        code: "PAN-001",
        price: 4.5,
        categoryId: panaderiaCategory.id,
        createdById: admin.id,
        isPerishable: true,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días
        ingredients: "Harina integral, agua, levadura, sal, aceite de oliva",
        servingSize: "1 rebanada (30g)",
        calories: 80,
        totalFat: 1.5,
        saturatedFat: 0.3,
        sodium: 150,
        totalCarbs: 15,
        dietaryFiber: 3,
        sugars: 2,
        protein: 3,
        highSodium: false,
        highSugar: false,
        highSatFat: false,
        highTransFat: false,
      },
      {
        name: "Croissant de Mantequilla",
        description: "Croissant artesanal con mantequilla francesa",
        code: "PAN-002",
        price: 3.0,
        categoryId: panaderiaCategory.id,
        createdById: admin.id,
        isPerishable: true,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días
        ingredients:
          "Harina, mantequilla, huevos, leche, azúcar, levadura, sal",
        servingSize: "1 unidad (70g)",
        calories: 270,
        totalFat: 15,
        saturatedFat: 9,
        sodium: 200,
        totalCarbs: 28,
        sugars: 4,
        protein: 6,
        highSodium: false,
        highSugar: false,
        highSatFat: true, // Alto en grasas saturadas
        highTransFat: false,
      },
      {
        name: "Arroz Extra Superior 1kg",
        description: "Arroz de grano largo, extra superior",
        code: "ABA-001",
        price: 5.2,
        categoryId: abarrotesCategory.id,
        createdById: admin.id,
        isPerishable: false,
        ingredients: "Arroz",
        servingSize: "100g",
        calories: 365,
        totalCarbs: 79,
        protein: 7,
        totalFat: 0.6,
        sodium: 1,
        highSodium: false,
        highSugar: false,
        highSatFat: false,
        highTransFat: false,
      },
    ];

    for (const productData of exampleProducts) {
      await prisma.product.create({
        data: productData,
      });
    }

    console.log("🥖 Productos de ejemplo creados:", exampleProducts.length);
  }

  console.log("✅ Seed completado exitosamente!");
  console.log("\n📋 Credenciales de acceso:");
  console.log("Usuario: admin");
  console.log("Contraseña: admin123");
  console.log("URL: http://localhost:3000/admin/login");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error en el seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
