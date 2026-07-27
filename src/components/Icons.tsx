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
