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
};

export default nextConfig;
