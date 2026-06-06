import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained `.next/standalone` server (server.js + traced
  // node_modules) so the Docker runtime image stays minimal — no `npm install`
  // in the final stage. See node_modules/next/dist/docs/.../config/output.md.
  output: "standalone",

  // Better Auth and the Prisma client are server-only and ship their own
  // module graph (kysely, pg, etc.). Let Node resolve them at runtime instead
  // of bundling them, which avoids cross-version export mismatches.
  // Prisma 7 runs a wasm query compiler that the generated client (in
  // src/generated/prisma) loads from @prisma/client at query time via dynamic
  // import. Output-file-tracing resolves those string-literal imports, so the
  // postgres compiler ships in the standalone bundle without extra config.
  serverExternalPackages: [
    "better-auth",
    "@better-auth/kysely-adapter",
    "@prisma/adapter-pg",
    "@prisma/client",
  ],

  async headers() {
    return [
      {
        // The service worker must never be cached so clients always pick up a
        // new version, and `Service-Worker-Allowed` lets it control the root
        // scope even though it is served from /public.
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
