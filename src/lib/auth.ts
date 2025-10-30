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

  // ⚠️ CONFIGURACIONES CRÍTICAS PARA PRODUCCIÓN
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
    // ⚠️ CALLBACK CRÍTICO PARA REDIRECTS EN PRODUCCIÓN
    async redirect({ url, baseUrl }) {
      // Permitir redirects relativos
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Permitir redirects al mismo origen
      else if (new URL(url).origin === baseUrl) return url;
      // Por defecto, redirigir al panel admin
      return `${baseUrl}/admin`;
    },
  },

  // ⚠️ CONFIGURACIÓN DE COOKIES PARA HTTPS
  cookies: {
    sessionToken: {
      name: `${
        process.env.NODE_ENV === "production" ? "__Secure-" : ""
      }next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Solo configurar domain en producción
        ...(process.env.NODE_ENV === "production" && {
          domain: ".vercel.app",
        }),
      },
    },
  },

  // Secret explícito
  secret: process.env.NEXTAUTH_SECRET,

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
