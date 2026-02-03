import { Helmet } from 'react-helmet-async';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function RulesPage() {
  const sections = [
    {
      id: 'ncaa-mens',
      title: "NCAA Men's Lacrosse Rules",
      description: 'College lacrosse rules used in NCAA Division I, II, and III',
      rules: [
        { label: 'Game Length', value: '4 quarters × 15 minutes = 60 minutes' },
        { label: 'Shot Clock', value: '80 seconds (resets on change of possession)' },
        { label: 'Players on Field', value: '10 players per team (3 attack, 3 midfield, 3 defense, 1 goalie)' },
        { label: 'Penalty Durations', value: '30 seconds, 1 minute, 2 minutes, or 3 minutes' },
        { label: 'Timeouts', value: '2 per half, 1 in overtime' },
        { label: 'Overtime', value: 'Sudden-death periods until winner (4 minutes each)' },
        { label: 'Faceoffs', value: 'At center field after each goal and quarter start' },
      ],
    },
    {
      id: 'ncaa-womens',
      title: "NCAA Women's Lacrosse Rules",
      description: 'College women\'s lacrosse with limited contact rules',
      rules: [
        { label: 'Game Length', value: '4 quarters × 15 minutes = 60 minutes' },
        { label: 'Shot Clock', value: '90 seconds' },
        { label: 'Players on Field', value: '12 players per team (varies by formation)' },
        { label: 'Contact', value: 'Limited - stick-to-stick only, no body checking' },
        { label: 'Penalty Durations', value: 'Yellow card (2 min), Red card (ejection)' },
        { label: 'Timeouts', value: '2 per half' },
        { label: 'Draw Control', value: 'Used instead of faceoffs to start play' },
      ],
    },
    {
      id: 'pll',
      title: 'PLL/MLL Professional Rules',
      description: 'Premier Lacrosse League professional rules',
      rules: [
        { label: 'Game Length', value: '4 quarters × 12 minutes = 48 minutes' },
        { label: 'Shot Clock', value: '52 seconds' },
        { label: 'Players on Field', value: '10 players per team' },
        { label: 'Two-Point Arc', value: '16 yards from goal (2 points for shots outside)' },
        { label: 'Penalty Durations', value: '30 seconds, 1 minute, 2 minutes' },
        { label: 'Timeouts', value: '2 per half, 1 in overtime' },
        { label: 'Overtime', value: '5-minute sudden victory period' },
      ],
    },
    {
      id: 'high-school',
      title: 'High School Lacrosse Rules',
      description: 'NFHS rules used in most US high school games',
      rules: [
        { label: 'Game Length', value: '4 quarters × 12 minutes = 48 minutes (varsity)' },
        { label: 'Shot Clock', value: 'No shot clock (some states have implemented)' },
        { label: 'Players on Field', value: '10 players per team' },
        { label: 'Penalty Durations', value: '30 seconds, 1 minute, 2 minutes, or 3 minutes' },
        { label: 'Timeouts', value: '2 per half' },
        { label: 'Overtime', value: '4-minute sudden-death periods' },
        { label: 'Equipment', value: 'NOCSAE certified helmet, shoulder pads, gloves, arm guards' },
      ],
    },
    {
      id: 'youth',
      title: 'Youth Lacrosse Rules',
      description: 'Modified rules for players under 14',
      rules: [
        { label: 'Game Length', value: '4 quarters × 8-10 minutes (varies by age)' },
        { label: 'Shot Clock', value: 'No shot clock' },
        { label: 'Field Size', value: 'Smaller field dimensions for younger players' },
        { label: 'Contact', value: 'Modified checking rules by age group' },
        { label: 'Crease', value: 'Larger crease in some youth divisions' },
        { label: 'Penalties', value: 'Focus on teaching, shorter penalty times' },
        { label: 'Mercy Rule', value: 'Running clock when lead exceeds certain amount' },
      ],
    },
  ];

  const comparison = {
    title: 'Quick Comparison Table',
    headers: ['Rule', 'NCAA Men', 'NCAA Women', 'PLL', 'High School'],
    rows: [
      ['Quarter Length', '15 min', '15 min', '12 min', '12 min'],
      ['Shot Clock', '80 sec', '90 sec', '52 sec', 'None*'],
      ['Players on Field', '10', '12', '10', '10'],
      ['Body Checking', 'Yes', 'No', 'Yes', 'Yes'],
      ['Two-Point Goals', 'No', 'No', 'Yes', 'No'],
    ],
  };

  const tips = {
    title: 'Scorekeeper Tips',
    items: [
      'Always confirm the rule set and shot clock duration before the game starts',
      'Track penalty time carefully - releasable vs non-releasable penalties differ',
      'Count faceoff wins separately for each team',
      'Record goals, assists, and ground balls for player statistics',
      'Note any extra-man or man-down situations for power play tracking',
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Helmet>
        <title>Lacrosse Rules Guide | Game Format, Penalties & Equipment</title>
        <meta name="description" content="Complete guide to lacrosse rules including game format, penalties, equipment regulations. NCAA, PLL, high school, and youth lacrosse rules explained." />
        <link rel="canonical" href="https://www.lacrossescoreboard.com/rules" />

        {/* Open Graph */}
        <meta property="og:url" content="https://www.lacrossescoreboard.com/rules" />
        <meta property="og:title" content="Lacrosse Rules Guide | Game Format, Penalties & Equipment" />
        <meta property="og:description" content="Complete guide to lacrosse rules including game format, penalties, equipment regulations. NCAA, PLL, high school, and youth lacrosse rules explained." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.lacrossescoreboard.com/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:url" content="https://www.lacrossescoreboard.com/rules" />
        <meta name="twitter:title" content="Lacrosse Rules Guide | Game Format, Penalties & Equipment" />
        <meta name="twitter:description" content="Complete guide to lacrosse rules including game format, penalties, equipment regulations. NCAA, PLL, high school, and youth lacrosse rules explained." />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Lacrosse Rules Guide
          </h1>
          <p className="text-xl text-[var(--accent-blue)]">
            Complete guide to NCAA, PLL, high school, and youth lacrosse rules
          </p>
          <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto">
            Understanding the differences between lacrosse rule sets is essential for players, coaches, and scorekeepers. This guide covers the major rule variations you need to know.
          </p>
        </div>

        {/* Rule sections */}
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-12">
            <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                {section.title}
              </h2>
              <p className="text-[var(--text-secondary)] mb-6">
                {section.description}
              </p>

              <div className="grid gap-3">
                {section.rules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-[var(--border-light)] last:border-0"
                  >
                    <span className="text-[var(--text-secondary)]">
                      {rule.label}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {rule.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Comparison table */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            {comparison.title}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-[var(--accent-blue)]">
                  {comparison.headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-4 py-3 text-left text-white font-semibold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-[var(--border-light)] last:border-0"
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`px-4 py-3 ${
                          cellIndex === 0
                            ? 'text-[var(--text-secondary)]'
                            : 'text-[var(--text-primary)] font-medium'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">* Some states have implemented shot clocks for high school</p>
        </section>

        {/* Tips section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            {tips.title}
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
            Ready to keep score?
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
