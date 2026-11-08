"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Product, ProductSize } from "./types";
import { BRAND } from "./brand";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: ProductSize, quantity?: number, openDrawerAfter?: boolean) => void;
  buyNow: (product: Product, size: ProductSize, quantity?: number) => void;
  updateQuantity: (productId: string, size: ProductSize, quantity: number) => void;
  removeFromCart: (productId: string, size: ProductSize) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  totalItemsCount: number;
  subtotal: number;
  shipping: number;
  discount: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "akhil_foods_cart_v1";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
      const storedCoupon = localStorage.getItem("akhil_foods_coupon");
      if (storedCoupon === "AKHIL10") {
        setAppliedCoupon("AKHIL10");
        setDiscountPercent(10);


      }
    } catch (e) {
      console.error("Failed to load cart from storage", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to persist cart", e);
    }
  }, [items, isInitialized]);

  const addToCart = (
    product: Product,
    size: ProductSize,
    quantity: number = 1,
    openDrawerAfter: boolean = true
  ) => {
    const sizeOption = product.sizes.find((s) => s.size === size) || product.sizes[0];
    const price = sizeOption.price;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.size === size
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: product.image,
          size: size,
          price: price,
          quantity: quantity,
        },
      ];
    });

    if (openDrawerAfter) {
      setIsDrawerOpen(true);
    }
  };

  const buyNow = (product: Product, size: ProductSize, quantity: number = 1) => {
    addToCart(product, size, quantity, false);
    if (typeof window !== "undefined") {
      window.location.href = "/checkout";
    }
  };

  const updateQuantity = (productId: string, size: ProductSize, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, size: ProductSize) => {
    setItems((prev) =>
      prev.filter((item) => !(item.productId === productId && item.size === size))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setDiscountPercent(0);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem("akhil_foods_coupon");
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === "AKHIL10") {
      setAppliedCoupon("AKHIL10");
      setDiscountPercent(10);
      localStorage.setItem("akhil_foods_coupon", "AKHIL10");
      return { success: true, message: "Coupon applied! Flat 10% discount added." };





    } else {
      return { success: false, message: "Invalid coupon code. Try AKHIL10" };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountPercent(0);
    localStorage.removeItem("akhil_foods_coupon");
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Shipping calculation
  let shipping = 0;
  if (subtotal > 0) {
    if (subtotal >= BRAND.freeShippingThreshold) {
      shipping = 0;
    } else {
      shipping = BRAND.defaultShippingCost;
    }
  }

  // Discount calculation
  const discount = discountPercent > 0 ? Math.round((subtotal * discountPercent) / 100) : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        buyNow,
        updateQuantity,
        removeFromCart,
        clearCart,
        isDrawerOpen,
        setIsDrawerOpen,
        totalItemsCount,
        subtotal,
        shipping,
        discount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
