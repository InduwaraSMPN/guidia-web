import { useState, useEffect } from 'react';
import { getTheme, setTheme as setThemeUtil, systemPrefersDark, listenForSystemThemeChanges } from '@/utils/theme';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem('theme') as Theme | null;

    if (storedTheme) {
      return storedTheme;
    } else if (systemPrefersDark()) {
      // If no stored theme but system prefers dark mode
      return 'dark';
    }

    // Default to light mode
    return 'light';
  });

  useEffect(() => {
    // Apply theme to document
    setThemeUtil(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    // Only apply system preference if user hasn't set a preference
    if (!localStorage.getItem('theme')) {
      const removeListener = listenForSystemThemeChanges((isDark) => {
        setThemeState(isDark ? 'dark' : 'light');
      });

      return removeListener;
    }
  }, []);

  // Function to toggle theme
  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Function to set theme explicitly
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
}

export default useTheme;
