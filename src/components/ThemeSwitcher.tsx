import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from './icons/ThemeIcons';
import styles from './ThemeSwitcher.module.css';

type Theme = 'light' | 'dark';
const preferenceKey = 'library-hub-theme';

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#181923' : '#ffffff');
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  );
  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key !== preferenceKey && event.key !== null) return;
      const next =
        event.newValue === 'light' || event.newValue === 'dark'
          ? event.newValue
          : window.matchMedia?.('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
      applyTheme(next);
      setTheme(next);
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const label = theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro';
  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    setTheme(next);
    try {
      localStorage.setItem(preferenceKey, next);
    } catch {
      // El tema sigue funcionando cuando el navegador bloquea el almacenamiento.
    }
  }

  return (
    <button
      className={styles.toggle}
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {theme === 'light' ? <MoonIcon size={22} /> : <SunIcon size={22} />}
    </button>
  );
}
