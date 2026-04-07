import { create } from 'zustand';
import { getCustomBox } from '../services/customBoxService';

const useCartStore = create((set) => ({
  cartCount: 0,
  cartTotal: 0,
  loadingCart: false,

  loadCartSummary: async () => {
    try {
      set({ loadingCart: true });

      const box = await getCustomBox();
      const items = Array.isArray(box?.items) ? box.items : [];

      const count = items.reduce((acc, item) => acc + (item.quantity || 0), 0);

      set({
        cartCount: count,
        cartTotal: box?.total || 0,
      });
    } catch (error) {
      console.log('LOAD CART SUMMARY ERROR:', error?.response?.data || error.message);
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