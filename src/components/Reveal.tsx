import type { ReactNode } from "react";
import { useReveal } from "../hooks";

/** Wraps a section so it slides + fades in the first time it enters the viewport. */
export default function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const { ref, shown } = useReveal();
  return (
    <div ref={ref} className={`reveal ${shown ? "in" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
