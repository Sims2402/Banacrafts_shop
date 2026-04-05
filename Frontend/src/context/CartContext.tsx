import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Product } from "@/data/products";

/* ── ID helper ── */
const getProductId = (product: any): string => product._id || product.id;

/* ── Types ── */
interface CartItem {
  product: Product;
  quantity: number;
  addedAt: number; // timestamp — lets you sort by recently added
}

interface CartContextType {
  /* Cart */
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getCartItem: (productId: string) => CartItem | undefined;
  totalItems: number;
  totalPrice: number;

  /* Wishlist */
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (productId: string) => void;

  /* Recently viewed */
  recentlyViewed: Product[];
  addToRecentlyViewed: (product: Product) => void;

  /* Coupon */
  coupon: string | null;
  discount: number; // percentage e.g. 10 = 10%
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;

  /* Derived totals */
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
}

/* ── Coupon table (extend as needed) ── */
const COUPONS: Record<string, number> = {
  BANA10: 10,
  CRAFT20: 20,
  WELCOME15: 15,
};

const RECENTLY_VIEWED_LIMIT = 10;

function maxOrderQty(product: Product): number {
  if (product.quantity != null && Number.isFinite(product.quantity)) {
    return Math.max(0, Math.floor(Number(product.quantity)));
  }
  if (product.inStock === false) return 0;
  return Number.POSITIVE_INFINITY;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ════════════════════════════════════════════
   PROVIDER
════════════════════════════════════════════ */
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  /* ── Hydrate from localStorage once on mount ── */
  useEffect(() => {
    try {
      const cart     = localStorage.getItem("banacrafts_cart");
      const wl       = localStorage.getItem("banacrafts_wishlist");
      const rv       = localStorage.getItem("banacrafts_recently_viewed");
      const cpn      = localStorage.getItem("banacrafts_coupon");

      if (cart)  setItems(JSON.parse(cart));
      if (wl)    setWishlist(JSON.parse(wl));
      if (rv)    setRecentlyViewed(JSON.parse(rv));
      if (cpn) {
        const parsed = JSON.parse(cpn);
        setCoupon(parsed.code);
        setDiscount(parsed.discount);
      }
    } catch {
      // corrupted storage — start fresh
      localStorage.removeItem("banacrafts_cart");
      localStorage.removeItem("banacrafts_wishlist");
      localStorage.removeItem("banacrafts_recently_viewed");
      localStorage.removeItem("banacrafts_coupon");
    }
  }, []);

  /* ── Persist on every change ── */
  useEffect(() => {
    localStorage.setItem("banacrafts_cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("banacrafts_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("banacrafts_recently_viewed", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem("banacrafts_coupon", JSON.stringify({ code: coupon, discount }));
    } else {
      localStorage.removeItem("banacrafts_coupon");
    }
  }, [coupon, discount]);

  /* ════════════ CART ════════════ */

  const addToCart = useCallback((product: Product, quantity = 1) => {
    const cap = maxOrderQty(product);
    if (cap <= 0) return;

    setItems(prev => {
      const id = getProductId(product);
      const existing = prev.find(item => getProductId(item.product) === id);
      if (existing) {
        const next = existing.quantity + quantity;
        const clamped = Math.min(next, cap);
        return prev.map(item =>
          getProductId(item.product) === id
            ? { ...item, quantity: clamped }
            : item
        );
      }
      const initial = Math.min(quantity, cap);
      return [...prev, { product, quantity: initial, addedAt: Date.now() }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => getProductId(item.product) !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.flatMap(item => {
        if (getProductId(item.product) !== productId) return [item];
        const cap = maxOrderQty(item.product);
        const clamped = Math.min(quantity, cap);
        if (clamped <= 0) return [];
        return [{ ...item, quantity: clamped }];
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
    setDiscount(0);
  }, []);

  const isInCart = useCallback((productId: string) =>
    items.some(item => getProductId(item.product) === productId),
  [items]);

  const getCartItem = useCallback((productId: string) =>
    items.find(item => getProductId(item.product) === productId),
  [items]);

  /* ════════════ WISHLIST ════════════ */

  const addToWishlist = useCallback((product: Product) => {
    const id = getProductId(product);
    setWishlist(prev =>
      prev.find(p => getProductId(p) === id) ? prev : [...prev, product]
    );
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist(prev => prev.filter(p => getProductId(p) !== productId));
  }, []);

  const toggleWishlist = useCallback((product: Product) => {
    const id = getProductId(product);
    setWishlist(prev => {
      const exists = prev.find(p => getProductId(p) === id);
      return exists
        ? prev.filter(p => getProductId(p) !== id)
        : [...prev, product];
    });
  }, []);

  const isInWishlist = useCallback((productId: string) =>
    wishlist.some(p => getProductId(p) === productId),
  [wishlist]);

  /* Move item from wishlist straight into cart */
  const moveToCart = useCallback((productId: string) => {
    const product = wishlist.find(p => getProductId(p) === productId);
    if (!product) return;
    addToCart(product, 1);
    removeFromWishlist(productId);
  }, [wishlist, addToCart, removeFromWishlist]);

  /* ════════════ RECENTLY VIEWED ════════════ */

  const addToRecentlyViewed = useCallback((product: Product) => {
    const id = getProductId(product);
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => getProductId(p) !== id);
      return [product, ...filtered].slice(0, RECENTLY_VIEWED_LIMIT);
    });
  }, []);

  /* ════════════ COUPON ════════════ */

  const applyCoupon = useCallback((code: string): boolean => {
    const pct = COUPONS[code.toUpperCase().trim()];
    if (pct === undefined) return false;
    setCoupon(code.toUpperCase().trim());
    setDiscount(pct);
    return true;
  }, []);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setDiscount(0);
  }, []);

  /* ════════════ DERIVED TOTALS ════════════ */

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );

  const discountAmount = Math.round((subtotal * discount) / 100);

  const finalTotal = subtotal - discountAmount;

  // keep totalPrice as an alias for subtotal for backward compatibility
  const totalPrice = subtotal;

  /* ════════════ PROVIDE ════════════ */
  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getCartItem,
        totalItems,
        totalPrice,

        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        moveToCart,

        recentlyViewed,
        addToRecentlyViewed,

        coupon,
        discount,
        applyCoupon,
        removeCoupon,

        subtotal,
        discountAmount,
        finalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* ── Hook ── */
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};