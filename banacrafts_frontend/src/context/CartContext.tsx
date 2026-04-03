import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/data/products";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ============================================================
// DEMO ONLY: Unavailable product for testing availability UI
// This product ID does NOT exist in products.ts, so it will
// appear as "Unavailable" in Cart/Wishlist. Remove after demo.
// ============================================================
const DEMO_UNAVAILABLE_PRODUCT: Product = {
  id: "demo-deleted-999",
  name: "Vintage Kalamkari Wall Hanging (DEMO - Deleted by Seller)",
  description: "This product was removed by the seller and is used for demo purposes.",
  price: 2500,
  image: "/placeholder.svg",
  images: ["/placeholder.svg"],
  category: "Home Decor",
  material: "Cotton",
  tags: ["Demo", "Unavailable"],
  artisanId: "1",
  inStock: true,
  isReturnable: false,
  rating: 4.5,
  reviews: 0,
  returnPolicy: "No return available",
};

// Set to true to inject demo unavailable items into cart/wishlist
const ENABLE_DEMO_UNAVAILABLE = true;
// ============================================================

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("banacrafts_cart");
    const storedWishlist = localStorage.getItem("banacrafts_wishlist");
    
    let parsedCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];
    let parsedWishlist: Product[] = storedWishlist ? JSON.parse(storedWishlist) : [];

    // DEMO: Inject unavailable product if not already present
    if (ENABLE_DEMO_UNAVAILABLE) {
      const demoInCart = parsedCart.some(item => item.product.id === DEMO_UNAVAILABLE_PRODUCT.id);
      const demoInWishlist = parsedWishlist.some(p => p.id === DEMO_UNAVAILABLE_PRODUCT.id);
      
      if (!demoInCart) {
        parsedCart = [...parsedCart, { product: DEMO_UNAVAILABLE_PRODUCT, quantity: 1 }];
      }
      if (!demoInWishlist) {
        parsedWishlist = [...parsedWishlist, DEMO_UNAVAILABLE_PRODUCT];
      }
    }

    setItems(parsedCart);
    setWishlist(parsedWishlist);
  }, []);

  useEffect(() => {
    localStorage.setItem("banacrafts_cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("banacrafts_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const addToWishlist = (product: Product) => {
    if (!wishlist.find((p) => p.id === product.id)) {
      setWishlist((prev) => [...prev, product]);
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
