import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  menuId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartState = {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
  addItem: (restaurantId: string, restaurantName: string, item: Omit<CartItem, "quantity">) => void;
  removeItem: (menuId: string) => void;
  setQuantity: (menuId: string, quantity: number) => void;
  clear: () => void;
  subtotal: () => number;
  totalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      items: [],

      addItem: (restaurantId, restaurantName, item) => {
        const state = get();

        if (state.restaurantId && state.restaurantId !== restaurantId && state.items.length > 0) {
          set({ restaurantId, restaurantName, items: [{ ...item, quantity: 1 }] });
          return;
        }

        const existing = state.items.find((i) => i.menuId === item.menuId);
        if (existing) {
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
            items: [...state.items, { ...item, quantity: 1 }],
          });
        }
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
        set({ items: get().items.map((i) => (i.menuId === menuId ? { ...i, quantity } : i)) });
      },

      clear: () => set({ restaurantId: null, restaurantName: null, items: [] }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "spu-skipq-cart" }
  )
);
