import { create } from "zustand";
import { getCart } from "../services/cartService";

const useCartStore = create((set) => ({
  cartCount: 0,
  cartTotal: 0,
  loadingCart: false,

  loadCartSummary: async () => {
    try {
      set({ loadingCart: true });

      const cart = await getCart();
      const items = Array.isArray(cart?.items) ? cart.items : [];

      const count = items.reduce(
        (acc, item) => acc + Number(item.quantity || 0),
        0
      );

      set({
        cartCount: count,
        cartTotal: Number(cart?.total || 0),
      });
    } catch (error) {
      console.log(
        "LOAD CART SUMMARY ERROR:",
        error?.response?.data || error.message
      );

      set({
        cartCount: 0,
        cartTotal: 0,
      });
    } finally {
      set({ loadingCart: false });
    }
  },

  clearCartSummary: () => {
    set({
      cartCount: 0,
      cartTotal: 0,
    });
  },
}));

export default useCartStore;