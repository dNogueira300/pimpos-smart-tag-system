import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Middleware function - can be expanded for additional logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Proteger todas las rutas /admin excepto /admin/login
        if (req.nextUrl.pathname.startsWith("/admin")) {
          if (req.nextUrl.pathname === "/admin/login") {
            return true; // Permitir acceso al login
          }
          return !!token; // Requiere autenticación para otras rutas admin
        }
        return true; // Permitir acceso a todas las demás rutas
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
