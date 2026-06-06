import { ImageResponse } from "next/og";

// The Kilo glyph — the lucide "Activity" pulse, matching the in-app logo and
// the favicon/apple-icon. Shared by the PWA manifest icon routes so every
// install surface (Android, desktop, splash) renders the same mark.
const ACTIVITY_PATH =
  "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2";

// Renders a square app icon at the given pixel size on the dark app
// background. The mark fills ~52% of the canvas so it stays inside the
// central "safe zone" platforms crop to for maskable/adaptive icons.
export function renderAppIcon(size: number) {
  const mark = Math.round(size * 0.52);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
        }}
      >
        <svg
          width={mark}
          height={mark}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fafafa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={ACTIVITY_PATH} />
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
