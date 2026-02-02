export function FeaturesSection() {
  const features = [
    { icon: '🔗', title: 'Live Sharing', desc: 'Share real-time scores with your team' },
    { icon: '📊', title: 'Export Reports', desc: 'Download game stats & JSON data' },
    { icon: '🥍', title: 'Free Scorekeeping', desc: '100% free, no registration required' },
    { icon: '📱', title: 'Any Device', desc: 'Works on phones, tablets & desktops' },
    { icon: '📺', title: 'OBS Ready', desc: 'Built-in streaming overlay' },
  ];

  return (
    <section id="features-section" className="bg-[var(--bg-secondary)] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-8 md:gap-10">
          {features.map((feature, index) => (
            <div key={index} className="text-center w-28">
              <div className="w-14 h-14 mx-auto mb-3 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center text-2xl">
                {feature.icon}
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-1 text-sm">
                {feature.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
