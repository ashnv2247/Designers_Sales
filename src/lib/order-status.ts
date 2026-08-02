export const ORDER_STEPS = ["confirmed", "preparing", "in_transit", "delivered"] as const;

export const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  preparing: "Preparing",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_NOTE: Record<string, string> = {
  confirmed:
    "Your order is confirmed. Our client team will be in touch with settlement details shortly.",
  preparing: "Your pieces are being authenticated and prepared in signature packaging.",
  in_transit: "On its way. Tracking details have been sent to your email.",
  delivered: "Delivered. Returns are accepted within 14 days on unworn pieces.",
  cancelled: "This order was cancelled. Nothing has been charged.",
};

export const SHIPPING_LABEL: Record<string, string> = {
  signature: "Signature delivery",
  express: "Express delivery",
  concierge: "Concierge hand delivery",
};
