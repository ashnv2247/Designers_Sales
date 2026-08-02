type P = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export const SearchIcon = ({ className }: P) => (
  <svg {...base} className={className} width="20" height="20" aria-hidden>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </svg>
);

export const HeartIcon = ({ className }: P) => (
  <svg {...base} className={className} width="20" height="20" aria-hidden>
    <path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />
  </svg>
);

export const BagIcon = ({ className }: P) => (
  <svg {...base} className={className} width="20" height="20" aria-hidden>
    <path d="M5 7h14l-1 13H6L5 7z" />
    <path d="M9 9V6a3 3 0 0 1 6 0v3" />
  </svg>
);

export const MenuIcon = ({ className }: P) => (
  <svg {...base} className={className} width="20" height="20" aria-hidden>
    <path d="M3 8h18M3 16h18" />
  </svg>
);

export const CloseIcon = ({ className }: P) => (
  <svg {...base} className={className} width="20" height="20" aria-hidden>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const ArrowRight = ({ className }: P) => (
  <svg {...base} className={className} width="16" height="16" aria-hidden>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);

export const MapPinIcon = ({ className }: P) => (
  <svg {...base} className={className} width="20" height="20" aria-hidden>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const TagIcon = ({ className }: P) => (
  <svg {...base} className={className} width="20" height="20" aria-hidden>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

export const CalendarIcon = ({ className }: P) => (
  <svg {...base} className={className} width="20" height="20" aria-hidden>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const SparklesIcon = ({ className }: P) => (
  <svg {...base} className={className} width="20" height="20" aria-hidden>
    <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
  </svg>
);
