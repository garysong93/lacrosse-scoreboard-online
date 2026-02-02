export function SEOContentSection() {
  return (
    <section className="py-12 bg-[var(--bg-secondary)]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="prose prose-sm prose-invert max-w-none">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            The Ultimate Free Online Lacrosse Scoreboard
          </h2>

          <p className="text-[var(--text-secondary)] mb-4">
            Our lacrosse scoreboard is the perfect tool for coaches, parents, and team managers who need a reliable way to track lacrosse games. Whether you're scoring a youth league game, high school match, college competition, or professional lacrosse game, our scoreboard adapts to your needs.
          </p>

          <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-6 mb-3">
            Features for Every Level of Play
          </h3>

          <p className="text-[var(--text-secondary)] mb-4">
            From youth lacrosse to NCAA and professional MLL/PLL games, our scoreboard supports all major rule sets. Track goals, assists, shots on goal, ground balls, faceoff wins, penalties, and timeouts. The built-in shot clock automatically adjusts based on your selected rule preset.
          </p>

          <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-6 mb-3">
            Real-Time Sharing for Teams and Fans
          </h3>

          <p className="text-[var(--text-secondary)] mb-4">
            Share your game with anyone using our real-time sync feature. Create a game room and share the code with parents, fans, or remote team members. They can follow along live from any device, anywhere in the world.
          </p>

          <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-6 mb-3">
            Perfect for Live Streaming
          </h3>

          <p className="text-[var(--text-secondary)] mb-4">
            Streaming your lacrosse game on YouTube, Twitch, or Facebook? Our dedicated OBS overlay provides a professional-looking scoreboard overlay with transparent background. Simply copy the overlay URL into your streaming software and customize the appearance to match your broadcast.
          </p>

          <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-6 mb-3">
            Works Everywhere, Even Offline
          </h3>

          <p className="text-[var(--text-secondary)] mb-4">
            No internet at the field? No problem. Our Progressive Web App (PWA) technology means you can install the scoreboard on your device and use it completely offline. Your game data is automatically saved locally and can be exported when you're done.
          </p>

          <div className="mt-8 text-center">
            <a
              href="/"
              className="inline-block px-8 py-3 bg-[var(--accent-blue)] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              Start Scoring Now - It's Free!
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
