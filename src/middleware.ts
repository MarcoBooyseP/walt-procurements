import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as any)?.role;
  
  // We consider the root page `/` as the login page.
  const isAuthPage = req.nextUrl.pathname === "/";
  const isAdminPage = req.nextUrl.pathname.startsWith("/admin");

  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/home", req.nextUrl));
    }
    return;
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  if (isAdminPage && userRole !== "ADMIN") {
    return Response.redirect(new URL("/home", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};
