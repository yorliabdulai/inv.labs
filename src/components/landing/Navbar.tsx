"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll state for backdrop blur
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 dark:bg-card/80 backdrop-blur-md border-b border-border shadow-sm py-3" : "bg-transparent py-5"
                }`}
        >
            <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
                <div className="flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-inner transition-transform group-hover:scale-110">
                            iL
                        </div>
                        <span className="font-bold text-lg tracking-tight text-foreground">inv.labs</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="#how-it-works" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">How it works</Link>
                        <Link href="#features" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Features</Link>
                        <Link href="#trust" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Trust</Link>
                        <Link href="#pricing" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Pricing</Link>
                        <Link href="#faq" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">FAQ</Link>
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold text-foreground hover:text-primary transition-colors uppercase tracking-widest text-[10px]">Login</Link>
                        <Link href="/register" className="bg-primary hover:bg-primary-deep text-white font-black px-6 py-3 rounded-full text-[10px] uppercase tracking-widest shadow-lg transition-all hover:-translate-y-0.5">Start Practicing Free</Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-foreground rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        <motion.div initial={false} animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </motion.div>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-3xl border-b border-border shadow-2xl py-6 px-6 flex flex-col gap-6"
                    >
                        <nav className="flex flex-col gap-2">
                            <Link href="#how-it-works" className="block w-full text-base font-bold text-foreground py-3 px-4 rounded-xl hover:bg-muted transition-colors" onClick={() => setIsOpen(false)}>How it works</Link>
                            <Link href="#features" className="block w-full text-base font-bold text-foreground py-3 px-4 rounded-xl hover:bg-muted transition-colors" onClick={() => setIsOpen(false)}>Features</Link>
                            <Link href="#trust" className="block w-full text-base font-bold text-foreground py-3 px-4 rounded-xl hover:bg-muted transition-colors" onClick={() => setIsOpen(false)}>Trust</Link>
                            <Link href="#pricing" className="block w-full text-base font-bold text-foreground py-3 px-4 rounded-xl hover:bg-muted transition-colors" onClick={() => setIsOpen(false)}>Pricing</Link>
                            <Link href="#faq" className="block w-full text-base font-bold text-foreground py-3 px-4 rounded-xl hover:bg-muted transition-colors" onClick={() => setIsOpen(false)}>FAQ</Link>
                        </nav>
                        <div className="flex flex-col gap-3 mt-2">
                            <Link href="/login" className="flex items-center justify-center w-full text-sm font-bold text-foreground px-4 py-4 rounded-xl border border-border hover:bg-muted transition-colors shadow-sm text-balance break-words text-center" onClick={() => setIsOpen(false)}>Login</Link>
                            <Link href="/register" className="flex items-center justify-center w-full text-sm font-bold text-white bg-primary px-4 py-4 rounded-xl shadow-lg hover:bg-primary-deep transition-colors text-balance break-words text-center" onClick={() => setIsOpen(false)}>Start Practicing Free</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
