import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartLine {
  id: string;
  name: string;
  designer: string;
  image: string;
  size: string;
  colour: string;
  unitPriceCents: number;
  quantity: number;
}

interface CartValue {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (id: string, size: string, quantity: number) => void;
  remove: (id: string, size: string) => void;
  clear: () => void;
  hydrated: boolean;
}

const STORAGE_KEY = "designersale.cart.v1";

const CartContext = createContext<CartValue | null>(null);

const key = (id: string, size: string) => `${id}::${size}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable */
    }
  }, [lines, hydrated]);

  const value = useMemo<CartValue>(() => {
    return {
      lines,
      hydrated,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotalCents: lines.reduce((n, l) => n + l.unitPriceCents * l.quantity, 0),
      add: (line, quantity = 1) =>
        setLines((prev) => {
          const existing = prev.find((l) => key(l.id, l.size) === key(line.id, line.size));
          if (existing) {
            return prev.map((l) =>
              key(l.id, l.size) === key(line.id, line.size)
                ? { ...l, quantity: Math.min(9, l.quantity + quantity) }
                : l,
            );
          }
          return [...prev, { ...line, quantity }];
        }),
      setQuantity: (id, size, quantity) =>
        setLines((prev) =>
          quantity <= 0
            ? prev.filter((l) => key(l.id, l.size) !== key(id, size))
            : prev.map((l) =>
                key(l.id, l.size) === key(id, size) ? { ...l, quantity: Math.min(9, quantity) } : l,
              ),
        ),
      remove: (id, size) => setLines((prev) => prev.filter((l) => key(l.id, l.size) !== key(id, size))),
      clear: () => setLines([]),
    };
  }, [lines, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;