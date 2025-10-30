/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚠️ SOLUCIÓN RÁPIDA: Desactivar optimización de imágenes completamente
  images: {
    unoptimized: true,
    domains: ["localhost", "pimpos-system.vercel.app"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // CAMBIO 1:
  // "serverComponentsExternalPackages" se movió fuera de "experimental"
  // y ahora se llama "serverExternalPackages".
  serverExternalPackages: ["@prisma/client", "bcryptjs"],

  // El bloque "experimental: { ... }" se eliminó porque ya estaba vacío.

  // Configuración mínima para Vercel
  ...(process.env.NODE_ENV === "production" && {
    output: "standalone",
  }),

  // CAMBIO 2:
  // Se eliminó todo el bloque "webpack: (config, { isServer }) => { ... }"
  // 1. Porque estás usando --turbopack (que ignora esta configuración).
  // 2. Porque "serverExternalPackages" (arriba) ya hace lo que
  //    intentabas hacer en el bloque de webpack.
};

module.exports = nextConfig;
