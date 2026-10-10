"use client";
import { avatarBackground } from "@/lib/client/mail";
import { mailName } from "@/lib/shared/mail";

/** Runder Avatar mit Anfangsbuchstabe und fester Farbe je Adresse. */
export function MailAvatar({ local, size = 38 }: { local: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-grid shrink-0 place-items-center rounded-full font-display font-bold text-white"
      style={{ width: size, height: size, background: avatarBackground(local), fontSize: Math.round(size * 0.42) }}
    >
      {mailName(local).charAt(0).toUpperCase()}
    </span>
  );
}
