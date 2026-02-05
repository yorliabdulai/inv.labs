/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: {
                    DEFAULT: "var(--bg-page)",
                    surface: "var(--bg-surface)",
                    elevated: "var(--bg-surface-elevated)",
                },
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
                }
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            borderRadius: {
                'xs': 'var(--radius-xs)',
                'md': 'var(--radius-md)',
                'lg': 'var(--radius-lg)',
                'xl': '24px',
                '2xl': '32px',
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
    plugins: [],
}
