import { Helmet } from '@dr.pogodin/react-helmet';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function TutorialPage() {
  const sections = [
    {
      title: 'Getting Started',
      icon: '🚀',
      steps: [
        {
          title: 'Open the Scoreboard',
          description: 'Navigate to the main page. The scoreboard is ready to use immediately - no account required.',
        },
        {
          title: 'Set Your Teams',
          description: 'Click the Settings button to customize team names and colors. The default is HOME vs AWAY.',
        },
        {
          title: 'Choose Your Rules',
          description: 'Select NCAA, PLL, High School, or Youth rules. This automatically sets quarter length, shot clock, and penalty options.',
        },
      ],
    },
    {
      title: 'Scoring Goals',
      icon: '🥍',
      steps: [
        {
          title: 'Click to Score',
          description: 'Click on a team\'s score to add a goal. Right-click (or long-press on mobile) to remove a goal if you made a mistake.',
        },
        {
          title: 'Using Keyboard (Faster!)',
          description: 'Press H for home team goal, A for away team goal. Use Shift + H/A to remove goals.',
        },
        {
          title: 'Track Assists',
          description: 'If you\'ve added players to your roster, you can attribute goals to specific players and track assists.',
        },
      ],
    },
    {
      title: 'Managing the Timer',
      icon: '⏱️',
      steps: [
        {
          title: 'Start/Stop',
          description: 'Click the green Start button or press Spacebar to toggle the game timer.',
        },
        {
          title: 'Shot Clock',
          description: 'Click the shot clock or press R to reset it. The shot clock automatically pauses when the game timer stops.',
        },
        {
          title: 'Period Changes',
          description: 'Click "END PERIOD" to advance to the next quarter. Use "START OT" for overtime if the game is tied.',
        },
      ],
    },
    {
      title: 'Tracking Penalties',
      icon: '⚠️',
      steps: [
        {
          title: 'Add a Penalty',
          description: 'Click "+PENALTY" under a team. Enter the player number, select the duration, and optionally add a description.',
        },
        {
          title: 'Penalty Timer',
          description: 'Active penalties display with a countdown timer. They automatically clear when time expires.',
        },
        {
          title: 'Release Early',
          description: 'For releasable penalties, click the penalty to remove it if a goal is scored during the power play.',
        },
      ],
    },
    {
      title: 'Stats Tracking',
      icon: '📊',
      steps: [
        {
          title: 'Shots on Goal',
          description: 'Click "+SHOT" to track shots on goal for each team.',
        },
        {
          title: 'Faceoff Wins',
          description: 'Click "+FO WIN" after each faceoff to track which team wins possession.',
        },
        {
          title: 'Timeouts',
          description: 'Click "TIMEOUT" to use a team timeout. The count decreases automatically.',
        },
      ],
    },
    {
      title: 'Share & Sync',
      icon: '🔗',
      steps: [
        {
          title: 'Start Hosting',
          description: 'Click the Share (📡) button, then "Start Hosting" to get a 6-digit game code. Share this code with others.',
        },
        {
          title: 'Share View-Only Link',
          description: 'Copy the View-Only Link and send it to spectators. They can watch the live score without affecting the game.',
        },
        {
          title: 'Mobile Control',
          description: 'Open /control on another device with the same room code to control the scoreboard remotely.',
        },
      ],
    },
    {
      title: 'OBS Streaming',
      icon: '📺',
      steps: [
        {
          title: 'Open OBS Overlay',
          description: 'Click the OBS (🎬) button to open the streaming overlay in a new tab.',
        },
        {
          title: 'Add to OBS',
          description: 'In OBS, add a Browser Source and paste the overlay URL. The background is transparent for easy layering.',
        },
        {
          title: 'Customize Theme',
          description: 'Click the Theme (🎨) button to customize colors and layout of the OBS overlay.',
        },
      ],
    },
    {
      title: 'Export & Save',
      icon: '💾',
      steps: [
        {
          title: 'Export as JSON',
          description: 'Export the complete game data including all events and player stats as a JSON file.',
        },
        {
          title: 'Save to History',
          description: 'Save completed games to your local history to view past results.',
        },
        {
          title: 'Game Timeline',
          description: 'View a chronological timeline of all goals, penalties, and events during the game.',
        },
      ],
    },
  ];

  const keyboard = {
    title: 'Keyboard Shortcuts Reference',
    groups: [
      {
        name: 'Scoring',
        shortcuts: [
          { key: 'H', action: 'Home team goal' },
          { key: 'A', action: 'Away team goal' },
          { key: 'Shift + H/A', action: 'Remove goal' },
        ],
      },
      {
        name: 'Timer',
        shortcuts: [
          { key: 'Space', action: 'Start/Pause timer' },
          { key: 'R', action: 'Reset shot clock' },
        ],
      },
      {
        name: 'Other Controls',
        shortcuts: [
          { key: 'P', action: 'Toggle possession' },
          { key: 'U', action: 'Undo last action' },
          { key: 'F', action: 'Toggle fullscreen' },
          { key: '? or /', action: 'Show shortcuts' },
          { key: 'Escape', action: 'Close modal' },
        ],
      },
    ],
  };

  const tips = {
    title: 'Pro Tips',
    items: [
      'Practice keyboard shortcuts before the game - they\'re much faster than clicking',
      'Use fullscreen mode (press F) to eliminate distractions during the game',
      'Set up team names, colors, and players before the game starts',
      'The shot clock automatically pauses when you stop the game timer',
      'Install as a PWA for faster loading and offline reliability',
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Helmet>
        <title>How to Use Lacrosse Scoreboard | Tutorial & Quick Start Guide</title>
        <meta name="description" content="Step-by-step tutorial on how to use the free online lacrosse scoreboard. Learn scoring, timer controls, penalty tracking, stats, and OBS streaming setup." />
        <link rel="canonical" href="https://www.lacrossescoreboard.com/tutorial" />

        {/* Open Graph */}
        <meta property="og:url" content="https://www.lacrossescoreboard.com/tutorial" />
        <meta property="og:title" content="How to Use Lacrosse Scoreboard | Tutorial & Quick Start Guide" />
        <meta property="og:description" content="Step-by-step tutorial on how to use the free online lacrosse scoreboard. Learn scoring, timer controls, penalty tracking, stats, and OBS streaming setup." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.lacrossescoreboard.com/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:url" content="https://www.lacrossescoreboard.com/tutorial" />
        <meta name="twitter:title" content="How to Use Lacrosse Scoreboard | Tutorial & Quick Start Guide" />
        <meta name="twitter:description" content="Step-by-step tutorial on how to use the free online lacrosse scoreboard. Learn scoring, timer controls, penalty tracking, stats, and OBS streaming setup." />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            How to Use Lacrosse Scoreboard
          </h1>
          <p className="text-xl text-[var(--accent-blue)]">
            Complete guide to mastering the scoreboard in minutes
          </p>
        </div>

        {/* Tutorial sections */}
        {sections.map((section, sectionIndex) => (
          <section key={sectionIndex} className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
              <span className="text-3xl">{section.icon}</span>
              {section.title}
            </h2>

            <div className="space-y-4">
              {section.steps.map((step, stepIndex) => (
                <div
                  key={stepIndex}
                  className="bg-[var(--bg-secondary)] rounded-xl p-5 flex gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-[var(--accent-blue)] rounded-full flex items-center justify-center text-white font-bold">
                    {stepIndex + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                      {step.title}
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Keyboard shortcuts - Hidden on mobile */}
        <section className="mb-10 hidden md:block">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            ⌨️ {keyboard.title}
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {keyboard.groups.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="bg-[var(--bg-secondary)] rounded-xl p-4"
              >
                <h3 className="font-semibold text-[var(--accent-blue)] mb-3">
                  {group.name}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, shortcutIndex) => (
                    <div key={shortcutIndex} className="flex justify-between gap-2">
                      <kbd className="px-2 py-1 bg-[var(--bg-primary)] rounded text-xs font-mono text-[var(--accent-blue)]">
                        {shortcut.key}
                      </kbd>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {shortcut.action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pro tips */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            💡 {tips.title}
          </h2>
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <ul className="space-y-3">
              {tips.items.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-[var(--accent-green)]">✓</span>
                  <span className="text-[var(--text-primary)]">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-[var(--bg-secondary)] rounded-xl p-8">
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            Ready to start?
          </h3>
          <a
            href="/"
            className="inline-block px-8 py-3 bg-[var(--accent-blue)] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Open Scoreboard
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
