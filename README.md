# 🍞 Sistema Web de Información Productiva - Panadería Pimpos

Sistema completo de gestión de productos con códigos QR, información nutricional y control presupuestario para la Panadería y Minimarket Pimpos.

## 📋 Funcionalidades Implementadas

### ✅ Panel Administrativo

- **Dashboard principal** con estadísticas de productos
- **CRUD completo de productos** (Crear, Leer, Actualizar, Eliminar)
- **Carga de imágenes** desde equipo local o URL
- **Gestión de categorías** predefinidas
- **Información nutricional completa** por 100g
- **Cálculo automático de octágonos** de advertencia (normativa peruana)
- **Sistema de promociones** con fechas configurables
- **Control de productos perecederos** con alertas de vencimiento
- **Historial de cambios de precio**
- **Logs de auditoría** completos
- **Autenticación segura** con NextAuth
- **Vista en grilla y lista**
- **Filtros y búsqueda avanzada**
- **Paginación de resultados**

### ✅ Base de Datos

- **Esquema completo** con Prisma ORM
- **PostgreSQL** como base de datos
- **Seeders** con datos de ejemplo
- **Categorías predefinidas** según productos de Pimpos
- **Usuario administrador** por defecto

### ✅ API Endpoints

- `POST /api/admin/products` - Crear producto
- `GET /api/admin/products` - Listar productos con filtros
- `GET /api/admin/products/[id]` - Obtener producto específico
- `PUT /api/admin/products/[id]` - Actualizar producto
- `DELETE /api/admin/products/[id]` - Eliminar producto
- `GET /api/admin/categories` - Listar categorías

## 🚀 Instalación y Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` con:

```env
# Database
DATABASE_URL="tu-url-de-postgresql"
DIRECT_URL="tu-url-directa-de-postgresql"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-clave-secreta-muy-segura"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Sistema Pimpos"
```

### 3. Configurar base de datos

```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar esquema a la base de datos
npx prisma db push

# Cargar datos iniciales
npm run db:seed
```

### 4. Ejecutar el proyecto

```bash
npm run dev
```

## 👤 Credenciales de Acceso

**Usuario administrador por defecto:**

- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **URL:** http://localhost:3000/admin/login

## 📁 Estructura del Proyecto

```
pimpos-smart-tag-system/
├── src/
│   ├── app/
│   │   ├── admin/                    # Panel administrativo
│   │   │   ├── products/
│   │   │   │   ├── new/             # Crear producto
│   │   │   │   ├── list/            # Lista de productos
│   │   │   │   └── [id]/edit/       # Editar producto
│   │   │   └── login/               # Autenticación
│   │   ├── api/                     # API endpoints
│   │   │   ├── admin/products/      # CRUD productos
│   │   │   ├── admin/categories/    # Categorías
│   │   │   └── auth/               # NextAuth
│   │   └── client/                  # Vista del cliente (próximo)
│   ├── components/
│   │   ├── admin/                   # Componentes del admin
│   │   │   ├── ProductForm.tsx
│   │   │   └── product-form/        # Secciones del formulario
│   │   └── ui/                      # Componentes reutilizables
│   ├── lib/
│   │   ├── auth.ts                  # Configuración NextAuth
│   │   └── db.ts                    # Cliente Prisma
│   └── types/
│       └── product.ts               # Tipos TypeScript
├── prisma/
│   ├── schema.prisma               # Esquema de base de datos
│   └── seed.ts                     # Datos iniciales
└── public/
    └── uploads/products/           # Imágenes subidas
```

## 🎨 Paleta de Colores

El sistema utiliza la paleta oficial de Pimpos:

- **Primario:** #B55424 (Marrón Tierra)
- **Secundario:** #E37836 (Naranja Cálido)
- **Éxito:** #27AE60 (Verde)
- **Advertencia:** #F39C12 (Amarillo)
- **Peligro:** #E74C3C (Rojo)

## 📝 Cómo Usar el Sistema

### Agregar un Nuevo Producto

1. **Inicia sesión** en el panel administrativo
2. Ve a **"Nuevo Producto"** o usa el botón **"+"**
3. **Completa la información básica:**

   - Nombre del producto (obligatorio)
   - Código único (obligatorio)
   - Precio (obligatorio)
   - Categoría (obligatorio)
   - Descripción (opcional)

