import { errorResponse, requireUser } from "@/lib/auth/session";

/** Aktueller Stand der eigenen Sitzung – der Chat fragt kurz vor dem Ende nach (Termin verlängert?). */
export async function GET() {
  try {
    const session = await requireUser();
    return Response.json({
      role: session.role,
      username: session.username,
      validUntil: session.accessUntil?.toISOString() ?? null,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
