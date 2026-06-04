import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      <span className="theme-toggle__track" aria-hidden>
        <span className={`theme-toggle__thumb ${isDark ? 'is-dark' : ''}`} />
      </span>
      <span className="theme-toggle__label">{isDark ? 'Claro' : 'Oscuro'}</span>
    </button>
  );
}
