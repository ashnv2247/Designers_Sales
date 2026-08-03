import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { HeartIcon } from "@/components/Icons";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-images";
import { ImageWithSkeleton } from "@/components/Skeleton";
import { useSession } from "@/lib/use-session";
import { getUserWishlist, toggleWishlist } from "@/lib/wishlist.functions";
import { formatCurrency, resolveProductPrice } from "@/lib/sale-pricing";

interface SaleProductCardProps {
  product: any;
}

export function SaleProductCard({ product }: SaleProductCardProps) {
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
    user &&
    product.id &&
    wishlistItems.some(
      (item: any) => item.product?.id === product.id || item.product?.slug === product.id,
    ),
  );

  const wishlistMutation = useMutation({
    mutationFn: () => toggleWishlistFn({ data: { productIdOrSlug: String(product.id) } }),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: ["user-wishlist"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update wishlist"),
  });

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info("Please sign in to save pieces to your wishlist", {
        action: { label: "Sign in", onClick: () => navigate({ to: "/auth" }) },
      });
      return;
    }
    if (!product.id || wishlistMutation.isPending) return;
    wishlistMutation.mutate();
  };

  // Resolve multi-layered prices
  const priceDetails = resolveProductPrice({
    originalPrice: product.original_price,
    currentPrice: product.discounted_price ?? product.original_price,
    currency: product.currency || "AUD",
    sales: product.saleRelations || [],
  });

  const {
    originalPrice,
    currentPrice,
    effectivePrice,
    effectiveDiscountPercentage,
    hasActiveSale,
    hasProductDiscount,
  } = priceDetails;

  const originalStr = formatCurrency(originalPrice, product.currency);
  const currentStr = formatCurrency(currentPrice, product.currency);
  const effectiveStr = formatCurrency(effectivePrice, product.currency);
  const savedAmount = originalPrice - effectivePrice;

  // Stock Urgency Text
  let urgencyText = "";
  if (product.stock === 0) {
    urgencyText = "Sold Out";
  } else if (product.stock === 1) {
    urgencyText = "Only 1 Left";
  } else if (product.stock > 0 && product.stock <= 3) {
    urgencyText = `Only ${product.stock} Left`;
  } else if (product.stock > 3 && product.stock <= 5) {
    urgencyText = "Selling Fast";
  }

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group relative flex flex-col justify-between h-full bg-background border border-gold/15 hover:border-gold/60 p-4 transition-all duration-300 shadow-md hover:shadow-lg rounded-sm"
    >
      <div className="relative aspect-[3/4] bg-cream overflow-hidden">
        {/* Product Image */}
        <ImageWithSkeleton
          src={getCloudinaryImageUrl(product.image, "card")}
          alt={product.alt || product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1000ms] ease-luxe group-hover:scale-104"
        />

        {/* High-Contrast Discount Badge */}
        {effectiveDiscountPercentage > 0 && (
          <span className="absolute left-2.5 top-2.5 bg-burgundy border border-gold/30 text-gold text-[0.55rem] font-bold tracking-[0.2em] px-2.5 py-1 shadow-md uppercase">
            {effectiveDiscountPercentage}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          disabled={wishlistMutation.isPending}
          onClick={handleWishlist}
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-300 hover:bg-background cursor-pointer rounded-full shadow-sm hover:scale-105"
        >
          <HeartIcon
            className={`h-4 w-4 transition-all duration-300 ${
              saved
                ? "scale-110 fill-burgundy text-burgundy"
                : "text-foreground hover:text-burgundy"
            }`}
          />
        </button>

        {/* Quick View Drawer */}
        <div className="pointer-events-none absolute inset-x-2.5 bottom-2.5 translate-y-2 opacity-0 transition-all duration-300 ease-luxe group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 z-10">
          <button className="w-full bg-background/95 py-2.5 text-[0.55rem] uppercase tracking-[0.2em] font-bold backdrop-blur-md transition-colors duration-300 hover:bg-black hover:text-ivory cursor-pointer shadow-md">
            Quick view
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="mt-4 flex flex-col justify-between flex-grow">
        <div>
          <p className="text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-1">
            {product.designer}
          </p>
          <h3 className="font-serif text-sm leading-snug text-ink group-hover:text-gold transition-colors duration-300 line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* Pricing Layout */}
        <div className="mt-3 pt-3 border-t border-border/30 flex flex-col justify-end">
          <div className="flex items-baseline justify-between w-full">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                {/* Final Active Sale Price */}
                <span className="text-base font-bold text-burgundy">{effectiveStr}</span>

                {/* Original Price (muted strikethrough) */}
                {originalPrice > effectivePrice && (
                  <span className="text-xs text-muted-foreground/75 line-through decoration-muted-foreground/50">
                    {originalStr}
                  </span>
                )}
              </div>

              {/* Previous Discounted Price (if needed) */}
              {hasActiveSale && hasProductDiscount && currentPrice > effectivePrice && (
                <span className="text-[0.6rem] text-muted-foreground font-medium mt-0.5">
                  Was: <span className="line-through">{currentStr}</span>
                </span>
              )}
            </div>

            {/* Urgency Badge */}
            {urgencyText && (
              <span
                className={`text-[0.6rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-sm ${
                  product.stock === 0
                    ? "bg-stone text-muted-foreground"
                    : "bg-burgundy/10 text-burgundy"
                }`}
              >
                {urgencyText}
              </span>
            )}
          </div>

          {/* Savings amount display */}
          {savedAmount > 0 && (
            <span className="text-[0.62rem] text-forest font-semibold tracking-wide mt-1.5 self-start">
              Save {formatCurrency(savedAmount, product.currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
