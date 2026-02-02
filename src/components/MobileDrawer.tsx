import { useEffect } from 'react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const navLinks = [
    { href: '/', label: 'Scoreboard', icon: '🥍' },
    { href: '/rules', label: 'Lacrosse Rules', icon: '📋' },
    { href: '/tutorial', label: 'How to Use', icon: '📖' },
    { href: '/faq', label: 'FAQ', icon: '❓' },
  ];

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute top-0 right-0 h-full w-72 bg-[var(--bg-secondary)] shadow-xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-light)]">
          <span className="font-bold text-lg text-[var(--text-primary)]">
            Lacrosse Scoreboard
          </span>
          <button
            onClick={onClose}
            className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="py-4">
          {navLinks.map((link) => {
            const isActive = window.location.pathname === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 px-6 py-4 min-h-[56px] text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border-r-4 border-[var(--accent-blue)]'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
                onClick={onClose}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Additional links */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border-light)]">
          <a
            href="/obs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-4 py-3 min-h-[48px] text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors"
          >
            <span>🎬</span>
            <span>OBS Overlay</span>
          </a>
          <a
            href="/control"
            className="flex items-center gap-4 px-4 py-3 min-h-[48px] text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors"
          >
            <span>📱</span>
            <span>Mobile Control</span>
          </a>
        </div>
      </div>
    </div>
  );
}
