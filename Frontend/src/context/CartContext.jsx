import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

// bumped the suffix in case i ever change the cart shape and need to
// invalidate whatever old carts people have sitting in localStorage
const CART_KEY = "dn_cart_v1";

const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => loadCart());

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addToCart = (product, qty = 1) => {
    if (!product?._id) return;

    // only use the sale price if it's actually a real discount, not just
    // some leftover/bad value lower than 0 or higher than the normal price
    const unitPrice =
      product.salePrice != null &&
      Number(product.salePrice) > 0 &&
      Number(product.salePrice) < Number(product.price)
        ? Number(product.salePrice)
        : Number(product.price);

    // product objects come from a few different places (listing vs detail
    // page) so the image field isn't always named the same thing
    const image =
      (Array.isArray(product.images) && product.images[0]) ||
      product.image ||
      product.selectedImg ||
      "";

    setItems((prev) => {
      const found = prev.find((x) => x._id === product._id);
      const stock = Number(product.stockQuantity ?? 0);

      if (found) {
        // capping at available stock, but if stock is 0/unknown just
        // don't bother capping (999999 is basically "no limit")
        const newQty = Math.min((found.qty || 1) + qty, stock > 0 ? stock : 999999);
        return prev.map((x) => (x._id === product._id ? { ...x, qty: newQty } : x));
      }

      const safeQty = Math.min(qty, stock > 0 ? stock : 999999);

      return [
        ...prev,
        {
          _id: product._id,
          title: product.title,
          unitPrice,
          image,
          stockQuantity: stock,
          qty: safeQty,
        },
      ];
    });
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((x) => x._id !== id));
  };

  const updateQty = (id, qty) => {
    const q = Math.max(1, Number(qty || 1));
    setItems((prev) =>
      prev.map((x) => {
        if (x._id !== id) return x;
        const stock = Number(x.stockQuantity ?? 0);
        const newQty = stock > 0 ? Math.min(q, stock) : q;
        return { ...x, qty: newQty };
      })
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((sum, x) => sum + Number(x.unitPrice || 0) * Number(x.qty || 1), 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addToCart, removeFromCart, updateQty, clearCart, subtotal }),
    [items, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
