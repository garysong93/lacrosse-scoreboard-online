import { useState, useEffect } from 'react';
import App from '../App';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { HeroBanner } from '../components/HeroBanner';
import { FeaturesSection } from '../components/FeaturesSection';
import { WhyChooseSection } from '../components/WhyChooseSection';
import { SEOContentSection } from '../components/SEOContentSection';

export function HomePage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Control body overflow based on fullscreen state
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header - hidden in fullscreen */}
      {!isFullscreen && <Header />}

      {/* Hero Banner - hidden in fullscreen, can be dismissed */}
      {!isFullscreen && <HeroBanner />}

      {/* Main scoreboard area */}
      <main className="flex-1 flex flex-col">
        <App />
      </main>

      {/* SEO content sections - hidden in fullscreen */}
      {!isFullscreen && <FeaturesSection />}
      {!isFullscreen && <WhyChooseSection />}
      {!isFullscreen && <SEOContentSection />}

      {/* Footer - hidden in fullscreen */}
      {!isFullscreen && <Footer />}
    </div>
  );
}