4. **Sube una imagen:**

   - Arrastra y suelta una imagen
   - O haz clic para seleccionar desde tu equipo
   - O ingresa una URL de imagen

5. **Completa información nutricional:**

   - Todos los valores por 100g del producto
   - Los octágonos se calculan automáticamente
   - Ingredientes y alérgenos

6. **Configura promociones (opcional):**

   - Activa el checkbox de promoción
   - Define precio promocional y fechas

7. **Guarda el producto**

### Gestionar Productos Existentes

1. Ve a **"Lista de Productos"**
2. **Busca y filtra** productos por:

   - Nombre o código
   - Categoría
   - Estado (activo, por vencer, etc.)

3. **Acciones disponibles:**
   - **Editar:** Modificar información
   - **Ver:** Vista previa como cliente
   - **Eliminar:** Borrar producto

### Características Especiales

#### Octágonos de Advertencia Automáticos

El sistema calcula automáticamente los octágonos según normativa peruana:

- **Alto en Sodio:** ≥ 600mg por 100g
- **Alto en Azúcares:** ≥ 22.5g por 100g
- **Alto en Grasas Saturadas:** ≥ 6g por 100g
- **Alto en Grasas Trans:** ≥ 0.1g por 100g

#### Control de Productos Perecederos

- Alertas automáticas para productos próximos a vencer
- Indicadores visuales por días hasta vencimiento
- Filtros para identificar productos vencidos

#### Sistema de Promociones

- Precios promocionales con fechas de inicio/fin
- Cálculo automático de porcentaje de descuento
- Indicadores visuales en listados

## 🔧 Tecnologías Utilizadas

- **Frontend:** Next.js 15, React, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes
- **Base de datos:** PostgreSQL con Prisma ORM
- **Autenticación:** NextAuth.js
- **Imágenes:** Next.js Image con optimización
- **Iconos:** Lucide React

## 📊 Estructura de Base de Datos

### Tablas Principales

- **users** - Usuarios administradores
- **categories** - Categorías de productos
- **products** - Productos con información completa
- **price_history** - Historial de cambios de precio
- **audit_logs** - Logs de auditoría
- **system_config** - Configuraciones del sistema

## 🛠 Próximas Funcionalidades

### En desarrollo:

- [ ] Vista del cliente para escanear QR
- [ ] Generación automática de códigos QR
- [ ] Sistema de carrito y presupuesto
- [ ] Panel de analytics y reportes
- [ ] Exportación de datos
- [ ] API pública para clientes

### Mejoras planificadas:

- [ ] Notificaciones push para vencimientos
- [ ] Integración con sistemas de inventario
- [ ] Backup automático de base de datos
- [ ] Multi-idioma (español/inglés)
- [ ] Modo offline para cliente

## 🐛 Resolución de Problemas

### Error al subir imágenes

- Verifica que la carpeta `public/uploads/products/` tenga permisos de escritura
- Tamaño máximo: 5MB
- Formatos soportados: JPG, PNG, WEBP

### Problemas de base de datos

- Ejecuta: `npx prisma db push` para sincronizar esquema
- Para reset completo: `npx prisma migrate reset`

### Error de autenticación

- Verifica que `NEXTAUTH_SECRET` esté configurado en `.env`
- Asegúrate de que la base de datos esté accesible

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema:

- Revisa los logs de la aplicación en la consola
- Verifica la configuración de variables de entorno
- Asegúrate de que la base de datos esté funcionando

---

## 🎯 Estado del Proyecto

**FASE ACTUAL: COMPLETADA ✅**

El sistema básico de gestión de productos está **100% funcional** con:

- ✅ Panel administrativo completo
- ✅ CRUD de productos
- ✅ Carga de imágenes
- ✅ Información nutricional
- ✅ Octágonos automáticos
- ✅ Sistema de promociones
- ✅ Control de vencimientos
- ✅ Autenticación segura
- ✅ Base de datos configurada
- ✅ API endpoints funcionales

**SIGUIENTE FASE: Vista del Cliente**

- Páginas para escanear QR
- Sistema de carrito virtual
- Control presupuestario
- Experiencia de compra

El sistema está listo para usar en producción para la gestión administrativa de productos.
