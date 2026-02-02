export function WhyChooseSection() {
  const points = [
    {
      title: 'Complete lacrosse features',
      desc: 'Score tracking, game timer, shot clock, penalties, faceoffs, and player statistics - everything you need for a professional lacrosse game.'
    },
    {
      title: 'Works offline',
      desc: "After loading once, the scoreboard works completely offline. Your game data is saved locally and syncs when you're back online."
    },
    {
      title: 'Live streaming support',
      desc: 'Built-in OBS overlay with transparent background. Perfect for streaming games on YouTube, Twitch, or any platform.'
    },
    {
      title: 'Multiple rule sets',
      desc: 'Pre-configured rules for NCAA, MLL/PLL professional, high school, and youth lacrosse. Or customize your own settings.'
    },
  ];

  return (
    <section className="py-16 bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-[var(--bg-secondary)] rounded-2xl p-8 md:p-12 shadow-lg">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4 text-center">
            Why choose our Lacrosse Scoreboard?
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 text-center max-w-2xl mx-auto text-sm">
            Our lacrosse scoreboard is a powerful, free online application designed specifically for lacrosse games. It's flexible, easy to use, and meets all your scoring needs.
          </p>

          <div className="space-y-4">
            {points.map((point, index) => (
              <div key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] text-sm">{point.title}</h4>
                  <p className="text-[var(--text-secondary)] mt-0.5 text-sm">{point.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
