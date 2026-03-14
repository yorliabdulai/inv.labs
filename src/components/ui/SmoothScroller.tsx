"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroller() {
    useEffect(() => {
        // Only initialize Lenis on desktop viewports
        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        if (isMobile) return;

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
        };
    }, []);

    return null;
}
