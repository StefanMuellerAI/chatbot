import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ChatApp } from "@/components/chat/ChatApp";
import { getUserSession, sessionEnd } from "@/lib/auth/session";
import type { AccountInfo } from "@/lib/shared/types";

export default async function Home() {
  await connection();
  const session = await getUserSession().catch(() => null);
  // Der Proxy prüft nur das Token; Termin-Ende oder gelöschte Gäste fallen erst hier auf.
  if (!session) {
    const end = await sessionEnd().catch(() => null);
    redirect(end ? `/login?grund=${end.reason}` : "/login");
  }
  const account: AccountInfo = {
    role: session.role,
    key: session.guestId ?? "admin",
    username: session.username,
    validUntil: session.accessUntil?.toISOString() ?? null,
  };
  return <ChatApp account={account} />;
}
