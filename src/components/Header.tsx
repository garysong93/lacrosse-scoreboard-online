import { useState, useEffect } from 'react';
import { MobileDrawer } from './MobileDrawer';

interface HeaderProps {
  showNav?: boolean;
}

export function Header({ showNav = true }: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const navLinks = [
    { href: '/', label: 'Scoreboard' },
    { href: '/rules', label: 'Lacrosse Rules' },
    { href: '/tutorial', label: 'How to Use' },
    { href: '/faq', label: 'FAQ' },
  ];

  return (
    <>
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-light)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-xl sm:text-2xl">🥍</span>
            <span className="font-bold text-sm sm:text-lg text-[var(--text-primary)] truncate">
              Lacrosse Scoreboard
            </span>
          </a>

          {/* Desktop navigation */}
          {showNav && (
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[var(--accent-blue)] ${
                    currentPath === link.href
                      ? 'text-[var(--accent-blue)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Mobile hamburger menu button */}
          {showNav && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden p-3 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
