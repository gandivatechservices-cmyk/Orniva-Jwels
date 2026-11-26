/**
 * Global content for empty / error screens (cart, wishlist, orders...).
 * Use with <EmptyState preset="cart" />; any prop passed to the component overrides the preset.
 */

export type EmptyStateIconName = "bag" | "heart" | "orders" | "search" | "user" | "alert" | "diamond";

export type EmptyStatePreset = {
  icon: EmptyStateIconName;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export const EMPTY_STATE_PRESETS = {
  cart: {
    icon: "bag",
    title: "Your jewellery cart is empty",
    description: "Explore our certified fine jewellery and add your favourite pieces to your cart.",
    actionLabel: "Explore Collections",
    actionHref: "/products",
    secondaryLabel: "View Wishlist",
    secondaryHref: "/wishlist",
  },
  wishlist: {
    icon: "heart",
    title: "Your jewellery wishlist is empty",
    description: "Tap the heart on any piece you love and it will be saved here for later.",
    actionLabel: "Explore Collections",
    actionHref: "/products",
    secondaryLabel: "View Cart",
    secondaryHref: "/cart",
  },
  wishlistSignIn: {
    icon: "user",
    title: "Sign in to view your wishlist",
    description: "Sign in to your account to access your saved jewellery pieces on any device.",
    actionLabel: "Sign In",
  },
  orders: {
    icon: "orders",
    title: "No jewellery orders yet",
    description: "You haven't placed any orders yet. Explore our handcrafted collections today.",
    actionLabel: "Explore Collections",
    actionHref: "/products",
  },
  search: {
    icon: "search",
    title: "No pieces found",
    description: "We couldn't find anything matching your search. Try a different word or browse our collections.",
    actionLabel: "Browse Collections",
    actionHref: "/categories",
  },
  error: {
    icon: "alert",
    title: "Something went wrong",
    description: "We couldn't load this right now. Please try again.",
    actionLabel: "Try Again",
  },
  generic: {
    icon: "diamond",
    title: "Nothing here yet",
    description: "There is nothing to show at the moment.",
  },
} as const satisfies Record<string, EmptyStatePreset>;

export type EmptyStatePresetName = keyof typeof EMPTY_STATE_PRESETS;
