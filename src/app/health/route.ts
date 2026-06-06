// Liveness probe for Traefik + the container HEALTHCHECK.
// Intentionally does not touch the database: it answers "is the Next.js server
// up and serving?", which is what the rolling-deploy healthcheck gates on.
// Keep it dynamic so it is never statically cached.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok" });
}
