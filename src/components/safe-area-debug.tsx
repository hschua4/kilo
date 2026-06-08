"use client";

import { useEffect, useRef, useState } from "react";

/**
 * TEMPORARY diagnostic overlay for the iOS PWA bottom-nav padding bug.
 * Shows the live values that could explain the gap so we can tell whether it's
 * a stale `env(safe-area-inset-bottom)` or an under-resolved viewport height.
 * Remove once diagnosed.
 */
export function SafeAreaDebug() {
  const probeRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let raf = 0;
    function read() {
      const probe = probeRef.current;
      const inset = probe ? getComputedStyle(probe).height : "?";
      const vv = window.visualViewport;
      setLines([
        `safe-bottom: ${inset}`,
        `innerH: ${window.innerHeight}`,
        `vv.height: ${vv ? Math.round(vv.height) : "n/a"}`,
        `vv.offTop: ${vv ? Math.round(vv.offsetTop) : "n/a"}`,
        `docClientH: ${document.documentElement.clientHeight}`,
        `screenH: ${window.screen.height}`,
        `dpr: ${window.devicePixelRatio}`,
      ]);
      raf = requestAnimationFrame(read);
    }
    raf = requestAnimationFrame(read);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/* Probe whose height resolves to the live safe-area inset. */}
      <div
        ref={probeRef}
        style={{
          position: "fixed",
          height: "env(safe-area-inset-bottom)",
          width: 0,
          pointerEvents: "none",
          opacity: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 60,
          left: 8,
          zIndex: 9999,
          padding: "6px 8px",
          borderRadius: 6,
          background: "rgba(255,0,80,0.85)",
          color: "white",
          font: "11px/1.4 monospace",
          pointerEvents: "none",
          whiteSpace: "pre",
        }}
      >
        {lines.join("\n")}
      </div>
    </>
  );
}
