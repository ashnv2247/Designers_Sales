import { useEffect, useState } from "react";

interface SaleCountdownProps {
  endsAt: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function SaleCountdown({ endsAt }: SaleCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const targetTime = new Date(endsAt).getTime();

    const calculateTime = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setIsEnded(true);
        setTimeRemaining(null);
        return false;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
      return true;
    };

    // Initial calculation
    const active = calculateTime();
    if (!active) return;

    const timer = setInterval(() => {
      const active = calculateTime();
      if (!active) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  if (isEnded) {
    return (
      <div className="inline-flex items-center bg-black/30 border border-white/10 px-6 py-3 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-ivory/60">
        Campaign Has Ended
      </div>
    );
  }

  if (!timeRemaining) {
    return <div className="h-10 w-64 skeleton-shimmer bg-white/10 rounded-sm" />;
  }

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <span className="text-[0.6rem] font-bold uppercase tracking-[0.25em] text-gold mb-3">
        Sale ends in
      </span>
      <div className="flex items-center gap-3 md:gap-5 text-ivory">
        <div className="flex flex-col items-center">
          <span className="font-mono text-2xl md:text-3xl font-semibold tabular-nums">
            {formatNumber(timeRemaining.days)}
          </span>
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-ivory/60 mt-1">
            Days
          </span>
        </div>
        <span className="text-xl md:text-2xl font-light text-gold/60 -translate-y-2">:</span>
        <div className="flex flex-col items-center">
          <span className="font-mono text-2xl md:text-3xl font-semibold tabular-nums">
            {formatNumber(timeRemaining.hours)}
          </span>
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-ivory/60 mt-1">
            Hours
          </span>
        </div>
        <span className="text-xl md:text-2xl font-light text-gold/60 -translate-y-2">:</span>
        <div className="flex flex-col items-center">
          <span className="font-mono text-2xl md:text-3xl font-semibold tabular-nums">
            {formatNumber(timeRemaining.minutes)}
          </span>
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-ivory/60 mt-1">
            Mins
          </span>
        </div>
        <span className="text-xl md:text-2xl font-light text-gold/60 -translate-y-2">:</span>
        <div className="flex flex-col items-center">
          <span className="font-mono text-2xl md:text-3xl font-semibold tabular-nums">
            {formatNumber(timeRemaining.seconds)}
          </span>
          <span className="text-[0.55rem] font-bold uppercase tracking-wider text-ivory/60 mt-1">
            Secs
          </span>
        </div>
      </div>
    </div>
  );
}
