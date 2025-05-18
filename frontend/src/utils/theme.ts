/**
 * Theme utility functions
 */

/**
 * Initialize theme based on localStorage or system preference
 * This function is called in the theme-init.js script
 */
export function initializeTheme(): void {
  // Check if theme is stored in localStorage
  const storedTheme = localStorage.getItem('theme');
  
  // Apply theme based on localStorage or system preference
  if (storedTheme === 'dark' || 
      (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Set theme to light or dark
 * @param theme 'light' | 'dark'
 */
export function setTheme(theme: 'light' | 'dark'): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Store theme preference
  localStorage.setItem('theme', theme);
}

/**
 * Toggle theme between light and dark
 */
export function toggleTheme(): void {
  const isDark = document.documentElement.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
}

/**
 * Get current theme
 * @returns 'light' | 'dark'
 */
export function getTheme(): 'light' | 'dark' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Check if current theme is dark
 * @returns boolean
 */
export function isDarkTheme(): boolean {
  return document.documentElement.classList.contains('dark');
}

/**
 * Check if system prefers dark mode
 * @returns boolean
 */
export function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Listen for system theme changes
 * @param callback Function to call when system theme changes
 * @returns Function to remove the listener
 */
export function listenForSystemThemeChanges(callback: (isDark: boolean) => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const listener = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };
  
  mediaQuery.addEventListener('change', listener);
  
  // Return function to remove listener
  return () => mediaQuery.removeEventListener('change', listener);
}
