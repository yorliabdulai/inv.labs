"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  Activity,
  Menu,
  X,
  Layers,
  Shield,
  Zap,
  Globe,
  Lock,
  ChevronDown,
  LineChart,
  BarChart4,
  Cpu,
  RefreshCcw,
  CheckCircle2,
  PieChart,
  BrainCircuit,
  Handshake,
  Bot,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
  Briefcase
} from "lucide-react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from "split-type";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
    }

    const title = new SplitType("#hero-title", { types: "words,chars" });
    const sub = new SplitType("#hero-subtitle", { types: "words" }); // Added SplitType for subtitle

    const ctx = gsap.context(() => {
      // 1. Hero Entrance with Vibrant Stagger
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.from(title.chars, {
        opacity: 0,
        y: 80,
        rotateX: -45,
        stagger: 0.015,
        duration: 2,
      })
        .from(sub.words, { // Changed to use sub.words
          opacity: 0,
          y: 40,
          stagger: 0.01, // Added stagger for words
          duration: 1.5,
        }, "-=1.5")
        .from(".hero-action", {
          opacity: 0,
          y: 30,
          stagger: 0.1,
          duration: 1.5,
        }, "-=1.2");

      // 2. Parallax Mockup
      gsap.to(".hero-visual-layer", {
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom center",
          scrub: true,
        },
        y: 100,
        scale: 0.95,
      });

      // 3. Reveal Elements
      const reveals = gsap.utils.toArray<HTMLElement>(".reveal-text");
      reveals.forEach((text) => {
        gsap.from(text, {
          scrollTrigger: {
            trigger: text,
            start: "top 90%",
          },
          opacity: 0,
          y: 40,
          duration: 1.5,
          ease: "power4.out"
        });
      });

    }, containerRef);

    return () => {
      ctx.revert();
      title.revert();
      sub.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-[#0F172A] selection:bg-[#4F46E5]/10 overflow-x-hidden font-sans">

      {/* Modern Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 lg:p-10 pointer-events-none">
        <div className="container mx-auto max-w-7xl flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute -inset-2 bg-[#4F46E5]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
              <div className="relative bg-white shadow-2xl shadow-[#4F46E5]/20 p-2.5 rounded-2xl border border-[#F1F5F9]">
                <TrendingUp className="text-[#4F46E5]" size={28} />
              </div>
            </div>
            <span className="text-2xl font-black tracking-[-0.05em] text-[#0F172A]">GSE<span className="text-[#4F46E5]">.LABS</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-2 p-1.5 bg-white/80 backdrop-blur-2xl border border-[#F1F5F9] rounded-2xl shadow-premium">
            <Link href="#hero" className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#475569] hover:text-[#0F172A] hover:bg-[#F8F9FC] rounded-xl transition-all">Portal</Link>
            <Link href="#journey" className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#475569] hover:text-[#0F172A] hover:bg-[#F8F9FC] rounded-xl transition-all">Journey</Link>
            <Link href="#terminal" className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#475569] hover:text-[#0F172A] hover:bg-[#F8F9FC] rounded-xl transition-all">Terminal</Link>
            <div className="w-[1px] h-4 bg-[#F1F5F9] mx-2" />
            <Link href="/login" className="px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#475569] hover:text-[#0F172A] transition-colors">Sign In</Link>
            <Link href="/register" className="px-7 py-2.5 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-[0.25em] rounded-xl hover:bg-[#4F46E5] transition-all shadow-xl shadow-black/10">Deploy Terminal</Link>
          </div>

          <button className="lg:hidden p-3 bg-white shadow-lg border border-[#F1F5F9] rounded-2xl text-[#0F172A]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-white z-[1999] p-10 flex flex-col justify-center gap-10 animate-fade-in">
            <Link href="/market" className="text-5xl font-black text-[#0F172A] tracking-tighter" onClick={() => setIsMobileMenuOpen(false)}>Market.</Link>
            <Link href="/learn" className="text-5xl font-black text-[#0F172A] tracking-tighter" onClick={() => setIsMobileMenuOpen(false)}>Learn.</Link>
            <Link href="/register" className="text-xl font-black text-[#4F46E5] uppercase tracking-[0.3em] mt-10" onClick={() => setIsMobileMenuOpen(false)}>Deploy Terminal →</Link>
          </div>
        )}
      </nav>

      <main>

        {/* Section 1: Hero - Theory to Practice */}
        <section id="hero" className="relative pt-32 pb-40 lg:pt-52 lg:pb-72 bg-white overflow-hidden perspective-2000">
          <div className="container mx-auto px-6 max-w-7xl relative z-10 flex flex-col lg:flex-row items-center gap-20 lg:gap-32">

            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#4F46E5]/5 border border-[#4F46E5]/10 text-[#4F46E5] text-[11px] font-black uppercase tracking-[0.25em] mb-12">
                Financial Literacy to Real-World Wealth
              </div>
              <h1 id="hero-title" className="text-huge text-[#0F172A] mb-12">
                Theory to <br className="hidden lg:block" />
                <span className="text-[#4F46E5]">Practical.</span>
              </h1>
              <p id="hero-subtitle" className="max-w-xl text-lg lg:text-2xl text-[#475569] font-medium leading-relaxed mb-16 lg:mb-20 opacity-90 mx-auto lg:mx-0">
                Bridge the gap between learning and investing. Master the GSE and Mutual Funds in a zero-risk sandbox built for students, diaspora investors, and technical learners.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-8 lg:gap-10 justify-center lg:justify-start">
                <Link href="/register" className="hero-action bg-[#0F172A] text-white px-12 py-6 rounded-3xl text-lg lg:text-2xl font-black shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:bg-[#4F46E5] hover:scale-105 transition-all group text-center inline-flex items-center">
                  Deploy Full Sandbox <ArrowRight className="inline ml-3 transition-transform group-hover:translate-x-2" size={26} />
                </Link>
                <Link href="#journey" className="hero-action text-[#475569] text-lg lg:text-2xl font-black flex items-center gap-3 hover:text-[#0F172A] transition-colors">
                  The Investor Journey <ChevronDown size={28} className="animate-bounce" />
                </Link>
              </div>
              <p className="mt-12 text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] opacity-60">
                * Educational Platform. Not Financial Advice.
              </p>
            </div>

            <div className="flex-1 relative hero-visual-layer">
              <div className="absolute -inset-10 bg-[#4F46E5]/10 blur-[150px] rounded-full" />
              <div className="relative glass-institutional p-3 rounded-[3.5rem] rotate-[-2deg] hover:rotate-0 transition-transform duration-1000 shadow-paynext">
                <img src="/mockups/trading_view.png" alt="Unified Command Center" className="rounded-[3rem] w-full h-auto shadow-sm" />

                {/* Floating Analytics Layers */}
                <div className="absolute -top-12 -right-12 parallax-layer-1 hidden lg:block">
                  <div className="glass-institutional p-8 rounded-[2.5rem] shadow-institutional border-white/50 bg-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-[#4F46E5]/10 rounded-lg text-[#4F46E5]"><Bot size={18} /></div>
                      <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Ato AI Mentor</p>
                    </div>
                    <p className="text-4xl font-black text-[#0F172A]">Knowledge</p>
                    <p className="text-[10px] font-bold text-[#4F46E5] mt-2">TECHNICAL MASTERY</p>
                  </div>
                </div>

                <div className="absolute -bottom-16 -left-12 parallax-layer-2 hidden lg:block">
                  <div className="bg-[#0F172A] p-8 rounded-[2.5rem] shadow-institutional text-white border border-white/10">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Sandbox Capital</p>
                    <p className="text-4xl font-black text-white tracking-tighter">GH₵ 100K</p>
                    <div className="h-1.5 w-full bg-white/10 rounded-full mt-6 overflow-hidden">
                      <div className="h-full w-[100%] bg-[#10B981] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Target Personas */}
        <section className="py-24 bg-white border-y border-[#F1F5F9]">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-wrap justify-between items-center gap-12 lg:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
              <div className="flex items-center gap-4">
                <GraduationCap className="text-[#4F46E5]" size={32} />
                <span className="text-xl font-black text-[#0F172A] tracking-tighter">University Students</span>
              </div>
              <div className="flex items-center gap-4">
                <Globe className="text-[#4F46E5]" size={32} />
                <span className="text-xl font-black text-[#0F172A] tracking-tighter">Diaspora Investors</span>
              </div>
              <div className="flex items-center gap-4">
                <Shield className="text-[#4F46E5]" size={32} />
                <span className="text-xl font-black text-[#0F172A] tracking-tighter">New Learners</span>
              </div>
              <div className="flex items-center gap-4">
                <Briefcase className="text-[#4F46E5]" size={32} />
                <span className="text-xl font-black text-[#0F172A] tracking-tighter">Qualified Leads</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: The Investor Journey */}
        <section id="journey" className="py-32 lg:py-60 bg-[#F8F9FC]">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-20 lg:gap-32 items-center">
              <div className="flex-1 reveal-text">
                <h2 className="text-4xl lg:text-7xl font-black text-[#0F172A] leading-[0.9] mb-12">
                  Move From Theory <br />
                  <span className="text-[#4F46E5]">To Real Wealth.</span>
                </h2>
                <p className="text-xl lg:text-2xl text-[#475569] font-medium leading-relaxed mb-12">
                  We've engineered a frictionless path for the next generation of investors.
                  Master Ghanaian markets without the risk of financial loss.
                </p>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {[
                  { icon: <GraduationCap />, title: "Literacy", desc: "Master investment theory with learning paths." },
                  { icon: <Activity />, title: "Simulation", desc: "Execute practical, risk-free trades." },
                  { icon: <ArrowUpRight />, title: "Investment", desc: "Connect to real Brokers & Managers." }
                ].map((step, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#F1F5F9] flex flex-col gap-6 group hover:border-[#4F46E5] transition-all">
                    <div className="w-14 h-14 bg-[#F8F9FC] rounded-2xl flex items-center justify-center text-[#4F46E5] group-hover:bg-[#4F46E5] group-hover:text-white transition-all">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-black text-[#0F172A]">{step.title}</h3>
                    <p className="text-sm font-medium text-[#475569] leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Unified Terminal Map (Bento) */}
        <section id="terminal" className="bg-white py-32 lg:py-60 relative">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="mb-32 lg:mb-52 reveal-text">
              <h2 className="text-4xl lg:text-[7.5rem] font-black text-[#0F172A] tracking-[-0.06em] leading-[0.9] mb-12 lg:mb-20">
                The Unified <br />
                <span className="text-[#4F46E5]">Sandbox Map.</span>
              </h2>
              <p className="max-w-3xl text-xl lg:text-3xl text-[#475569] font-medium leading-relaxed opacity-80">
                Explore every layer of the GSE Labs ecosystem. From AI mentorship to competitive rankings and deep educational paths.
              </p>
            </div>

            <div className="space-y-10">
              {/* Card 1: Ato AI Mentor */}
              <div className="p-12 lg:p-24 rounded-[4rem] border border-[#F1F5F9] bg-[#F8F9FC] min-h-[500px] flex flex-col lg:flex-row items-center gap-20 hover:shadow-2xl transition-all duration-700">
                <div className="flex-1">
                  <div className="w-20 h-20 bg-[#0F172A] rounded-[2rem] flex items-center justify-center text-white mb-12 shadow-xl shadow-black/10">
                    <Bot size={40} className="text-[#4F46E5]" />
                  </div>
                  <h3 className="text-4xl lg:text-7xl font-black text-[#0F172A] mb-8 tracking-tighter">Ato AI Mentor</h3>
                  <p className="text-xl lg:text-2xl text-[#475569] leading-relaxed font-medium">
                    Ato understands your trade patterns and behavior. Specifically designed for **University Students** and **Diaspora Investors** to navigate the landscape.
                  </p>
                  <p className="mt-6 text-xs font-bold text-[#94A3B8] uppercase tracking-widest">
                    * Zero Financial Advice. Pure Knowledge.
                  </p>
                </div>
                <div className="flex-1 w-full flex flex-col gap-6">
                  <div className="bg-white p-10 rounded-[3.5rem] border border-[#F1F5F9] flex flex-col gap-8 shadow-sm">
                    <div className="flex items-center gap-4">
                      <Bot className="text-[#4F46E5]" />
                      <p className="font-bold text-[#0F172A]">Ato Pattern Recognition</p>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-[#F8F9FC] rounded-2xl border border-[#4F46E5]/10">
                        <p className="text-[10px] font-black text-[#4F46E5] uppercase mb-2">Behavior Insight</p>
                        <p className="text-sm font-bold text-[#0F172A]">"You tend to over-allocate in Mutual Funds during market volatility."</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 & 3: Market & Education (Grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="p-16 rounded-[4rem] border border-[#F1F5F9] bg-white flex flex-col justify-between hover:shadow-2xl transition-all group overflow-hidden">
                  <div>
                    <div className="w-16 h-16 bg-[#4F46E5] rounded-3xl flex items-center justify-center text-white mb-12"><Layers /></div>
                    <h3 className="text-5xl font-black text-[#0F172A] mb-8 tracking-tighter">Market Labs</h3>
                    <p className="text-xl text-[#475569] font-medium leading-relaxed">Trade Stocks and Funds with mechanics identical to the GSE.</p>
                  </div>
                  <img src="/mockups/trading_view.png" alt="Market" className="w-[150%] h-auto mt-20 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                </div>
                <div className="p-16 rounded-[4rem] border border-[#F1F5F9] bg-[#0F172A] text-white flex flex-col justify-between hover:shadow-2xl transition-all">
                  <div>
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-[#4F46E5] mb-12"><GraduationCap /></div>
                    <h3 className="text-5xl font-black mb-8 tracking-tighter">Education Hub</h3>
                    <p className="text-xl text-white/60 font-medium leading-relaxed mb-8">Master curated Learning Paths and earn Mastery Badges.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 font-black text-sm uppercase tracking-widest">GSE PRO</div>
                    <div className="px-6 py-4 bg-[#4F46E5] rounded-2xl font-black text-sm uppercase tracking-widest">FUND MASTER</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Technical Graduation (Lead Gen) */}
              <div className="p-12 lg:p-24 rounded-[4rem] border-2 border-[#4F46E5]/10 bg-white min-h-[600px] flex flex-col lg:flex-row items-center gap-20 hover:border-[#4F46E5]/30 transition-all">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#4F46E5]/5 text-[#4F46E5] text-[11px] font-black uppercase tracking-[0.2em] mb-12">
                    For Partners & Institutions
                  </div>
                  <h3 className="text-4xl lg:text-7xl font-black text-[#0F172A] mb-10 tracking-tighter leading-[0.9]">Technical <br />Graduation.</h3>
                  <p className="text-xl lg:text-2xl text-[#475569] leading-relaxed font-medium mb-12">
                    We qualify the capital before it reaches real markets. Master the sandbox and connect to partner **Brokers and Fund Managers**.
                  </p>
                  <Link href="/contact" className="bg-[#0F172A] text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-[#4F46E5] transition-all flex items-center gap-2 w-fit">
                    Partner Inquiry <ArrowUpRight size={20} />
                  </Link>
                </div>
                <div className="flex-1 w-full bg-[#F8F9FC] p-10 rounded-[3rem] border border-[#F1F5F9] shadow-sm">
                  <div className="flex flex-col gap-6">
                    <p className="text-[11px] font-black text-[#4F46E5] uppercase tracking-widest mb-4">Lead Intelligence</p>
                    <div className="h-4 w-full bg-white rounded-full overflow-hidden border border-[#F1F5F9]">
                      <div className="h-full w-[85%] bg-[#4F46E5]" />
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-[#0F172A]">
                      <span>Qualified Lead Status</span>
                      <span className="text-[#10B981]">READY TO INVEST</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 3: Professional CTA */}
        <section className="py-40 lg:py-80 bg-[#F8F9FC] text-center flex flex-col items-center px-6">
          <div className="reveal-text flex flex-col items-center">
            <h2 className="text-huge text-[#0F172A] mb-20">
              Bridge to <br />
              Reality. <span className="text-[#4F46E5]">Start.</span>
            </h2>

            <div className="flex flex-col items-center gap-14">
              <Link href="/register" className="bg-[#0F172A] text-white px-16 py-8 rounded-[2.5rem] text-xl lg:text-3xl font-black shadow-[0_60px_100px_-30px_rgba(0,0,0,0.3)] hover:bg-[#4F46E5] hover:scale-105 transition-all inline-flex items-center gap-5 group text-center">
                Initialize Simulation <ArrowRight size={32} className="transition-transform group-hover:translate-x-3" />
              </Link>

              <div className="flex flex-wrap justify-center gap-12 mt-10">
                <div className="flex items-center gap-3 text-sm font-black text-[#94A3B8] uppercase tracking-[0.3em]">
                  <CheckCircle2 className="text-[#10B981]" size={20} /> Student Friendly
                </div>
                <div className="flex items-center gap-3 text-sm font-black text-[#94A3B8] uppercase tracking-[0.3em]">
                  <CheckCircle2 className="text-[#10B981]" size={20} /> Diaspora Insights
                </div>
                <div className="flex items-center gap-3 text-sm font-black text-[#94A3B8] uppercase tracking-[0.3em]">
                  <CheckCircle2 className="text-[#10B981]" size={20} /> Learning Paths
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-[#F1F5F9] py-20 lg:py-32 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-20">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="text-[#4F46E5]" size={32} />
                <span className="text-3xl font-black tracking-tighter text-[#0F172A]">GSE.LABS</span>
              </div>
              <p className="max-w-md text-lg text-[#475569] font-medium leading-relaxed">The technical bridge between financial literacy and real-world asset management in Ghana.</p>
            </div>
            <div className="flex flex-col gap-6">
              <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-[0.2em] mb-4">Platform</h4>
              <Link href="/market" className="text-[#475569] hover:text-[#4F46E5] transition-colors font-bold">Market Labs</Link>
              <Link href="/learn" className="text-[#475569] hover:text-[#4F46E5] transition-colors font-bold">Education Hub</Link>
            </div>
            <div className="flex flex-col gap-6">
              <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-[0.2em] mb-4">Contact</h4>
              <Link href="/contact" className="text-[#475569] hover:text-[#4F46E5] transition-colors font-bold">Partner Inquiry</Link>
              <Link href="/support" className="text-[#475569] hover:text-[#4F46E5] transition-colors font-bold">Technical Support</Link>
            </div>
          </div>
          <div className="mt-20 pt-12 border-t border-[#F1F5F9] flex flex-col md:flex-row justify-between items-center gap-8 text-xs font-black text-[#94A3B8] uppercase tracking-widest">
            <p>© 2026 GSE LABS LTD.</p>
            <div className="flex gap-10">
              <span>Privacy</span>
              <span>Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
