import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/tokens";

// Öffentlich erreichbar: Login-Seite, Login-API und der per CRON_SECRET geschützte Cron-Job.
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/cron/"];

// Schnelle Prüfung ohne Datenbank: Signatur, Ablauf und Rolle.
// Termin-Ende und gelöschte Gäste erkennt die Serverprüfung (requireUser bzw. die Chat-Seite).
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Ändernde API-Aufrufe nur von der eigenen Seite (Schutz vor untergeschobenen Formularen).
  if (pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method) && foreignOrigin(request)) {
    return NextResponse.json({ error: "Anfrage von einer fremden Seite abgelehnt." }, { status: 403 });
  }
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const isApi = pathname.startsWith("/api/");
  if (!session) {
    if (isApi) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });
    return redirectToLogin(request, pathname.startsWith("/admin") ? "admin" : null);
  }

  const adminArea = pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/");
  if (adminArea && session.role !== "admin") {
    if (isApi) return NextResponse.json({ error: "Dieser Bereich ist nur für die Kursleitung." }, { status: 403 });
    return redirectToLogin(request, "admin");
  }
  return NextResponse.next();
}

function foreignOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== (request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
  } catch {
    // z. B. „null“ aus abgeschotteten Artefakten
    return true;
  }
}

function redirectToLogin(request: NextRequest, next: "admin" | null) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = next ? `?weiter=${next}` : "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.png|apple-icon.png|stefanai-logo.png|favicon.ico|robots.txt).*)"],
};
