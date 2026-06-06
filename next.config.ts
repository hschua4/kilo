import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Better Auth and the Prisma client are server-only and ship their own
  // module graph (kysely, pg, etc.). Let Node resolve them at runtime instead
  // of bundling them, which avoids cross-version export mismatches.
  serverExternalPackages: [
    "better-auth",
    "@better-auth/kysely-adapter",
    "@prisma/adapter-pg",
    "@prisma/client",
  ],
};

export default nextConfig;
