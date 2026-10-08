import Image from "next/image";
import { cn } from "./cn";

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-grid shrink-0 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5", className)}
      style={{ width: size, height: size }}
    >
      <Image src="/icon.png" alt="" width={Math.round(size * 0.72)} height={Math.round(size * 0.72)} priority />
    </span>
  );
}

export function Logo({ className, subtitle = true }: { className?: string; subtitle?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={34} />
      <span className="flex flex-col leading-none">
        <span className="font-brand text-[1.45rem] leading-none tracking-tight">Freebie</span>
        {subtitle && <span className="mt-1 text-[0.68rem] font-medium uppercase tracking-[0.14em] opacity-60">by StefanAI</span>}
      </span>
    </span>
  );
}
