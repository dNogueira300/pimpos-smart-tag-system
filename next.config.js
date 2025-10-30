/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚠️ REMOVER Turbopack en producción - causa problemas en Vercel
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },

  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // ⚠️ CONFIGURACIÓN CRÍTICA: Solo standalone en producción
  ...(process.env.NODE_ENV === "production" && {
    output: "standalone",
  }),

  // Headers de seguridad
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Configuración para optimizar el build
  swcMinify: true,

  // ⚠️ CONFIGURACIÓN PARA NEXTAUTH EN VERCEL
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "/api/auth/:path*",
      },
    ];
  },

  // Configuración para evitar problemas con imports
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("@prisma/client", "bcryptjs");
    }
    return config;
  },
};

module.exports = nextConfig;
