import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ChatApp } from "@/components/chat/ChatApp";
import { getUserSession, sessionEndReason } from "@/lib/auth/session";
import type { AccountInfo } from "@/lib/shared/types";

export default async function Home() {
  await connection();
  const session = await getUserSession().catch(() => null);
  // Der Proxy prüft nur das Token; ein beendeter Termin oder gelöschter Gast fällt erst hier auf.
  if (!session) redirect((await sessionEndReason()) === "abgelaufen" ? "/login?grund=abgelaufen" : "/login");
  const account: AccountInfo = {
    role: session.role,
    key: session.guestId ?? "admin",
    username: session.username,
    validUntil: session.role === "guest" ? session.expiresAt.toISOString() : null,
  };
  return <ChatApp account={account} />;
}
