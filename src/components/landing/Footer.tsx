"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: [
      { name: "Simulator", href: "#" },
      { name: "Market Data", href: "#" },
      { name: "Ato AI", href: "#" },
      { name: "Pricing", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Documentation", href: "#" },
      { name: "GSE Guide", href: "#" },
      { name: "Mutual Funds", href: "#" },
      { name: "Blog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About inv.labs", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#" },
      { name: "Partners", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Security", href: "#" },
    ],
  },
];

// ----------------------------------------------------------------------
// MOBILE FOOTER COMPONENT
// ----------------------------------------------------------------------
const MobileAccordionSection = ({ section }: { section: typeof footerLinks[0] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-zinc-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left font-bold text-zinc-900 focus:outline-none"
      >
        <span>{section.title}</span>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? `${section.links.length * 48 + 16}px` : "0px", opacity: isOpen ? 1 : 0 }}
      >
        <ul className="pb-5 space-y-4">
          {section.links.map((link) => (
            <li key={link.name}>
              <Link href={link.href} className="text-zinc-500 hover:text-blue-600 transition-colors text-base font-medium block">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// DESKTOP FOOTER COMPONENT
// ----------------------------------------------------------------------
const DesktopColumn = ({ section }: { section: typeof footerLinks[0] }) => {
  return (
    <div>
      <h4 className="font-bold text-zinc-900 mb-6 tracking-tight">{section.title}</h4>
      <ul className="space-y-4">
        {section.links.map((link) => (
          <li key={link.name}>
            <Link href={link.href} className="text-zinc-500 hover:text-blue-600 transition-colors text-sm font-medium inline-block relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ----------------------------------------------------------------------
// MAIN EXPORT
// ----------------------------------------------------------------------
const Footer = () => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // True JS-based conditional rendering eliminates double-rendering bugs
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile(); // Check immediately on mount
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <footer className="bg-zinc-50 pt-24 pb-12 border-t border-zinc-200 relative isolate">
      {/* Premium ambient glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-20">

          {/* Brand Identity */}
          <div className="max-w-sm">
            <Link href="/" className="inline-block mb-6 group">
              <span className="text-3xl font-black tracking-tighter text-zinc-900 transition-colors group-hover:text-blue-600">
                inv.labs<span className="text-blue-600">.</span>
              </span>
            </Link>
            <p className="text-zinc-500 text-base font-medium leading-relaxed">
              Helping 1,000 Ghanaians become confident investors by 2026. Practice trading, build portfolios, and master the stock market without risking a single cedi.
            </p>
          </div>

          {/* DYNAMIC RENDERING: Only render the correct layout in the DOM */}
          {isMobile === false && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 xl:gap-20 w-full lg:w-auto animate-fade-in">
              {footerLinks.map((section) => (
                <DesktopColumn key={section.title} section={section} />
              ))}
            </div>
          )}

          {isMobile === true && (
            <div className="w-full border-t border-zinc-200 mt-4 animate-fade-in">
              {footerLinks.map((section) => (
                <MobileAccordionSection key={section.title} section={section} />
              ))}
            </div>
          )}

          {/* Hydration fallback (invisible scaffolding if needed) */}
          {isMobile === null && <div className="hidden lg:block w-full min-h-[200px]" />}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-zinc-500 text-sm font-medium">
            © {new Date().getFullYear()} inv.labs. Built in Accra.
          </p>
          <div className="flex items-center gap-8">
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-zinc-400 hover:text-zinc-900 transition-colors text-sm font-bold uppercase tracking-wider relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-zinc-900 after:transition-all hover:after:w-full"
              >
                {social}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
