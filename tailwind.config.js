/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: "hsl(var(--card))",
                "card-foreground": "hsl(var(--card-foreground))",
                text: {
                    primary: "var(--text-primary)",
                    secondary: "var(--text-secondary)",
                    tertiary: "var(--text-tertiary)",
                },
                brand: {
                    DEFAULT: "var(--brand-primary)",
                    hover: "var(--brand-primary-hover)",
                    accent: "var(--brand-accent)",
                },
                status: {
                    success: "var(--color-success)",
                    warning: "var(--color-warning)",
                    error: "var(--color-error)",
                },
                border: {
                    DEFAULT: "var(--border-default)",
                    active: "var(--border-active)",
                },
                // GHANA BUILDS WEALTH TOKENS
                ink: {
                    950: "hsl(var(--ink-950))",
                    900: "hsl(var(--ink-900))",
                    800: "hsl(var(--ink-800))",
                    DEFAULT: "hsl(var(--ink))",
                    muted: "hsl(var(--ink-muted))",
                },
                paper: {
                    DEFAULT: "hsl(var(--paper))",
                    dark: "hsl(var(--paper-dark))",
                    text: "hsl(var(--paper-text))",
                },
                terracotta: {
                    DEFAULT: "hsl(var(--terracotta))",
                    light: "hsl(var(--terracotta-light))",
                },
                "gold-data": "hsl(var(--gold-data))",
                "emerald-gain": "hsl(var(--emerald-gain))",
                "loss-red": "hsl(var(--loss-red))",
                rule: "hsl(var(--rule) / 0.3)",
            },
            fontFamily: {
                sans: ['var(--font-instrument-sans)', 'sans-serif'],
                serif: ['var(--font-instrument-serif)', 'serif'],
                mono: ['var(--font-dm-mono)', 'monospace'],
                "plus-jakarta": ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            borderRadius: {
                'xs': 'var(--radius-xs)',
                'md': 'var(--radius-md)',
                'lg': 'var(--radius-lg)',
                'xl': '24px',
                '2xl': '32px',
                'editorial': 'var(--radius)',
            },
            boxShadow: {
                'sm': 'var(--shadow-sm)',
                'md': 'var(--shadow-md)',
                'premium': 'var(--shadow-premium)',
                'inner': 'var(--shadow-inner)',
            },
            spacing: {
                'header': 'var(--header-height)',
            }
        },
    },
    plugins: [require("tailwindcss-animate")],
}
