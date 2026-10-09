import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Logo } from "@/components/ui/Logo";
import { getUserSession } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Anmelden – Freebie" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ weiter?: string; grund?: string }> }) {
  await connection();
  const { weiter, grund } = await searchParams;
  const toAdmin = weiter === "admin";
  const session = await getUserSession().catch(() => null);
  // Wer schon angemeldet ist, landet direkt im Chat – bzw. als Admin im Admin-Bereich.
  if (session && (!toAdmin || session.role === "admin")) redirect(toAdmin ? "/admin" : "/");
  const hint = toAdmin
    ? "Der Admin-Bereich ist nur für die Kursleitung. Bitte mit dem Admin-Zugang anmelden."
    : grund === "abgelaufen"
      ? "Dein Zugang ist abgelaufen."
      : null;
  let notice = "";
  try {
    notice = (await getSettings()).noticeText;
  } catch {
    notice = "";
  }
  return (
    <div className="relative grid min-h-full place-items-center overflow-hidden bg-[#0d0a17] px-4 py-10 text-white">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[#7847d6]/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-40 h-[480px] w-[480px] rounded-full bg-[#e41c68]/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-[#ff6900]/15 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo className="text-white" />
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl">
          <h1 className="font-display text-2xl font-bold">Willkommen bei Freebie</h1>
          <p className="mt-1.5 text-sm text-white/65">
            Dein KI-Assistent für die Schulung. Bitte melde dich mit Benutzername und Passwort an, die du von der Kursleitung bekommen hast.
          </p>
          {hint && (
            <p role="status" className="mt-4 rounded-xl bg-[#fcb900]/15 px-3 py-2 text-sm text-[#ffd666]">
              {hint}
            </p>
          )}
          <LoginForm toAdmin={toAdmin} />
          {notice && (
            <div className="mt-6 rounded-2xl border border-[#fcb900]/25 bg-[#fcb900]/10 p-4 text-xs leading-relaxed text-white/80">
              <span className="mb-1 block font-semibold text-[#fcb900]">Spielumgebung</span>
              {notice}
            </div>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-white/65">
          Ein Angebot von{" "}
          <a href="https://stefanai.de" className="underline hover:text-white/70" target="_blank" rel="noopener noreferrer">
            StefanAI – Research &amp; Development
          </a>
        </p>
      </div>
    </div>
  );
}
