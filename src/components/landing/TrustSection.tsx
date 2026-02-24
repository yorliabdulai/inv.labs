// DESIGN CONSTRAINTS — DO NOT VIOLATE
// ✗ No glowing cards
// ✗ No gradient text
// ✗ No counting animations

const testimonials = [
  { quote: "Before inv.labs, investing felt like gambling. Now I understand what I'm doing.", name: "Kwame", age: 26, city: "Kumasi" },
  { quote: "Ato answered questions I was too embarrassed to ask my banker.", name: "Ama", age: 23, city: "Takoradi" },
  { quote: "I practiced for two months, then opened a real brokerage account with confidence.", name: "Kofi", age: 29, city: "Accra" },
];

const TrustSection = () => {
  return (
    <section className="relative py-20 md:py-28 bg-ink-900">
      <div className="px-6 md:px-12 lg:px-20 max-w-5xl">
        <div className="flex items-baseline gap-4 mb-6 border-b border-border/10 pb-4">
          <p className="section-label font-mono text-ink-muted">Trusted</p>
        </div>

        <h2 className="font-serif text-3xl md:text-4xl text-paper-text mb-12 leading-tight">
          43% of Gen Z have no investments.<br />
          <span className="text-terracotta">We're changing that.</span>
        </h2>

        {/* Metrics — inline, not cards */}
        <div className="flex flex-wrap gap-x-12 gap-y-4 mb-16 font-mono text-sm">
          <div>
            <span className="text-paper-text text-2xl font-medium tabular-nums">400+</span>
            <span className="text-ink-muted ml-2">Waitlist</span>
          </div>
          <div>
            <span className="text-paper-text text-2xl font-medium tabular-nums">4.8/5.0</span>
            <span className="text-ink-muted ml-2">Beta Rating</span>
          </div>
          <div>
            <span className="text-paper-text text-2xl font-medium">Joy FM · Citi News</span>
            <span className="text-ink-muted ml-2">Featured In</span>
          </div>
        </div>

        {/* Testimonials — ruled list, not floating cards */}
        <div>
          {testimonials.map((t, i) => (
            <div key={i} className="py-6 border-t border-border/10">
              <p className="text-paper-text/80 text-base leading-relaxed max-w-lg mb-3 font-serif italic">
                "{t.quote}"
              </p>
              <p className="text-terracotta text-sm font-medium">
                — {t.name}, {t.age}, {t.city}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
