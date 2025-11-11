import React from 'react';
import { RefreshIcon } from './icons/RefreshIcon';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border p-4 sticky top-0 z-20">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-wider">
          💻 Laptop<span className="text-muted-foreground">Finder</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
          </button>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Refresh Data"
          >
            <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
