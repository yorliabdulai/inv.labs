// DESIGN CONSTRAINTS — DO NOT VIOLATE
// ✗ No rounded cards (max 2px)
// ✗ No gradient text
// ✗ No glowing effects
// Animation ⑤ — The Ato Cursor: blink 3 times then type

import { useState, useEffect, useRef } from "react";

const topics = [
  {
    label: "Money Market",
    response: "A money market fund is a low-risk investment that pools money into short-term government securities. Think of it like a high-interest savings account that works harder for your money. Perfect for beginners.",
  },
  {
    label: "Equity Funds",
    response: "Equity funds invest in stocks of companies listed on the GSE. Higher risk, but historically higher returns. It's like owning a tiny piece of MTN, GCB, and other top companies — without buying individual shares.",
  },
  {
    label: "Fixed Income",
    response: "Fixed income funds invest in government bonds and treasury bills. They offer predictable returns — think of them as lending money to the government in exchange for guaranteed interest payments.",
  },
  {
    label: "Balanced Funds",
    response: "Balanced funds mix stocks AND bonds in one package. It's the 'best of both worlds' — you get growth potential from stocks and stability from bonds. Great for moderate risk takers.",
  },
];

const AtoSection = () => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [displayText, setDisplayText] = useState("");
  const [cursorBlinks, setCursorBlinks] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelect = (idx: number) => {
    if (activeIdx === idx) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    setActiveIdx(idx);
    setDisplayText("");
    setIsTyping(false);
    setCursorBlinks(0);

    // Blink cursor 3 times, then type
    let blinks = 0;
    const blinkInterval = setInterval(() => {
      blinks++;
      setCursorBlinks(blinks);
      if (blinks >= 6) { // 3 full blinks = 6 transitions
        clearInterval(blinkInterval);
        // Start typing
        setIsTyping(true);
        const text = topics[idx].response;
        let i = 0;
        intervalRef.current = setInterval(() => {
          setDisplayText(text.slice(0, i + 1));
          i++;
          if (i >= text.length) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsTyping(false);
          }
        }, 16);
      }
    }, 200);
  };

  return (
    <section className="relative py-20 md:py-28 bg-paper text-ink">
      <div className="px-6 md:px-12 lg:px-20 max-w-5xl">
        <div className="flex items-baseline gap-4 mb-6 border-b-2 border-ink/10 pb-4">
          <p className="section-label font-mono text-ink-muted">AI Guide</p>
        </div>

        <h2 className="font-serif text-4xl md:text-5xl text-ink mb-3 leading-tight">
          Meet Ato.
        </h2>
        <p className="text-ink-muted text-base mb-12 max-w-md">
          Ask anything about investing. Get answers in plain language — not jargon.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
          {/* Topic buttons — hard edge */}
          <div className="space-y-2">
            {topics.map((topic, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                onMouseEnter={() => handleSelect(i)}
                className={`block w-full text-left px-4 py-3 border font-medium text-sm transition-colors duration-200 ${
                  activeIdx === i
                    ? "border-terracotta bg-terracotta text-paper"
                    : "border-ink/10 text-ink/70 hover:border-terracotta/40"
                }`}
              >
                {topic.label}
              </button>
            ))}
          </div>

          {/* Ato response — paper card */}
          <div className="paper-card border border-ink/10 p-6 min-h-[200px] bg-paper-dark">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 border border-terracotta flex items-center justify-center">
                <span className="font-serif text-terracotta text-lg italic">A</span>
              </div>
              <div>
                <p className="font-medium text-ink text-sm">Ato</p>
                <p className="text-emerald-gain text-xs font-mono">Online</p>
              </div>
            </div>
            <div className="min-h-[100px]">
              {activeIdx !== null ? (
                <p className="text-ink/80 text-sm leading-relaxed">
                  {displayText}
                  {(isTyping || cursorBlinks < 6) && (
                    <span
                      className="inline-block w-0.5 h-4 bg-terracotta ml-0.5"
                      style={{
                        opacity: isTyping ? 1 : (cursorBlinks % 2 === 0 ? 1 : 0),
                        transition: 'opacity 0.1s'
                      }}
                    />
                  )}
                </p>
              ) : (
                <p className="text-ink-muted text-sm italic">
                  Select a topic to see Ato explain it...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AtoSection;
