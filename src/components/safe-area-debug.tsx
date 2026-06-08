"use client";

import { useEffect, useRef, useState } from "react";

/**
 * TEMPORARY diagnostic overlay for the iOS PWA bottom-nav gap bug.
 * Measures every candidate height resolution AND the nav's real rendered
 * position so we can see exactly which value is correct and where the gap is.
 * Remove once diagnosed.
 */
export function SafeAreaDebug() {
  const svhRef = useRef<HTMLDivElement>(null);
  const dvhRef = useRef<HTMLDivElement>(null);
  const lvhRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let raf = 0;
    function px(el: HTMLDivElement | null) {
      return el ? Math.round(el.getBoundingClientRect().height) : -1;
    }
    function read() {
      const vv = window.visualViewport;
      const nav = document.querySelector("nav");
      const navRect = nav?.getBoundingClientRect();
      const navPadBottom = nav
        ? getComputedStyle(nav).paddingBottom
        : "?";
      const screenH = window.screen.height;
      const navBottom = navRect ? Math.round(navRect.bottom) : -1;

      setLines([
        `screenH:   ${screenH}`,
        `innerH:    ${window.innerHeight}`,
        `vv.height: ${vv ? Math.round(vv.height) : "n/a"}`,
        `docClientH:${document.documentElement.clientHeight}`,
        `--- units ---`,
        `100svh: ${px(svhRef.current)}`,
        `100dvh: ${px(dvhRef.current)}`,
        `100lvh: ${px(lvhRef.current)}`,
        `100%:   ${px(pctRef.current)}`,
        `--- nav ---`,
        `nav.top:    ${navRect ? Math.round(navRect.top) : -1}`,
        `nav.bottom: ${navBottom}`,
        `nav.padBot: ${navPadBottom}`,
        `gap(screen-navBot): ${screenH - navBottom}`,
        `gap(inner-navBot):  ${window.innerHeight - navBottom}`,
      ]);
      raf = requestAnimationFrame(read);
    }
    raf = requestAnimationFrame(read);
    return () => cancelAnimationFrame(raf);
  }, []);

  const probe = {
    position: "fixed" as const,
    width: 0,
    top: 0,
    pointerEvents: "none" as const,
    opacity: 0,
  };

  return (
    <>
      <div ref={svhRef} style={{ ...probe, height: "100svh" }} />
      <div ref={dvhRef} style={{ ...probe, height: "100dvh" }} />
      <div ref={lvhRef} style={{ ...probe, height: "100lvh" }} />
      <div ref={pctRef} style={{ ...probe, height: "100%" }} />
      <div
        style={{
          position: "fixed",
          top: 56,
          left: 8,
          zIndex: 9999,
          padding: "6px 8px",
          borderRadius: 6,
          background: "rgba(255,0,80,0.9)",
          color: "white",
          font: "11px/1.35 monospace",
          pointerEvents: "none",
          whiteSpace: "pre",
        }}
      >
        {lines.join("\n")}
      </div>
    </>
  );
}
