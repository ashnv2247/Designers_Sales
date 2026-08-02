import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { HeartIcon } from "./Icons";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-images";
import { ImageWithSkeleton } from "./Skeleton";
import { useSession } from "@/lib/use-session";
import { getUserWishlist, toggleWishlist } from "@/lib/wishlist.functions";

export interface Product {
  id?: string;
  name: string;
  designer: string;
  price: string;
  was?: string;
  badge?: string;
  image: string;
  alt: string;
  saleInfo?: { id: string; name: string; slug: string };
  reduction?: number;
  priceValue?: number;
  stock?: number;
  colour?: string;
  size?: string;
  condition?: string;
  addedDaysAgo?: number;
}

export function ProductCard({ product }: { product: Product }) {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const getWishlist = useServerFn(getUserWishlist);
  const toggleWishlistFn = useServerFn(toggleWishlist);
  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["user-wishlist"],
    queryFn: () => getWishlist({}),
    enabled: Boolean(user),
    staleTime: 30_000,
  });
  const saved = Boolean(
    user && product.id && wishlistItems.some((item: any) => item.product?.id === product.id),
  );
  const wishlistMutation = useMutation({
    mutationFn: () =>
      toggleWishlistFn({ data: { productIdOrSlug: String(product.id) } }),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: ["user-wishlist"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update wishlist"),
  });

  const handleWishlist = () => {
    if (!user) {
      toast.info("Please sign in to save pieces to your wishlist", {
        action: { label: "Sign in", onClick: () => navigate({ to: "/auth" }) },
      });
      return;
    }
    if (!product.id || wishlistMutation.isPending) return;
    wishlistMutation.mutate();
  };

  // Parse prices for calculations
  const originalPrice = product.was ? parseInt(product.was.replace(/[^0-9]/g, "")) : 0;
  const currentPrice = parseInt(product.price.replace(/[^0-9]/g, ""));
  const savedAmount = originalPrice - currentPrice;
  const discountPercent =
    product.reduction || (originalPrice > 0 ? Math.round((savedAmount / originalPrice) * 100) : 0);

  // Determine badge styling and copy
  let badgeText = "";
  let badgeClass = "";

  if (product.stock === 0) {
    badgeText = "SOLD OUT";
    badgeClass = "bg-cream text-muted-foreground font-medium";
  } else if (product.stock === 1) {
    badgeText = "ONLY ONE LEFT";
    badgeClass = "bg-burgundy text-ivory font-medium";
  } else if (discountPercent >= 55) {
    badgeText = `${discountPercent}% OFF`;
    badgeClass = "bg-burgundy text-ivory font-semibold";
  } else if (discountPercent >= 35) {
    badgeText = "FINAL SALE";
    badgeClass = "bg-black text-ivory font-medium";
  } else if (product.stock === 2 || product.stock === 3) {
    badgeText = "SELLING FAST";
    badgeClass = "bg-champagne text-ink font-medium";
  } else if (discountPercent > 0) {
    badgeText = "NEW REDUCTION";
    badgeClass = "bg-forest text-ivory font-medium";
  } else {
    badgeText = product.badge || "NEW IN";
    badgeClass = "bg-forest text-ivory font-medium";
  }

  // Determine stock urgency text
  let stockIndicator = null;
  if (product.stock === 0) {
    stockIndicator = (
      <span className="text-[0.65rem] font-medium text-muted-foreground tracking-wider">
        Sold Out
      </span>
    );
  } else if (product.stock === 1) {
    stockIndicator = (
      <span className="text-[0.65rem] font-medium text-burgundy tracking-wider">Only 1 Left</span>
    );
  } else if (product.stock === 2 || product.stock === 3) {
    stockIndicator = (
      <span className="text-[0.65rem] font-medium text-burgundy tracking-wider">
        Only {product.stock} Left
      </span>
    );
  } else if (product.stock === 4 || product.stock === 5) {
    stockIndicator = (
      <span className="text-[0.65rem] font-medium text-forest/80 tracking-wider">Selling Fast</span>
    );
  } else if (product.stock && product.stock > 5) {
    stockIndicator = (
      <span className="text-[0.65rem] font-medium text-muted-foreground/75 tracking-wider">
        Limited Stock
      </span>
    );
  }

  return (
    <article className="group relative flex flex-col justify-between h-full bg-background transition-all duration-300">
      <div className="relative aspect-[3/4] bg-cream overflow-hidden">
        {/* Main Product Image */}
        <ImageWithSkeleton
          src={getCloudinaryImageUrl(product.image, "card")}
          alt={product.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-luxe group-hover:scale-105"
        />

        {/* Elegant Luxury Sale Badge */}
        {badgeText && (
          <span
            className={`absolute left-3 top-3 px-3 py-1.5 text-[0.55rem] tracking-[0.2em] shadow-sm uppercase ${badgeClass}`}
          >
            {badgeText}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          disabled={wishlistMutation.isPending}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleWishlist();
          }}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-300 hover:bg-background cursor-pointer rounded-full shadow-sm hover:scale-105 disabled:cursor-wait disabled:opacity-60"
        >
          <HeartIcon
            className={`h-4.5 w-4.5 transition-all duration-300 ${
              saved
                ? "scale-110 fill-burgundy text-burgundy"
                : "text-foreground hover:text-burgundy"
            }`}
          />
        </button>

        {/* Quick View Drawer/Overlay */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-500 ease-luxe group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 z-10">
          <button className="w-full bg-background/95 py-3 text-[0.6rem] uppercase tracking-[0.22em] font-medium backdrop-blur-md transition-colors duration-300 hover:bg-black hover:text-ivory cursor-pointer shadow-md">
            Quick view
          </button>
        </div>
      </div>

      {/* Info & Details */}
      <div className="mt-4 flex flex-col justify-between flex-grow">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            {product.designer}
          </p>
          <h3 className="mt-1 font-serif text-base leading-snug text-foreground/90 group-hover:text-gold transition-colors duration-300">
            {product.name}
          </h3>
        </div>

        <div className="mt-3 pt-3 border-t border-border/30 flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              {/* Current Price */}
              <span className="text-base font-semibold text-foreground">{product.price}</span>
              {/* Original Price */}
              {product.was && (
                <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/60">
                  {product.was}
                </span>
              )}
            </div>
            {/* Amount Saved (Green) */}
            {savedAmount > 0 && (
              <span className="text-[0.68rem] text-forest font-medium tracking-wide mt-0.5">
                Save ${savedAmount}
              </span>
            )}
          </div>
          {/* Stock Indicator */}
          <div className="flex items-center shrink-0">{stockIndicator}</div>
        </div>
      </div>
    </article>
  );
}
