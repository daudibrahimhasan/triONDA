import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  accent?: string;
  credit?: boolean;
}

export default function Overlay({ open, title, onClose, children, accent = "var(--turf)", credit = true }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  // Mount the (heavy) children one frame after the shell paints so the click that
  // opens the overlay isn't blocked by the panel's first render — keeps INP low.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!open) {
      setMounted(false);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const mountId = requestAnimationFrame(() => setMounted(true));
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(mountId);
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}
         style={{ "--ov-accent": accent } as React.CSSProperties}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-head">
          <span className="overlay-title">{title}</span>
          <button ref={closeRef} className="overlay-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="overlay-body">{mounted ? children : null}</div>
        {credit && (
          <div className="overlay-foot">
            <span>© 2026 TRIONDA</span>
            <span className="foot-dot">·</span>
            <span>
              Built by{" "}
              <a href="https://www.linkedin.com/in/daudibrahimhasan" target="_blank" rel="noopener noreferrer">
                @daudibrahimhasan
              </a>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
