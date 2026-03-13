"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Bot, User, ArrowRight } from "lucide-react";

const topics = [
  {
    label: "Money Market",
    query: "What exactly is a money market fund?",
    response: "A money market fund is a low-risk investment that pools money into short-term government securities. Think of it like a high-interest savings account that works harder for your money. Perfect for beginners looking for stability.",
  },
  {
    label: "Equity Funds",
    query: "How do equity funds work?",
    response: "Equity funds invest in stocks of companies listed on the GSE. Higher risk, but historically higher returns. It's like owning a tiny piece of MTN, GCB, and other top companies — without buying individual shares yourself.",
  },
  {
    label: "Fixed Income",
    query: "Is fixed income safe?",
    response: "Fixed income funds invest in government bonds and treasury bills. They offer highly predictable returns — think of them as lending money to the government in exchange for guaranteed interest payments over time.",
  },
  {
    label: "Balanced Funds",
    query: "Should I choose a balanced fund?",
    response: "Balanced funds mix stocks AND bonds in one package. It's the 'best of both worlds' — you get growth potential from stocks and stability from bonds. Great if you're a moderate risk taker who wants diversification.",
  },
];

const AtoSection = () => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayText, setDisplayText] = useState(topics[0].response);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelect = (idx: number) => {
    if (activeIdx === idx) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    setActiveIdx(idx);
    setDisplayText("");
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
    }, 20);
  };

  return (
    <section className="relative py-24 md:py-32 bg-white">
      <div className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 w-fit text-sm font-semibold mb-6 border border-indigo-100 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI Investment Guide</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight tracking-tight">
            Meet Ato. Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">financial copilot.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
            Ask anything about investing in Ghana. Get answers in plain language — absolutely no jargon allowed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12 items-start max-w-5xl mx-auto">
          {/* Topic selection list */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Ask Ato about</p>
            {topics.map((topic, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full text-left px-5 py-4 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-between group ${activeIdx === i
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                    : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 border shadow-sm hover:shadow"
                  }`}
              >
                <span>{topic.label}</span>
                <ArrowRight className={`w-4 h-4 transition-transform ${activeIdx === i ? "text-indigo-500" : "text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1"}`} />
              </button>
            ))}
          </div>

          {/* Chat Interface Preview */}
          <div className="glass-panel border-slate-200/60 shadow-xl rounded-[2rem] p-6 md:p-8 bg-white/80">
            {/* User message */}
            <div className="flex items-start gap-4 mb-8 justify-end">
              <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-sm shadow-sm max-w-[80%]">
                <p className="text-sm font-medium">{topics[activeIdx].query}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                <User className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Ato response */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200 shadow-sm">
                <Bot className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl rounded-tl-sm shadow-sm max-w-[90%] relative min-h-[120px]">
                <p className="text-slate-700 text-base leading-relaxed font-medium">
                  {displayText}
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-1.5 h-4 bg-indigo-500 ml-1 align-middle"
                    />
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AtoSection;
