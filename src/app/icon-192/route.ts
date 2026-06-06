import { renderAppIcon } from "@/lib/pwa-icon";

// 192px PWA icon referenced by the web app manifest. Statically generated at
// build time and served as a PNG.
export const dynamic = "force-static";

export function GET() {
  return renderAppIcon(192);
}
