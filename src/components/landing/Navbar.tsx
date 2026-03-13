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
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md border-b border-zinc-200/50 shadow-sm py-3" : "bg-transparent py-5"
                }`}
        >
            <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
                <div className="flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-inner">
                            iL
                        </div>
                        <span className="font-bold text-lg tracking-tight text-zinc-900">inv.labs</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="#how-it-works" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">How it works</Link>
                        <Link href="#features" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">Features</Link>
                        <Link href="#trust" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">Wall of Love</Link>
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold text-zinc-900 hover:text-blue-600 transition-colors">Log in</Link>
                        <Link href="/register" className="text-sm font-bold text-white bg-zinc-950 px-5 py-2.5 rounded-full hover:bg-blue-600 hover:shadow-md transition-all">Start Free</Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-zinc-900 rounded-full hover:bg-zinc-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-200"
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
                        className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-3xl border-b border-zinc-200 shadow-2xl py-6 px-6 flex flex-col gap-6"
                    >
                        <nav className="flex flex-col gap-2">
                            <Link href="#how-it-works" className="block w-full text-base font-bold text-zinc-900 py-3 px-4 rounded-xl hover:bg-zinc-100/50 transition-colors" onClick={() => setIsOpen(false)}>How it works</Link>
                            <Link href="#features" className="block w-full text-base font-bold text-zinc-900 py-3 px-4 rounded-xl hover:bg-zinc-100/50 transition-colors" onClick={() => setIsOpen(false)}>Features</Link>
                            <Link href="#trust" className="block w-full text-base font-bold text-zinc-900 py-3 px-4 rounded-xl hover:bg-zinc-100/50 transition-colors" onClick={() => setIsOpen(false)}>Wall of Love</Link>
                        </nav>
                        <div className="flex flex-col gap-3 mt-2">
                            <Link href="/login" className="flex items-center justify-center w-full text-sm font-bold text-zinc-900 px-4 py-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm text-balance break-words text-center" onClick={() => setIsOpen(false)}>Log in</Link>
                            <Link href="/register" className="flex items-center justify-center w-full text-sm font-bold text-white bg-blue-600 px-4 py-4 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.39)] hover:bg-blue-500 transition-colors text-balance break-words text-center" onClick={() => setIsOpen(false)}>Start Free</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
