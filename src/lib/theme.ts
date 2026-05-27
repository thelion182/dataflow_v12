const PREFIX = 'df-theme-';

export function getStoredTheme(userId: string): 'dark' | 'light' {
  try {
    const v = localStorage.getItem(PREFIX + userId);
    return v === 'light' ? 'light' : 'dark';
  } catch { return 'dark'; }
}

export function storeTheme(userId: string, theme: 'dark' | 'light') {
  try { localStorage.setItem(PREFIX + userId, theme); } catch {}
}

export function applyThemeToDOM(theme: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', theme);
}
