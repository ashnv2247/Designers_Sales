import { useEffect, useRef, useState, type ReactNode } from "react";

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
export function Reveal({ children, className = "", delay = 0, variant = "fade", id }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  if (variant === "mask") {
    return (
      <div ref={ref} id={id} className={className}>
        <div
          data-visible={visible}
          style={{ transitionDelay: `${delay}ms` }}
          className="veil-reveal h-full w-full"
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      id={id}
      data-visible={visible}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${className}`}
    >
      {children}
    </div>
  );
}
