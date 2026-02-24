const footerLinks = {
  Product: ["Features", "How It Works", "Pricing", "Roadmap"],
  Company: ["About", "Contact", "Careers", "Press Kit"],
  Legal: ["Privacy", "Terms"],
};

const Footer = () => {
  return (
    <footer className="bg-ink-950 border-t border-border/10 py-14">
      <div className="px-6 md:px-12 lg:px-20 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-serif text-2xl text-terracotta italic mb-2">inv.labs</h3>
            <p className="text-ink-muted text-sm">Practice investing. Build wealth.</p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-paper-text/60 text-xs uppercase tracking-wider mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-ink-muted text-sm hover:text-terracotta transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-terracotta/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-ink-muted/50 text-xs font-mono">
            © 2026 inv.labs · Made in Ghana
          </p>
          <div className="flex items-center gap-6">
            {["Twitter", "LinkedIn", "Instagram"].map((name) => (
              <a
                key={name}
                href="#"
                className="text-ink-muted text-xs hover:text-terracotta transition-colors duration-200 font-mono uppercase tracking-wider"
              >
                {name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
