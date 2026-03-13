"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroller() {
    useEffect(() => {
        // Suppress the native document scrollbar so Lenis is the sole scroll handler
        const html = document.documentElement;
        const prevOverflow = html.style.overflow;
        html.style.overflow = "hidden";

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            overscroll: false,
        });

        let rafId: number;
        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            cancelAnimationFrame(rafId);
            // Restore overflow on unmount (e.g. when navigating to dashboard)
            html.style.overflow = prevOverflow;
        };
    }, []);

    return null;
}
