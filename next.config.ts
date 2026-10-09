import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native/Wasm-Pakete nicht bündeln, sondern zur Laufzeit aus node_modules laden.
  serverExternalPackages: ["ffmpeg-static", "@electric-sql/pglite", "unpdf", "mammoth"],
  // Das ffmpeg-Binary wird nicht per import gefunden und muss explizit ins Funktions-Bundle.
  outputFileTracingIncludes: {
    "/api/transcribe/*": ["./node_modules/ffmpeg-static/ffmpeg"],
  },
  // Lokale Daten und Entwicklungsdateien gehören nie ins Funktions-Bundle.
  outputFileTracingExcludes: {
    "/*": ["./.data/**", "./tests/**", "./.git/**", "./*.tsbuildinfo", "./PLAN.md"],
  },
  experimental: {
    // Lokale Uploads laufen durch den Proxy; auf Vercel gehen Dateien direkt in Blob.
    proxyClientMaxBodySize: "200mb",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
