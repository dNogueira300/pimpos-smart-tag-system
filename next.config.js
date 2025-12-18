/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Solo remotePatterns - domains está deprecado
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "pimpos-system.vercel.app",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // ✅ Turbopack config en lugar de webpack
  turbopack: {
    // Configuración para Turbopack en lugar de webpack
  },

  // ✅ Mantener para compatibilidad con Prisma/bcrypt
  serverExternalPackages: ["@prisma/client", "bcryptjs"],

  // ✅ Para Vercel deployment
  ...(process.env.NODE_ENV === "production" && {
    output: "standalone",
  }),

  // ❌ ELIMINAR - conflicta con Turbopack
  // webpack: (config, { isServer }) => {
  //   if (isServer) {
  //     config.externals.push("@prisma/client", "bcryptjs");
  //   }
  //   return config;
  // },
};

module.exports = nextConfig;
