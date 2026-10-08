import { cookies } from "next/headers";
import { USER_COOKIE } from "@/lib/auth/tokens";

export async function POST() {
  const jar = await cookies();
  jar.delete(USER_COOKIE);
  return Response.json({ ok: true });
}
