import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_ITEM_QUANTITY } from "@/lib/validations/order";

export type CartItem = {
  menuId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  /** Free-text request for the kitchen, e.g. "เผ็ดน้อย". */
  note: string;
};

type CartState = {
  /** User id the persisted cart belongs to (null = guest). */
  ownerId: string | null;
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
  /** Returns false when the dish is already at MAX_ITEM_QUANTITY. */
  addItem: (restaurantId: string, restaurantName: string, item: Omit<CartItem, "quantity" | "note">) => boolean;
  removeItem: (menuId: string) => void;
  setQuantity: (menuId: string, quantity: number) => void;
  setNote: (menuId: string, note: string) => void;
  syncOwner: (userId: string | null) => void;
  clear: () => void;
  subtotal: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ownerId: null,
      restaurantId: null,
      restaurantName: null,
      items: [],

      addItem: (restaurantId, restaurantName, item) => {
        const state = get();

        if (state.restaurantId && state.restaurantId !== restaurantId && state.items.length > 0) {
          set({ restaurantId, restaurantName, items: [{ ...item, quantity: 1, note: "" }] });
          return true;
        }

        const existing = state.items.find((i) => i.menuId === item.menuId);
        if (existing) {
          if (existing.quantity >= MAX_ITEM_QUANTITY) return false;
          set({
            restaurantId,
            restaurantName,
            items: state.items.map((i) =>
              i.menuId === item.menuId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({
            restaurantId,
            restaurantName,
            items: [...state.items, { ...item, quantity: 1, note: "" }],
          });
        }
        return true;
      },

      removeItem: (menuId) => {
        const items = get().items.filter((i) => i.menuId !== menuId);
        set({ items, ...(items.length === 0 ? { restaurantId: null, restaurantName: null } : {}) });
      },

      setQuantity: (menuId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuId);
          return;
        }
        const clamped = Math.min(quantity, MAX_ITEM_QUANTITY);
        set({ items: get().items.map((i) => (i.menuId === menuId ? { ...i, quantity: clamped } : i)) });
      },

      setNote: (menuId, note) => {
        set({ items: get().items.map((i) => (i.menuId === menuId ? { ...i, note } : i)) });
      },

      // The cart lives in localStorage, which every account on this browser
      // shares — so drop it whenever it belongs to someone other than the
      // signed-in user. A guest cart (ownerId null) is adopted on login.
      syncOwner: (userId) => {
        const { ownerId } = get();
        if (ownerId === userId) return;
        if (ownerId !== null) {
          set({ ownerId: userId, restaurantId: null, restaurantName: null, items: [] });
        } else {
          set({ ownerId: userId });
        }
      },

      clear: () => set({ restaurantId: null, restaurantName: null, items: [] }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "spu-skipq-cart" }
  )
);
