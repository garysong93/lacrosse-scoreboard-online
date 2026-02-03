import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['General', 'Features', 'Technical', 'Streaming'];

  const faqs: FAQItem[] = [
    {
      category: 'General',
      question: 'Is this scoreboard really free?',
      answer: 'Yes, 100% free! No ads, no subscriptions, no hidden fees. The app is open source and will always remain free.',
    },
    {
      category: 'General',
      question: 'Do I need to create an account?',
      answer: 'No account required. Just open the app and start scoring. Your game data is saved locally in your browser.',
    },
    {
      category: 'General',
      question: 'What lacrosse rules are supported?',
      answer: 'We support NCAA (men\'s and women\'s), PLL/MLL professional, high school (NFHS), and youth lacrosse rules. Each preset automatically configures quarter length, shot clock, and penalty options.',
    },
    {
      category: 'General',
      question: 'Can I use this for youth or recreational leagues?',
      answer: 'Absolutely! You can customize the rules or use the Youth preset to set your own quarter lengths, shot clock times, and penalty options.',
    },
    {
      category: 'Features',
      question: 'How do keyboard shortcuts work?',
      answer: 'Press H for home goals, A for away goals, Space to start/stop timer, R for shot clock reset, U to undo. Press ? to see all shortcuts.',
    },
    {
      category: 'Features',
      question: 'Can I track individual player statistics?',
      answer: 'Yes! Click the Players button (👥) to add players to each team. You can then track goals, assists, and ground balls per player.',
    },
    {
      category: 'Features',
      question: 'How do penalties work?',
      answer: 'Click +PENALTY to add a penalty. Enter the player number, select the duration (30 sec, 1 min, 2 min, 3 min), and add an optional description. The penalty timer counts down automatically.',
    },
    {
      category: 'Features',
      question: 'What is the power play indicator?',
      answer: 'When one team has more players in the penalty box, the scoreboard shows a power play indicator (e.g., "5v4 - HOME POWER PLAY") to help track extra-man opportunities.',
    },
    {
      category: 'Features',
      question: 'Can I undo a mistake?',
      answer: 'Yes! Press U on your keyboard or click the UNDO button to reverse the last action. This works for goals, shots, faceoffs, and penalties.',
    },
    {
      category: 'Technical',
      question: 'Does it work offline?',
      answer: 'Yes! This is a PWA (Progressive Web App) that works fully offline. Install it on your device for the best experience - it will work even with no internet.',
    },
    {
      category: 'Technical',
      question: 'How do I install it on my phone or tablet?',
      answer: 'On iOS: Use Safari, tap Share, then "Add to Home Screen". On Android: Use Chrome, tap the menu, then "Install app" or "Add to Home Screen".',
    },
    {
      category: 'Technical',
      question: 'Will my game data be saved if I close the browser?',
      answer: 'Yes, your current game and settings are automatically saved to your browser\'s local storage. When you return, everything will be as you left it.',
    },
    {
      category: 'Technical',
      question: 'What browsers are supported?',
      answer: 'All modern browsers work great: Chrome, Firefox, Safari, Edge. For the best experience with PWA features, we recommend Chrome.',
    },
    {
      category: 'Technical',
      question: 'Can multiple people control the same scoreboard?',
      answer: 'Yes! Use the Share feature to create a room. Other devices can join as controllers or viewers. This is perfect for having a spotter help with stats.',
    },
    {
      category: 'Streaming',
      question: 'How do I add the scoreboard to OBS?',
      answer: 'Click the OBS button (🎬) to open the overlay page, or go to /obs. In OBS, add a Browser Source and paste the URL. The overlay has a transparent background.',
    },
    {
      category: 'Streaming',
      question: 'Can I customize the OBS overlay appearance?',
      answer: 'Yes! Click the Theme button (🎨) to open the overlay customizer. You can change colors, layout, and which stats to display. The overlay automatically uses your team colors.',
    },
    {
      category: 'Streaming',
      question: 'Does the OBS overlay update in real-time?',
      answer: 'Yes! Any changes you make on the main scoreboard are instantly reflected in the OBS overlay. If you\'re using the sync feature, the overlay updates from the shared room.',
    },
    {
      category: 'Streaming',
      question: 'What resolution should I use for the OBS browser source?',
      answer: 'The overlay automatically scales. A good starting point is 1920x1080, but you can resize it in OBS. The overlay is designed to look good at any resolution.',
    },
  ];

  const filteredFaqs = activeCategory === 'all'
    ? faqs
    : faqs.filter((faq) => faq.category === activeCategory);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Helmet>
        <title>Lacrosse Scoreboard FAQ | Common Questions Answered</title>
        <meta name="description" content="Frequently asked questions about our free lacrosse scoreboard. Learn about features, keyboard shortcuts, OBS streaming, offline support, and more." />
        <link rel="canonical" href="https://www.lacrossescoreboard.com/faq" />

        {/* Open Graph */}
        <meta property="og:url" content="https://www.lacrossescoreboard.com/faq" />
        <meta property="og:title" content="Lacrosse Scoreboard FAQ | Common Questions Answered" />
        <meta property="og:description" content="Frequently asked questions about our free lacrosse scoreboard. Learn about features, keyboard shortcuts, OBS streaming, offline support, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.lacrossescoreboard.com/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:url" content="https://www.lacrossescoreboard.com/faq" />
        <meta name="twitter:title" content="Lacrosse Scoreboard FAQ | Common Questions Answered" />
        <meta name="twitter:description" content="Frequently asked questions about our free lacrosse scoreboard. Learn about features, keyboard shortcuts, OBS streaming, offline support, and more." />
        <meta name="twitter:card" content="summary_large_image" />

        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-[var(--accent-blue)]">
            Everything you need to know about Lacrosse Scoreboard
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-[var(--accent-blue)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[var(--bg-hover)] transition-colors"
              >
                <span className="font-medium text-[var(--text-primary)] pr-4">
                  {faq.question}
                </span>
                <span
                  className={`text-[var(--accent-blue)] transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>

              <div className={`px-6 pb-4 ${openIndex === index ? 'block' : 'hidden'}`}>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick start CTA */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-8 py-3 bg-[var(--accent-blue)] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start Using Scoreboard
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
