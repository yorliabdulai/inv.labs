"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        question: "Is this real money?",
        answer: "No. inv.labs uses virtual money (GH₵10,000 to start) so you can practice trading real stocks without any financial risk."
    },
    {
        question: "Is the stock data real?",
        answer: "Yes! We use live data from the Ghana Stock Exchange (GSE). When prices change in the real market, they change in our simulator too."
    },
    {
        question: "Why should I use this instead of just opening a brokerage account?",
        answer: "Most people lose money when they first start because they don't understand fees, timing, or how to pick stocks. inv.labs lets you make those 'beginner mistakes' for free, so you're actually ready when you use real money."
    },
    {
        question: "What are the fees?",
        answer: "inv.labs is 100% free to use. We even simulate the real fees (like SEC and GSE levies) so you learn exactly how much a real trade would cost you."
    },
    {
        question: "Can I withdraw my virtual earnings?",
        answer: "No. Virtual earnings are for practice and learning purposes only. They cannot be converted to real cash."
    },
    {
        question: "Who is this for?",
        answer: "Anyone in Ghana who wants to invest but feels overwhelmed or afraid. Whether you're a student, a young professional, or just someone looking to grow their wealth."
    },
    {
        question: "Do I need to know about finance to start?",
        answer: "Not at all. inv.labs is designed for absolute beginners. We have our AI guide, Ato, to explain everything in simple terms."
    },
    {
        question: "How do I eventually invest for real?",
        answer: "Once you've built your confidence on inv.labs, we'll help you connect with licensed Ghanaian brokers so you can start your real investment journey."
    }
];

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="relative py-24 md:py-32 bg-background overflow-hidden">
            <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-4xl relative z-10">
                <div className="text-center mb-16 md:mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-[0.9] tracking-tight mb-6"
                    >
                        Common <span className="text-primary">Questions.</span>
                    </motion.h2>
                    <p className="text-lg text-muted-foreground font-medium tracking-tight">
                        Everything you need to know about getting started with inv.labs.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className={`rounded-3xl border transition-all duration-300 ${openIndex === i ? "border-primary/20 bg-primary/5 shadow-sm" : "border-border bg-card hover:border-border/80"
                                }`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 md:p-8 text-left"
                            >
                                <span className={`text-lg md:text-xl font-bold tracking-tight transition-colors ${openIndex === i ? "text-primary" : "text-foreground"
                                    }`}>
                                    {faq.question}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === i ? "bg-primary text-white rotate-180" : "bg-muted text-muted-foreground"
                                    }`}>
                                    {openIndex === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 md:p-8 pt-0 text-muted-foreground font-medium text-lg leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
