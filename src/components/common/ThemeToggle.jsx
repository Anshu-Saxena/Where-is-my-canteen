import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle colour theme"
      className={`w-9 h-9 grid place-items-center rounded-xl bg-white dark:bg-brandCard-dark border border-brandBorder-light dark:border-brandBorder-dark text-brandText-secondary dark:text-brandText-darkSecondary hover:border-sage-300 hover:text-forest dark:hover:text-cream transition-colors shadow-subtle ${className}`}
      title={isDark ? 'Switch to warm cream' : 'Switch to charcoal night'}
    >
      {isDark ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-forest" />}
    </button>
  );
}
