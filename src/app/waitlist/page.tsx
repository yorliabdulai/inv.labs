"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ThemeProvider } from "next-themes";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function WaitlistPage() {
    return (
        <ThemeProvider attribute="class">
            <div className="min-h-screen bg-background flex flex-col items-center p-4 relative overflow-x-hidden">
                {/* V3 Global Fluid Background Mesh */}
                <div className="fixed inset-0 pointer-events-none -z-50">
                    <div className="absolute top-[0%] left-[-10%] w-[50%] h-[40%] bg-primary/10 rounded-full blur-[140px] opacity-60 mix-blend-multiply" />
                    <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[160px] opacity-60 mix-blend-multiply" />
                    <div className="absolute top-[60%] left-[20%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[180px] opacity-50 mix-blend-multiply" />
                    <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                </div>

                <div className="w-full max-w-4xl relative z-10 pt-12 pb-24">
                    {/* Navigation / Header */}
                    <div className="flex items-center justify-between mb-12">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-inner transition-transform group-hover:scale-110">
                                iL
                            </div>
                            <span className="font-bold text-lg tracking-tight text-foreground">inv.labs</span>
                        </Link>
                        
                        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all group">
                            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                            Back to Home
                        </Link>
                    </div>

                    {/* Content Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-card/80 backdrop-blur-2xl border border-border rounded-3xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]"
                    >
                        <div className="p-8 md:p-12 border-b border-border">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                                <Sparkles size={12} /> Institutional Access
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4 font-syne">Join the Waitlist</h1>
                            <p className="text-muted-foreground font-medium text-lg max-w-2xl leading-relaxed">
                                Secure your spot for the next generation of investment simulation. We're onboarding new beta users every week carefully to ensure stability.
                            </p>
                        </div>

                        {/* Google Form Embed Container */}
                        <div className="relative bg-white dark:bg-zinc-950 p-2 md:p-6 flex justify-center">
                            <iframe 
                                src="https://docs.google.com/forms/d/e/1FAIpQLSdH5Q6atRFb1t70vhI4g1S2lLpCte7PSVrbDUbogrTHR1p6MQ/viewform?embedded=true" 
                                width="100%" 
                                height="800"
                                frameBorder="0" 
                                marginHeight={0} 
                                marginWidth={0}
                                className="rounded-xl border border-border/10 shadow-sm"
                            >
                                Loading…
                            </iframe>
                            
                            {/* Overlay fix for scrolling if needed, but height 800 should be manageable */}
                        </div>
                        
                        <div className="p-8 bg-muted/30 text-center border-t border-border">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                                By joining, you'll receive early access and beta-testing privileges.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </ThemeProvider>
    );
}
