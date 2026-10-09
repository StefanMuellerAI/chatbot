import type { Metadata, Viewport } from "next";
import { Bree_Serif, Hanken_Grotesk, Space_Grotesk } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"] });
const space = Space_Grotesk({ variable: "--font-space", subsets: ["latin"] });
const bree = Bree_Serif({ variable: "--font-bree", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Freebie – der Schulungs-Chatbot von StefanAI",
  description:
    "Freebie ist die Spiel- und Übungsumgebung für KI-Schulungen von StefanAI: Chatten mit Claude und GPT, Dateien, Bilder, Audio und Artefakte.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0a17" },
  ],
};

// Setzt das gespeicherte Farbschema, bevor die Seite gezeichnet wird (kein Flackern).
const themeScript = `try{var t=localStorage.getItem("freebie-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={`${hanken.variable} ${space.variable} ${bree.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
