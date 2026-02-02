import { useState } from 'react';

const STORAGE_KEY = 'lacrosseHeroBannerDismissed';

export function HeroBanner() {
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-800 via-green-700 to-green-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-xl font-bold truncate">
            Free Online Lacrosse Scoreboard
          </h1>
          <p className="text-sm text-green-200 hidden sm:block">
            Track goals, shots, penalties, and faceoffs in real-time. No registration required.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={scrollToFeatures}
            className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors whitespace-nowrap hidden md:block"
          >
            Learn more ↓
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-green-300 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
