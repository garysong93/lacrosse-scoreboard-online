export function Footer() {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-light)] text-[var(--text-primary)] py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🥍</span>
              <span className="font-bold">Lacrosse Scoreboard Online</span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">
              Free & Open Source Lacrosse Scoreboard
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">
                  Scoreboard
                </a>
              </li>
              <li>
                <a href="/obs" className="text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">
                  OBS Overlay
                </a>
              </li>
              <li>
                <a href="/control" className="text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">
                  Mobile Control
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/rules" className="text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">
                  Lacrosse Rules
                </a>
              </li>
              <li>
                <a href="/tutorial" className="text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">
                  How to Use
                </a>
              </li>
              <li>
                <a href="/faq" className="text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border-light)] text-center text-sm text-[var(--text-secondary)]">
          © {new Date().getFullYear()} Lacrosse Scoreboard Online. Free & Open Source.
        </div>
      </div>
    </footer>
  );
}
