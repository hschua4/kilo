import { renderAppIcon } from "@/lib/pwa-icon";

// 512px PWA icon referenced by the web app manifest (used for the install
// prompt and as the maskable/adaptive icon). Statically generated at build
// time and served as a PNG.
export const dynamic = "force-static";

export function GET() {
  return renderAppIcon(512);
}
