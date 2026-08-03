interface SaleTickerProps {
  text?: string;
  speedClass?: string;
}

export function SaleTicker({
  text = "UP TO 70% OFF • LIMITED STOCK • DESIGNER CLEARANCE • NEW MARKDOWNS • SHOP BEFORE IT'S GONE",
  speedClass = "animate-[marquee_20s_linear_infinite]",
}: SaleTickerProps) {
  // Duplicate text to create a seamless looping effect
  const items = Array(8).fill(text);

  return (
    <div
      className="w-full overflow-hidden bg-gold text-ink py-3 border-y border-ink/10 select-none"
      aria-label="Promotional ticker"
    >
      <div className="relative flex max-w-full overflow-hidden">
        {/* Animated Marquee Container */}
        <div
          className={`flex gap-8 whitespace-nowrap will-change-transform motion-reduce:animate-none hover:[animation-play-state:paused] ${speedClass}`}
        >
          {items.map((t, idx) => (
            <span
              key={idx}
              className="text-[0.68rem] font-bold uppercase tracking-[0.25em] flex items-center gap-8"
              aria-hidden={idx > 0 ? "true" : "false"}
            >
              <span>{t}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
