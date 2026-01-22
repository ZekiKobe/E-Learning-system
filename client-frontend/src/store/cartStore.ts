import { create } from 'zustand';

export interface CartItem {
  id: number;
  title: string;
  price: number;
  thumbnail?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: (() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('cart');
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  })(),
  addItem: (item) => {
    const existing = get().items;
    if (existing.some((i) => i.id === item.id)) return;
    const updated = [...existing, item];
    set({ items: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(updated));
    }
  },
  removeItem: (id) => {
    const updated = get().items.filter((i) => i.id !== id);
    set({ items: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(updated));
    }
  },
  clear: () => {
    set({ items: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
  },
}));


