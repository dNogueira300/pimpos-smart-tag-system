// lib/auth.ts - CONFIGURACIÓN CORREGIDA PARA PRODUCCIÓN
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              username: credentials.username,
              isActive: true,
            },
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Registrar login en audit log (con try/catch para no fallar login)
          try {
            await prisma.auditLog.create({
              data: {
                userId: user.id,
                action: "LOGIN",
                entity: "USER",
                newData: {
                  username: user.username,
                  loginTime: new Date().toISOString(),
                },
              },
            });
          } catch (auditError) {
            console.warn("Error registrando audit log:", auditError);
            // No fallar el login por error de audit log
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
          };
        } catch (error) {
          console.error("Error en autenticación:", error);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutos
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user }) {
      if (user?.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
          });
          return dbUser?.isActive ?? false;
        } catch (error) {
          console.error("Error verificando usuario:", error);
          return false;
        }
      }
      return false;
    },
    // CALLBACK SIMPLIFICADO PARA REDIRECTS
    async redirect({ url, baseUrl }) {
      console.log("Redirect callback:", { url, baseUrl }); // Debug

      // Si es una URL relativa, combinar con baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Si es la misma origin, permitir
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        if (urlObj.origin === baseUrlObj.origin) {
          return url;
        }
      } catch (e) {
        console.error("Error parsing URLs:", e);
      }

      // Por defecto, ir al admin
      return `${baseUrl}/admin`;
    },
  },

  // CONFIGURACIÓN DE COOKIES SIMPLIFICADA
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.callback-url"
          : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Host-next-auth.csrf-token"
          : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // USAR VARIABLE DE ENTORNO
  secret: process.env.NEXTAUTH_SECRET,

  // CONFIGURACIÓN PARA COOKIES SEGUROS EN PRODUCCIÓN
  useSecureCookies: process.env.NODE_ENV === "production",

  // Debug solo en desarrollo
  debug: process.env.NODE_ENV === "development",
};

// Declaraciones de tipos
declare module "next-auth" {
  interface User {
    username: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      username: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string;
    role: string;
  }
}
