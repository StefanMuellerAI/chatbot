import { getOverview } from "@/lib/admin";
import { errorResponse, requireAdmin } from "@/lib/auth/session";

export async function GET() {
  try {
    await requireAdmin();
    return Response.json(await getOverview(), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return errorResponse(err);
  }
}
