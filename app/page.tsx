import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ChatApp } from "@/components/chat/ChatApp";
import { getUserSession, sessionEnd } from "@/lib/auth/session";
import { groupName } from "@/lib/events/store";
import { TEACHER } from "@/lib/shared/mail";
import type { AccountInfo } from "@/lib/shared/types";

export default async function Home({ searchParams }: { searchParams: Promise<{ ansicht?: string }> }) {
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
    mailLocal: session.role === "admin" ? TEACHER : session.username,
    groupName: session.groupId ? await groupName(session.groupId).catch(() => null) : null,
  };
  const { ansicht } = await searchParams;
  return <ChatApp account={account} initialView={ansicht === "posteingang" ? "mail" : "chat"} />;
}
