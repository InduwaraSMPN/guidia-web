// This script runs before the React app loads to prevent theme flashing
(function() {
  // Check if theme is stored in localStorage
  const storedTheme = localStorage.getItem('theme');

  // Apply theme based on localStorage or system preference
  if (storedTheme === 'dark' ||
      (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Listen for system preference changes if no theme is stored
  if (!storedTheme) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const listener = (e) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', listener);
  }
})();
