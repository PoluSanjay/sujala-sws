import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand?: string | null;
  image?: string | null;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, qty = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === item.productId);
        if (existing) {
          set({ items: items.map((i) => i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i) });
        } else {
          set({ items: [...items, { ...item, quantity: qty }] });
        }
      },
      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.productId !== productId) });
          return;
        }
        set({ items: get().items.map((i) => i.productId === productId ? { ...i, quantity } : i) });
      },
      removeItem: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    {
      name: "sujala-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

export function formatINR(n: number): string {
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
