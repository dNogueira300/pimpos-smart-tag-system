/** @type {import('next').NextConfig} */
const nextConfig = {
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

  // PASO 1: Para 'next dev --turbopack'
  serverExternalPackages: ["@prisma/client", "bcryptjs"],

  // Configuración mínima para Vercel
  ...(process.env.NODE_ENV === "production" && {
    output: "standalone",
  }),

  // Para 'next build' (producción en Vercel)
  // Esto es VITAL para que Prisma y bcrypt funcionen en el entorno serverless.
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("@prisma/client", "bcryptjs");
    }
    return config;
  },
};

module.exports = nextConfig;
