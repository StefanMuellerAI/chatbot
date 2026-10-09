import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, USER_COOKIE, verifyAdmin, verifyUser } from "@/lib/auth/tokens";

// Öffentlich erreichbar: Login-Seite, Login-API und der per CRON_SECRET geschützte Cron-Job.
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/cron/"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Admin-Bereich: eigene Anmeldung. Die Seite /admin zeigt selbst das Login-Formular.
  if (pathname.startsWith("/api/admin/")) {
    if (pathname === "/api/admin/login") return NextResponse.next();
    const admin = await verifyAdmin(request.cookies.get(ADMIN_COOKIE)?.value);
    if (!admin) return NextResponse.json({ error: "Admin-Anmeldung erforderlich." }, { status: 401 });
    return NextResponse.next();
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  const user = await verifyUser(request.cookies.get(USER_COOKIE)?.value);
  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.png|apple-icon.png|stefanai-logo.png|favicon.ico|robots.txt).*)"],
};
