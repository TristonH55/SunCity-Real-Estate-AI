"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  extra?: { infoText?: string | null; brochureUrl?: string | null };
};

const isImage = (url: string) => /\.(png|jpe?g|webp|gif)$/i.test(url.split("?")[0]);

/**
 * "More Info!" link for a Step-3 add-on, shown next to the Yes/No buttons.
 * On desktop hover it previews the brochure image (rendered at 50% of its real
 * pixel size) via a portal so it can't be clipped behind later cards; clicking
 * opens the full file. Renders nothing without infoText or a brochureUrl.
 */
export default function ExtraInfo({ extra }: Props) {
  const [hover, setHover] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  if (!extra || (!extra.infoText && !extra.brochureUrl)) return null;

  const showPreview = hover && !!extra.brochureUrl && isImage(extra.brochureUrl);

  const onEnter = () => {
    const r = anchorRef.current?.getBoundingClientRect();
    if (r) setPos({ left: r.left, top: r.bottom + 8 });
    setHover(true);
  };

  // Clamp the fixed popup so the (50%-scale) image stays on screen.
  let previewStyle: React.CSSProperties = {};
  if (showPreview && pos && typeof window !== "undefined") {
    const w = dims ? dims.w * 0.5 : 360;
    const h = dims ? dims.h * 0.5 : 360;
    previewStyle = {
      position: "fixed",
      left: Math.max(8, Math.min(pos.left, window.innerWidth - w - 16)),
      top: Math.max(8, Math.min(pos.top, window.innerHeight - h - 16)),
      zIndex: 9999,
    };
  }

  return (
    <span className="relative inline-flex items-center gap-3 text-xs">
      {extra.brochureUrl && (
        <span onMouseEnter={onEnter} onMouseLeave={() => setHover(false)}>
          <a
            ref={anchorRef}
            href={extra.brochureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sky-300 hover:text-sky-200 underline whitespace-nowrap"
          >
            More Info!
          </a>
        </span>
      )}

      {extra.infoText && (
        <button
          type="button"
          onClick={() => setOpenInfo((o) => !o)}
          className="text-sky-300 hover:text-sky-200 underline whitespace-nowrap"
        >
          {openInfo ? "Hide info" : "ⓘ Info"}
        </button>
      )}
      {openInfo && extra.infoText && (
        <span className="absolute left-0 top-6 z-40 max-w-xs rounded-lg border border-white/10 bg-[#0d1220] p-2 text-slate-300 shadow-xl">
          {extra.infoText}
        </span>
      )}

      {showPreview &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="pointer-events-none" style={previewStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={extra.brochureUrl!}
              alt=""
              onLoad={(e) => {
                const img = e.currentTarget;
                setDims({ w: img.naturalWidth, h: img.naturalHeight });
              }}
              style={dims ? { width: dims.w * 0.5, height: dims.h * 0.5 } : undefined}
              className="max-h-[85vh] max-w-[90vw] rounded-lg border border-white/20 bg-white shadow-2xl"
            />
          </div>,
          document.body
        )}
    </span>
  );
}
