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

  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },

  // Configuración mínima para Vercel

  ...(process.env.NODE_ENV === "production" && {
    output: "standalone",
  }),

  // Configuración webpack simple

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("@prisma/client", "bcryptjs");
    }

    return config;
  },
};

module.exports = nextConfig;
