import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "fade" | "mask";
  id?: string;
}

/**
 * Scroll-triggered reveal. The observed wrapper is never clipped — the
 * animation lives on an inner layer so the IntersectionObserver always
 * sees a real box.
 */
export function Reveal({ children, className = "", id }: RevealProps) {
  return (
    <div id={id} className={className}>
      {children}
    </div>
  );
}
