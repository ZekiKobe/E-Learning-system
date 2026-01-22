import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  const stored = window.localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  const prefersLight = window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: light)').matches;

  return prefersLight ? 'light' : 'dark';
};

export const useThemeStore = create<ThemeState>((set) => {
  const initial = getInitialTheme();

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = initial;
  }

  return {
    theme: initial,
    setTheme: (theme: Theme) => {
      set({ theme });
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem('theme', theme);
      }
    },
    toggleTheme: () => {
      set((state) => {
        const next: Theme = state.theme === 'dark' ? 'light' : 'dark';
        if (typeof document !== 'undefined') {
          document.documentElement.dataset.theme = next;
          window.localStorage.setItem('theme', next);
        }
        return { theme: next };
      });
    },
  };
});


