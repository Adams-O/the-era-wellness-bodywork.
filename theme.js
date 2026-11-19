(() => {
  const root = document.documentElement;
  const mediaQuery = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  function getSavedTheme() {
    try {
      const saved = localStorage.getItem('era-theme');
      return saved === 'light' || saved === 'dark' ? saved : null;
    } catch (error) {
      console.warn('Theme preference could not be read from local storage.', error);
      return null;
    }
  }

  function updateToggleLabels(theme) {
    document.querySelectorAll('.theme-toggle').forEach((button) => {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';
      button.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
      button.setAttribute('title', `Switch to ${nextTheme} mode`);
      button.setAttribute('aria-pressed', String(theme === 'dark'));
    });
  }

  function applyTheme(theme, persist = false) {
    root.dataset.theme = theme;
    root.dataset.bsTheme = theme;
    updateToggleLabels(theme);

    if (persist) {
      try {
        localStorage.setItem('era-theme', theme);
      } catch (error) {
        console.error('Theme preference could not be saved.', error);
      }
    }
  }

  applyTheme(getSavedTheme() || (mediaQuery && mediaQuery.matches ? 'dark' : 'light'));

  function initializeThemeToggles() {
    document.querySelectorAll('.theme-toggle').forEach((button) => {
      button.addEventListener('click', () => {
        const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme, true);
      });
    });
    updateToggleLabels(root.dataset.theme);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeThemeToggles, { once: true });
  } else {
    initializeThemeToggles();
  }

  if (mediaQuery) {
    const handleSystemThemeChange = (event) => {
      if (!getSavedTheme()) applyTheme(event.matches ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemThemeChange);
    }
  }
})();
